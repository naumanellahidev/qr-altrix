import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { can, canAssignRole } from '@/lib/rbac';
import { inviteSchema } from '@/lib/validation';
import { randomToken } from '@/lib/utils';
import { inviteEmail, sendMail } from '@/lib/mailer';
import { created, fail, ok, readJson, withApi } from '@/lib/api/respond';
import { logSecurity } from '@/lib/audit';

export const GET = withApi(async (request: Request) => {
  // Everyone in a workspace may see who else is in it; only managers may change it.
  const auth = await requireAuth();
  const url = new URL(request.url);
  const roleFilter = url.searchParams.get('role');
  const statusFilter = url.searchParams.get('status');

  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId: auth.workspace.id,
      ...(roleFilter ? { role: roleFilter as never } : {}),
      ...(statusFilter ? { status: statusFilter as never } : {}),
    },
    orderBy: [{ status: 'asc' }, { invitedAt: 'asc' }],
    include: { user: { select: { id: true, email: true, name: true, surname: true, lastAccessAt: true, avatarUrl: true } } },
  });

  return ok({
    data: members.map((member) => ({
      id: member.id,
      email: member.email,
      role: member.role,
      status: member.status,
      invitedAt: member.invitedAt,
      acceptedAt: member.acceptedAt,
      lastAccessAt: member.lastAccessAt ?? member.user?.lastAccessAt ?? null,
      canDeleteOwnAccount: member.canDeleteOwnAccount,
      folderScopes: (member.folderScopes as string[] | null) ?? [],
      isOwner: member.role === 'OWNER',
      isYou: member.userId === auth.user.id,
      user: member.user,
    })),
    meta: { canManage: can(auth.role, 'team.manage'), yourRole: auth.role },
  });
});

export const POST = withApi(async (request: Request) => {
  const auth = await requireAuth();
  if (!can(auth.role, 'team.manage')) return fail('Your role cannot invite people', 403);

  const parsed = inviteSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Check the invitation', 400, {
      fields: { email: parsed.error.issues[0]?.message ?? 'Invalid' },
    });
  }
  if (!canAssignRole(auth.role, parsed.data.role)) {
    return fail('You cannot assign that role', 403);
  }

  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_email: { workspaceId: auth.workspace.id, email: parsed.data.email } },
  });
  if (existing) {
    return fail(
      existing.status === 'PENDING'
        ? 'That person already has a pending invitation.'
        : 'That person is already in this workspace.',
      409,
      { fields: { email: 'Already invited' } },
    );
  }

  const token = randomToken(24);
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });

  const member = await prisma.workspaceMember.create({
    data: {
      workspaceId: auth.workspace.id,
      email: parsed.data.email,
      role: parsed.data.role,
      status: 'PENDING',
      inviteToken: token,
      invitedById: auth.user.id,
      userId: user?.id ?? null,
      folderScopes: parsed.data.folderScopes ? (parsed.data.folderScopes as object) : undefined,
    },
  });

  await logSecurity({
    type: 'USER_INVITED',
    userId: auth.user.id,
    workspaceId: auth.workspace.id,
    headers: request.headers,
    meta: { email: member.email, role: member.role },
  });

  void sendMail(
    inviteEmail({
      email: member.email,
      workspaceName: auth.workspace.name,
      inviterName: auth.user.name ?? auth.user.email,
      role: parsed.data.role,
      token,
    }),
  );

  return created({
    data: { id: member.id, email: member.email, role: member.role, status: member.status },
    meta: { inviteUrl: `/invite/${token}` },
  });
});
