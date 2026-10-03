import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { bulkActionSchema } from '@/lib/validation';
import { logActivity, logSecurity } from '@/lib/audit';

/**
 * POST /api/v1/qr/bulk-action — applies one action to many codes.
 * Used by the table's multi-select toolbar.
 */
export const POST = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;

  const parsed = bulkActionSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Nothing selected', 400);
  const { ids, action, folderId } = parsed.data;

  const permission =
    action === 'delete'
      ? 'qr.delete'
      : action === 'pause' || action === 'resume'
        ? 'qr.pause'
        : action === 'resetScans'
          ? 'stats.reset'
          : 'qr.update';
  if (!actorCan(actor, permission)) return fail('You do not have permission for that action', 403);

  // Scope every action to the caller's workspace, never to raw ids.
  const where = { id: { in: ids }, workspaceId: actor.workspaceId, status: { not: 'DELETED' as const } };

  let affected = 0;

  switch (action) {
    case 'pause': {
      affected = (await prisma.qRCode.updateMany({ where: { ...where, status: 'ACTIVE' }, data: { status: 'PAUSED' } })).count;
      break;
    }
    case 'resume': {
      affected = (await prisma.qRCode.updateMany({ where: { ...where, status: 'PAUSED' }, data: { status: 'ACTIVE' } })).count;
      break;
    }
    case 'delete': {
      affected = (await prisma.qRCode.updateMany({ where, data: { status: 'DELETED', deletedAt: new Date() } })).count;
      break;
    }
    case 'favorite': {
      affected = (await prisma.qRCode.updateMany({ where, data: { isFavorite: true } })).count;
      break;
    }
    case 'unfavorite': {
      affected = (await prisma.qRCode.updateMany({ where, data: { isFavorite: false } })).count;
      break;
    }
    case 'move': {
      if (folderId) {
        const folder = await prisma.folder.findFirst({
          where: { id: folderId, workspaceId: actor.workspaceId },
          select: { id: true },
        });
        if (!folder) return fail('That folder does not exist', 400);
      }
      affected = (await prisma.qRCode.updateMany({ where, data: { folderId: folderId ?? null } })).count;
      break;
    }
    case 'resetScans': {
      const codes = await prisma.qRCode.findMany({ where, select: { id: true } });
      const codeIds = codes.map((code) => code.id);
      await prisma.$transaction([
        prisma.scanEvent.deleteMany({ where: { qrCodeId: { in: codeIds } } }),
        prisma.qRCode.updateMany({
          where: { id: { in: codeIds } },
          data: { scanCount: 0, uniqueScanCount: 0, firstScanAt: null, lastScanAt: null },
        }),
      ]);
      affected = codeIds.length;
      break;
    }
    default:
      return fail('Unknown action', 400);
  }

  await logActivity({
    workspaceId: actor.workspaceId,
    userId: actor.userId,
    action: `qr.bulk.${action}`,
    meta: { requested: ids.length, affected, folderId: folderId ?? null },
  });

  if (action === 'delete' || action === 'pause' || action === 'resume') {
    await logSecurity({
      type: action === 'delete' ? 'QR_DELETED' : action === 'pause' ? 'QR_PAUSED' : 'QR_UNPAUSED',
      userId: actor.userId,
      workspaceId: actor.workspaceId,
      headers: request.headers,
      meta: { bulk: true, affected },
    });
  }

  return ok({ affected, action });
});
