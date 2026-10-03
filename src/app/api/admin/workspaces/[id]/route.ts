import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdminApi } from '@/lib/api/admin';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { logActivity } from '@/lib/audit';

const schema = z.object({ isDisabled: z.boolean() });

/** Disabling a workspace stops all of its dynamic codes resolving until it is re-enabled. */
export const PATCH = withApi(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const guard = await requireAdminApi();
  if (!guard.ok) return fail(guard.error, guard.status);

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail('Choose whether to disable or enable', 400);

  const workspace = await prisma.workspace.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!workspace) return fail('Workspace not found', 404);

  await prisma.workspace.update({ where: { id }, data: { isDisabled: parsed.data.isDisabled } });

  await logActivity({
    userId: guard.auth.user.id,
    workspaceId: id,
    action: parsed.data.isDisabled ? 'admin.workspace.disabled' : 'admin.workspace.enabled',
    entityType: 'Workspace',
    entityId: id,
    meta: { name: workspace.name },
  });

  return ok({ data: { id, isDisabled: parsed.data.isDisabled } });
});
