import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { hashToken } from '@/lib/hash';
import { randomToken } from '@/lib/utils';
import { apiKeySchema } from '@/lib/validation';
import { created, fail, ok, readJson, withApi } from '@/lib/api/respond';
import { logSecurity } from '@/lib/audit';

/**
 * API keys are shown once at creation and stored only as a hash. The prefix is kept in
 * clear so the dashboard can identify a key and a request can look it up cheaply.
 */
export const GET = withApi(async () => {
  const auth = await requireAuth();
  if (!can(auth.role, 'apikey.manage')) return fail('Your role cannot manage API keys', 403);

  const keys = await prisma.apiKey.findMany({
    where: { workspaceId: auth.workspace.id },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true, name: true } } },
  });

  return ok({
    data: keys.map((key) => ({
      id: key.id,
      name: key.name,
      maskedKey: `qra_${key.prefix}_${'•'.repeat(12)}`,
      scopes: key.scopes,
      rateLimit: key.rateLimit,
      lastUsedAt: key.lastUsedAt,
      revokedAt: key.revokedAt,
      createdAt: key.createdAt,
      createdBy: key.user?.name ?? key.user?.email ?? null,
    })),
  });
});

export const POST = withApi(async (request: Request) => {
  const auth = await requireAuth();
  if (!can(auth.role, 'apikey.manage')) return fail('Your role cannot manage API keys', 403);

  const parsed = apiKeySchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Check the key details', 400);

  const active = await prisma.apiKey.count({ where: { workspaceId: auth.workspace.id, revokedAt: null } });
  if (active >= 25) return fail('A workspace can have at most 25 active keys. Revoke one first.', 400);

  // Prefix is indexed; the secret half is never stored.
  let prefix = randomToken(4).slice(0, 8);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const clash = await prisma.apiKey.findUnique({ where: { prefix }, select: { id: true } });
    if (!clash) break;
    prefix = randomToken(4).slice(0, 8);
  }
  const secret = randomToken(16);
  const fullKey = `qra_${prefix}_${secret}`;

  const key = await prisma.apiKey.create({
    data: {
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      name: parsed.data.name,
      prefix,
      keyHash: hashToken(fullKey),
      scopes: parsed.data.scopes,
      rateLimit: parsed.data.rateLimit,
    },
  });

  await logSecurity({
    type: 'API_KEY_CREATED',
    userId: auth.user.id,
    workspaceId: auth.workspace.id,
    headers: request.headers,
    meta: { keyId: key.id, name: key.name, scopes: key.scopes },
  });

  return created({
    data: {
      id: key.id,
      name: key.name,
      scopes: key.scopes,
      rateLimit: key.rateLimit,
      createdAt: key.createdAt,
      // Shown exactly once.
      key: fullKey,
    },
  });
});
