import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { can, canAssignRole } from '@/lib/rbac';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { logSecurity } from '@/lib/audit';
import { randomToken } from '@/lib/utils';
import { inviteEmail, sendMail } from '@/lib/mailer';

type Context = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  role: z.enum(['ADMIN', 'EDITOR', 'ANALYST', 'VIEWER', 'LIMITED']).optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  folderScopes: z.array(z.string().cuid()).max(200).optional(),
  canDeleteOwnAccount: z.boolean().optional(),
  resendInvite: z.boolean().optional(),
});

export const PATCH = withApi(async (request: Request, context: Context) => {
  const { id } = await context.params;
  const auth = await requireAuth();
  if (!can(auth.role, 'team.manage')) return fail('Your role cannot change team members', 403);

  const member = await prisma.workspaceMember.findFirst({
    where: { id, workspaceId: auth.workspace.id },
  });
  if (!member) return fail('Team member not found', 404);
  if (member.role === 'OWNER') return fail('The workspace owner cannot be changed here.', 400);

  const parsed = patchSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail('Check the submitted values', 400);

  if (parsed.data.resendInvite) {
    if (member.status !== 'PENDING') return fail('That invitation was already accepted', 400);
    const token = member.inviteToken ?? randomToken(24);
    await prisma.workspaceMember.update({ where: { id }, data: { inviteToken: token, invitedAt: new Date() } });
    void sendMail(
      inviteEmail({
        email: member.email,
        workspaceName: auth.workspace.name,
        inviterName: auth.user.name ?? auth.user.email,
        role: member.role,
        token,
      }),
    );
    return ok({ resent: true });
  }

  if (parsed.data.role && !canAssignRole(auth.role, parsed.data.role)) {
    return fail('You cannot assign that role', 403);
  }

  const updated = await prisma.workspaceMember.update({
    where: { id },
    data: {
      role: parsed.data.role ?? member.role,
      status: parsed.data.status ?? member.status,
      folderScopes:
        parsed.data.folderScopes === undefined ? undefined : (parsed.data.folderScopes as object),
      canDeleteOwnAccount: parsed.data.canDeleteOwnAccount ?? member.canDeleteOwnAccount,
    },
  });

  if (parsed.data.role && parsed.data.role !== member.role) {
    await logSecurity({
      type: 'ROLE_CHANGED',
      userId: auth.user.id,
      workspaceId: auth.workspace.id,
      headers: request.headers,
      meta: { email: member.email, from: member.role, to: parsed.data.role },
    });
  }
  if (parsed.data.status === 'DISABLED' && member.status !== 'DISABLED') {
    await logSecurity({
      type: 'MEMBER_DISABLED',
      userId: auth.user.id,
      workspaceId: auth.workspace.id,
      headers: request.headers,
      meta: { email: member.email },
    });
  }

  return ok({ data: { id: updated.id, role: updated.role, status: updated.status } });
});

/** Removes someone from the workspace. Their QR codes stay with the workspace. */
export const DELETE = withApi(async (request: Request, context: Context) => {
  const { id } = await context.params;
  const auth = await requireAuth();

  const member = await prisma.workspaceMember.findFirst({ where: { id, workspaceId: auth.workspace.id } });
  if (!member) return fail('Team member not found', 404);
  if (member.role === 'OWNER') return fail('The workspace owner cannot be removed.', 400);

  const removingSelf = member.userId === auth.user.id;
  if (!removingSelf && !can(auth.role, 'team.manage')) {
    return fail('Your role cannot remove team members', 403);
  }

  await prisma.workspaceMember.delete({ where: { id } });

  await logSecurity({
    type: 'MEMBER_DISABLED',
    userId: auth.user.id,
    workspaceId: auth.workspace.id,
    headers: request.headers,
    meta: { email: member.email, removed: true, self: removingSelf },
  });

  return ok({ removed: true });
});
