import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, startSession } from '@/lib/auth';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';

/** Switches the active workspace for the current session. */
export const POST = withApi(async (request: Request) => {
  const auth = await requireAuth();
  const parsed = z.object({ workspaceId: z.string().cuid() }).safeParse(await readJson(request));
  if (!parsed.success) return fail('Choose a workspace', 400);

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: auth.user.id, workspaceId: parsed.data.workspaceId, status: 'ACTIVE' },
    include: { workspace: { select: { id: true, name: true, isDisabled: true } } },
  });
  if (!membership) return fail('You are not a member of that workspace', 403);
  if (membership.workspace.isDisabled) return fail('That workspace is disabled', 403);

  await startSession(auth.user.id, membership.workspaceId);
  return ok({ workspaceId: membership.workspaceId, name: membership.workspace.name });
});
