import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { fail, ok, withApi } from '@/lib/api/respond';
import { logSecurity } from '@/lib/audit';
import { developerApiGate } from '@/lib/api/developer';

/** Revokes a key immediately. Revoked keys are kept so the audit trail stays complete. */
export const DELETE = withApi(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const gate = await developerApiGate();
  if (gate) return gate;
  const { id } = await context.params;
  const auth = await requireAuth();
  if (!can(auth.role, 'apikey.manage')) return fail('Your role cannot manage API keys', 403);

  const key = await prisma.apiKey.findFirst({ where: { id, workspaceId: auth.workspace.id } });
  if (!key) return fail('API key not found', 404);
  if (key.revokedAt) return ok({ revoked: true });

  await prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });

  await logSecurity({
    type: 'API_KEY_REVOKED',
    userId: auth.user.id,
    workspaceId: auth.workspace.id,
    headers: request.headers,
    meta: { keyId: id, name: key.name },
  });

  return ok({ revoked: true });
});
