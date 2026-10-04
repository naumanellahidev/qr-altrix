import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { fail, ok, withApi } from '@/lib/api/respond';

/**
 * A tiny "has anything changed?" check for live dashboards. It reads the per-code
 * counters the scan worker maintains (one aggregate over QRCode, not the event table),
 * so polling it every few seconds costs next to nothing. Clients compare `version` and
 * refetch the full analytics only when it moves.
 */
export const GET = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'stats.read')) return fail('This key cannot read statistics', 403);

  const url = new URL(request.url);
  const qrCodeId = url.searchParams.get('qr_code_id') || undefined;
  const folderId = url.searchParams.get('folder_id') || undefined;

  const aggregate = await prisma.qRCode.aggregate({
    where: {
      workspaceId: actor.workspaceId,
      ...(qrCodeId ? { id: qrCodeId } : {}),
      ...(folderId ? { folderId } : {}),
    },
    _sum: { scanCount: true },
    _max: { lastScanAt: true },
  });

  const scans = aggregate._sum.scanCount ?? 0;
  const lastScanAt = aggregate._max.lastScanAt?.toISOString() ?? null;
  return ok(
    { data: { scans, lastScanAt, version: `${scans}:${lastScanAt ?? '-'}` } },
    { headers: { 'cache-control': 'no-store' } },
  );
});

export const dynamic = 'force-dynamic';
