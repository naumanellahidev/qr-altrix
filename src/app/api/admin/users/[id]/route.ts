import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdminApi } from '@/lib/api/admin';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { logActivity, logSecurity } from '@/lib/audit';

const schema = z.object({
  isDisabled: z.boolean().optional(),
  isPlatformAdmin: z.boolean().optional(),
  /** Forces every session for this user to be re-authenticated. */
  signOutEverywhere: z.boolean().optional(),
});

export const PATCH = withApi(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const guard = await requireAdminApi();
  if (!guard.ok) return fail(guard.error, guard.status);

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail('Check the submitted values', 400);

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, isPlatformAdmin: true } });
  if (!user) return fail('User not found', 404);

  if (user.id === guard.auth.user.id && parsed.data.isPlatformAdmin === false) {
    return fail('You cannot remove your own administrator access.', 400);
  }
  if (user.id === guard.auth.user.id && parsed.data.isDisabled === true) {
    return fail('You cannot disable your own account.', 400);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      isDisabled: parsed.data.isDisabled,
      isPlatformAdmin: parsed.data.isPlatformAdmin,
      sessionVersion: parsed.data.signOutEverywhere || parsed.data.isDisabled ? { increment: 1 } : undefined,
    },
  });

  await logActivity({
    userId: guard.auth.user.id,
    action: 'admin.user.updated',
    entityType: 'User',
    entityId: id,
    meta: { email: user.email, ...parsed.data },
  });
  if (parsed.data.isDisabled !== undefined) {
    await logSecurity({
      type: parsed.data.isDisabled ? 'ADMIN_ABUSE_DISABLE' : 'ADMIN_ABUSE_ENABLE',
      userId: id,
      email: user.email,
      headers: request.headers,
      meta: { by: guard.auth.user.email, scope: 'account' },
    });
  }

  return ok({ data: { id: updated.id, isDisabled: updated.isDisabled, isPlatformAdmin: updated.isPlatformAdmin } });
});
