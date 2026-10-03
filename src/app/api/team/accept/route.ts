import { prisma } from '@/lib/db';
import { getAuthContext, startSession } from '@/lib/auth';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { logActivity } from '@/lib/audit';

/**
 * Accepts a workspace invitation for the signed-in user. The invite page signs the user
 * up or in first, then calls this.
 */
export const POST = withApi(async (request: Request) => {
  const body = await readJson<{ token?: string }>(request);
  const token = (body.token ?? '').trim();
  if (!token) return fail('This invitation link is incomplete', 400);

  const auth = await getAuthContext();
  if (!auth) return fail('Sign in or create an account to accept the invitation', 401);

  const member = await prisma.workspaceMember.findUnique({
    where: { inviteToken: token },
    include: { workspace: { select: { id: true, name: true } } },
  });
  if (!member) return fail('This invitation is no longer valid', 404);
  if (member.status === 'ACTIVE') return ok({ accepted: true, workspaceId: member.workspaceId });

  if (member.email.toLowerCase() !== auth.user.email.toLowerCase()) {
    return fail(
      `This invitation was sent to ${member.email}. Sign in with that address to accept it.`,
      403,
    );
  }

  await prisma.workspaceMember.update({
    where: { id: member.id },
    data: {
      userId: auth.user.id,
      status: 'ACTIVE',
      acceptedAt: new Date(),
      inviteToken: null,
      lastAccessAt: new Date(),
    },
  });

  // Switch the session into the workspace they just joined.
  await startSession(auth.user.id, member.workspaceId);

  await logActivity({
    workspaceId: member.workspaceId,
    userId: auth.user.id,
    action: 'team.joined',
    entityType: 'WorkspaceMember',
    entityId: member.id,
    meta: { role: member.role },
  });

  return ok({ accepted: true, workspaceId: member.workspaceId, workspaceName: member.workspace.name });
});
