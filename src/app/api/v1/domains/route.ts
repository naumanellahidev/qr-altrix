import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { created, fail, ok, readJson, withApi } from '@/lib/api/respond';
import { domainSchema } from '@/lib/validation';
import { randomToken } from '@/lib/utils';
import { logSecurity } from '@/lib/audit';
import { TXT_RECORD_NAME } from '@/lib/jobs/domain';

function appHostname(): string {
  try {
    return new URL(env.appUrl).hostname;
  } catch {
    return 'localhost';
  }
}

function dnsInstructions(host: string, token: string) {
  const isApex = host.split('.').length <= 2;
  return {
    verification: {
      type: 'TXT',
      name: `${TXT_RECORD_NAME}.${host}`,
      value: `qr-altrix-verify=${token}`,
      note: 'Add this first — it proves you own the domain.',
    },
    routing: isApex
      ? {
          type: 'A',
          name: host,
          value: 'YOUR.SERVER.IP.ADDRESS',
          note: 'Point the apex domain at the server running QR ALTRIX.',
        }
      : {
          type: 'CNAME',
          name: host,
          value: appHostname(),
          note: 'Point the subdomain at your QR ALTRIX host.',
        },
    ssl: 'Once DNS resolves, run scripts/add-domain.sh on the server to issue the certificate with Certbot.',
  };
}

export const GET = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  if (!actorCan(result.actor, 'qr.read')) return fail('This key cannot read domains', 403);

  const domains = await prisma.customDomain.findMany({
    where: { workspaceId: result.actor.workspaceId },
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { qrCodes: true } } },
  });

  return ok({
    data: domains.map((domain) => ({
      id: domain.id,
      host: domain.host,
      status: domain.status,
      sslStatus: domain.sslStatus,
      isDefault: domain.isDefault,
      verifiedAt: domain.verifiedAt,
      lastCheckedAt: domain.lastCheckedAt,
      lastCheckError: domain.lastCheckError,
      codeCount: domain._count.qrCodes,
      dns: dnsInstructions(domain.host, domain.verifyToken),
    })),
    meta: { fallbackShortDomain: env.shortUrlBase },
  });
});

export const POST = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'domain.manage')) return fail('This key cannot manage domains', 403);

  const parsed = domainSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Enter a valid domain', 400, {
      fields: { host: parsed.error.issues[0]?.message ?? 'Invalid domain' },
    });
  }

  const host = parsed.data.host;
  if (host === appHostname()) {
    return fail('That is the platform domain. Use a domain you own.', 400, { fields: { host: 'Already in use' } });
  }

  const existing = await prisma.customDomain.findUnique({ where: { host } });
  if (existing) {
    return fail(
      existing.workspaceId === actor.workspaceId
        ? 'You have already added this domain.'
        : 'That domain is already connected to another workspace.',
      409,
      { fields: { host: 'Already in use' } },
    );
  }

  const domain = await prisma.customDomain.create({
    data: { workspaceId: actor.workspaceId, host, verifyToken: randomToken(16) },
  });

  await logSecurity({
    type: 'DOMAIN_ADDED',
    userId: actor.userId,
    workspaceId: actor.workspaceId,
    headers: request.headers,
    meta: { host },
  });

  return created({
    data: {
      id: domain.id,
      host: domain.host,
      status: domain.status,
      sslStatus: domain.sslStatus,
      isDefault: domain.isDefault,
      codeCount: 0,
      dns: dnsInstructions(domain.host, domain.verifyToken),
    },
  });
});
