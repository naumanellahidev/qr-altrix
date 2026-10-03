import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { checkDomain, checkDomainSsl } from '@/lib/jobs/domain';
import { logSecurity } from '@/lib/audit';

type Context = { params: Promise<{ id: string }> };

/** POST runs an action on the domain: verify, check-ssl or make-default. */
export const POST = withApi(async (request: Request, context: Context) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'domain.manage')) return fail('This key cannot manage domains', 403);

  const domain = await prisma.customDomain.findFirst({ where: { id, workspaceId: actor.workspaceId } });
  if (!domain) return fail('Domain not found', 404);

  const body = await readJson<{ action?: string }>(request);

  switch (body.action) {
    case 'verify': {
      const check = await checkDomain(id);
      return ok({ data: check });
    }
    case 'check-ssl': {
      const active = await checkDomainSsl(id);
      return ok({ data: { sslActive: active } });
    }
    case 'make-default': {
      if (domain.status !== 'VERIFIED') {
        return fail('Verify the domain before making it the default.', 400);
      }
      await prisma.$transaction([
        prisma.customDomain.updateMany({ where: { workspaceId: actor.workspaceId }, data: { isDefault: false } }),
        prisma.customDomain.update({ where: { id }, data: { isDefault: true } }),
        prisma.workspace.update({ where: { id: actor.workspaceId }, data: { defaultDomainId: id } }),
      ]);
      return ok({ data: { isDefault: true } });
    }
    default:
      return fail('Unknown action', 400);
  }
});

/**
 * Removing a domain keeps every QR code working: codes fall back to the platform short
 * link, which still resolves by short code.
 */
export const DELETE = withApi(async (request: Request, context: Context) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'domain.manage')) return fail('This key cannot manage domains', 403);

  const domain = await prisma.customDomain.findFirst({ where: { id, workspaceId: actor.workspaceId } });
  if (!domain) return fail('Domain not found', 404);

  const affected = await prisma.qRCode.count({ where: { customDomainId: id } });
  await prisma.qRCode.updateMany({ where: { customDomainId: id }, data: { customDomainId: null } });
  await prisma.customDomain.delete({ where: { id } });

  if (domain.isDefault) {
    await prisma.workspace.update({ where: { id: actor.workspaceId }, data: { defaultDomainId: null } });
  }

  await logSecurity({
    type: 'DOMAIN_REMOVED',
    userId: actor.userId,
    workspaceId: actor.workspaceId,
    headers: request.headers,
    meta: { host: domain.host, codesMovedToPlatformDomain: affected },
  });

  return ok({ deleted: true, codesMovedToPlatformDomain: affected });
});
