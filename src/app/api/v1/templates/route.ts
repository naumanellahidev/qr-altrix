import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { created, fail, ok, readJson, withApi } from '@/lib/api/respond';
import { templateSchema } from '@/lib/validation';
import { logActivity, logSecurity } from '@/lib/audit';

export const GET = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  if (!actorCan(result.actor, 'qr.read')) return fail('This key cannot read templates', 403);

  const templates = await prisma.qRTemplate.findMany({
    where: { workspaceId: result.actor.workspaceId },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
  });

  return ok({ data: templates });
});

export const POST = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'template.manage')) return fail('This key cannot manage templates', 403);

  const parsed = templateSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Check the template', 400);

  const duplicate = await prisma.qRTemplate.findFirst({
    where: { workspaceId: actor.workspaceId, name: { equals: parsed.data.name, mode: 'insensitive' } },
  });
  if (duplicate) return fail('A template with that name already exists', 409, { fields: { name: 'Already in use' } });

  if (parsed.data.isDefault) {
    await prisma.qRTemplate.updateMany({ where: { workspaceId: actor.workspaceId }, data: { isDefault: false } });
  }

  const template = await prisma.qRTemplate.create({
    data: {
      workspaceId: actor.workspaceId,
      name: parsed.data.name,
      design: parsed.data.design as object,
      isDefault: Boolean(parsed.data.isDefault),
    },
  });

  await logSecurity({
    type: 'TEMPLATE_CREATED',
    userId: actor.userId,
    workspaceId: actor.workspaceId,
    headers: request.headers,
    meta: { templateId: template.id, name: template.name },
  });
  await logActivity({
    workspaceId: actor.workspaceId,
    userId: actor.userId,
    action: 'template.created',
    entityType: 'QRTemplate',
    entityId: template.id,
    meta: { name: template.name },
  });

  return created({ data: template });
});
