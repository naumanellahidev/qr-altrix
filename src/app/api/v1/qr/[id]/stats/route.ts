import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { fail, ok, withApi } from '@/lib/api/respond';
import { analyticsOverview, parseRange } from '@/lib/analytics';
import { analyticsDeferred } from '@/lib/queue';

/** GET /api/v1/qr/:id/stats?from=&to=&timezone= */
export const GET = withApi(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  if (!actorCan(result.actor, 'stats.read')) return fail('This key cannot read statistics', 403);

  const qr = await prisma.qRCode.findFirst({
    where: { id, workspaceId: result.actor.workspaceId },
    select: { id: true, name: true, kind: true, scanCount: true, uniqueScanCount: true, firstScanAt: true, lastScanAt: true },
  });
  if (!qr) return fail('QR code not found', 404);

  const url = new URL(request.url);
  const range = parseRange(url.searchParams.get('from'), url.searchParams.get('to'));
  const overview = await analyticsOverview({
    workspaceId: result.actor.workspaceId,
    qrCodeId: id,
    range,
    timezone: url.searchParams.get('timezone') ?? 'UTC',
  });

  return ok({
    data: {
      qrCode: qr,
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      ...overview,
    },
    meta: {
      // With Redis enabled, scans are written by the worker and can lag a few seconds.
      deferredProcessing: analyticsDeferred(),
    },
  });
});
