import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { clearSessionCookie } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/hash';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { logSecurity } from '@/lib/audit';

const schema = z.object({
  password: z.string().max(200).optional(),
  confirm: z.literal('DELETE'),
});

/**
 * Deletes the signed-in user's account. Workspaces they own are deleted with them, which
 * cascades to their QR codes — so the confirmation is deliberately explicit.
 */
export const DELETE = withApi(async (request: Request) => {
  const auth = await requireAuth();

  if (!auth.membership.canDeleteOwnAccount) {
    return fail('An administrator has disabled self-deletion for your account. Ask them to remove it for you.', 403);
  }

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail('Type DELETE to confirm', 400, { fields: { confirm: 'Type DELETE to confirm' } });
  }

  if (auth.user.passwordHash) {
    const valid = await verifyPassword(parsed.data.password ?? '', auth.user.passwordHash);
    if (!valid) {
      return fail('That password is not right', 400, { fields: { password: 'Incorrect password' } });
    }
  }

  const ownedWorkspaces = await prisma.workspace.findMany({
    where: { ownerId: auth.user.id },
    select: { id: true, name: true, _count: { select: { qrCodes: true } } },
  });

  await logSecurity({
    type: 'ACCOUNT_DELETED',
    userId: auth.user.id,
    email: auth.user.email,
    headers: request.headers,
    meta: {
      workspaces: ownedWorkspaces.map((workspace) => workspace.name),
      qrCodes: ownedWorkspaces.reduce((total, workspace) => total + workspace._count.qrCodes, 0),
    },
  });

  // Cascades remove memberships, workspaces, codes, designs, scans and uploads.
  await prisma.user.delete({ where: { id: auth.user.id } });
  await clearSessionCookie();

  return ok({ deleted: true });
});
