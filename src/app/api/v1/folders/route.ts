import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { created, fail, ok, readJson, withApi } from '@/lib/api/respond';
import { folderSchema } from '@/lib/validation';
import { logActivity } from '@/lib/audit';

/** GET /api/v1/folders — list folders with code counts. POST — create one. */
export const GET = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  if (!actorCan(result.actor, 'qr.read')) return fail('This key cannot read folders', 403);

  const url = new URL(request.url);
  const search = url.searchParams.get('search')?.trim();

  const folders = await prisma.folder.findMany({
    where: {
      workspaceId: result.actor.workspaceId,
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    },
    orderBy: { name: 'asc' },
    include: { _count: { select: { qrCodes: true } } },
  });

  const unfiled = await prisma.qRCode.count({
    where: { workspaceId: result.actor.workspaceId, folderId: null, status: { not: 'DELETED' } },
  });

  return ok({
    data: folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      color: folder.color,
      codeCount: folder._count.qrCodes,
      createdAt: folder.createdAt,
    })),
    meta: { unfiled },
  });
});

export const POST = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'folder.manage')) return fail('This key cannot manage folders', 403);

  const parsed = folderSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Name the folder', 400);

  const existing = await prisma.folder.findFirst({
    where: { workspaceId: actor.workspaceId, name: { equals: parsed.data.name, mode: 'insensitive' } },
  });
  if (existing) return fail('A folder with that name already exists', 409, { fields: { name: 'Already in use' } });

  const folder = await prisma.folder.create({
    data: { workspaceId: actor.workspaceId, name: parsed.data.name, color: parsed.data.color ?? null },
  });

  await logActivity({
    workspaceId: actor.workspaceId,
    userId: actor.userId,
    action: 'folder.created',
    entityType: 'Folder',
    entityId: folder.id,
    meta: { name: folder.name },
  });

  return created({ data: { id: folder.id, name: folder.name, color: folder.color, codeCount: 0 } });
});
