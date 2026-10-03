import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { folderSchema } from '@/lib/validation';
import { logActivity } from '@/lib/audit';

type Context = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (request: Request, context: Context) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'folder.manage')) return fail('This key cannot manage folders', 403);

  const parsed = folderSchema.partial().safeParse(await readJson(request));
  if (!parsed.success) return fail('Check the folder name', 400);

  const folder = await prisma.folder.findFirst({ where: { id, workspaceId: actor.workspaceId } });
  if (!folder) return fail('Folder not found', 404);

  const updated = await prisma.folder.update({
    where: { id },
    data: {
      name: parsed.data.name ?? folder.name,
      color: parsed.data.color === undefined ? folder.color : parsed.data.color,
    },
  });

  await logActivity({
    workspaceId: actor.workspaceId,
    userId: actor.userId,
    action: 'folder.renamed',
    entityType: 'Folder',
    entityId: id,
    meta: { from: folder.name, to: updated.name },
  });

  return ok({ data: { id: updated.id, name: updated.name, color: updated.color } });
});

/**
 * Deleting a folder never deletes the codes inside it — they move back to "unfiled",
 * because losing a printed code to a folder cleanup would be unforgivable.
 */
export const DELETE = withApi(async (request: Request, context: Context) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'folder.manage')) return fail('This key cannot manage folders', 403);

  const folder = await prisma.folder.findFirst({ where: { id, workspaceId: actor.workspaceId } });
  if (!folder) return fail('Folder not found', 404);

  const moved = await prisma.qRCode.updateMany({ where: { folderId: id }, data: { folderId: null } });
  await prisma.folder.delete({ where: { id } });

  await logActivity({
    workspaceId: actor.workspaceId,
    userId: actor.userId,
    action: 'folder.deleted',
    entityType: 'Folder',
    entityId: id,
    meta: { name: folder.name, codesMoved: moved.count },
  });

  return ok({ deleted: true, codesMoved: moved.count });
});
