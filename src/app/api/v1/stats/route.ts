import * as XLSX from 'xlsx';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { fail, fileResponse, ok, withApi } from '@/lib/api/respond';
import {
  analyticsExportRows, analyticsOverview, parseRange, resetWorkspaceAnalytics, rowsToCsv,
} from '@/lib/analytics';
import { analyticsDeferred } from '@/lib/queue';
import { logActivity, logSecurity } from '@/lib/audit';

/**
 * GET /api/v1/stats — workspace-wide analytics.
 * `?format=csv|xlsx` exports the raw scan rows instead of the aggregated overview.
 */
export const GET = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'stats.read')) return fail('This key cannot read statistics', 403);

  const url = new URL(request.url);
  const range = parseRange(url.searchParams.get('from'), url.searchParams.get('to'));
  const filter = {
    workspaceId: actor.workspaceId,
    qrCodeId: url.searchParams.get('qr_code_id'),
    folderId: url.searchParams.get('folder_id'),
    range,
    timezone: url.searchParams.get('timezone') ?? 'UTC',
  };

  const format = url.searchParams.get('format');
  if (format === 'csv' || format === 'xlsx') {
    if (!actorCan(actor, 'stats.export')) return fail('Your role cannot export statistics', 403);

    const rows = await analyticsExportRows(filter);
    void logActivity({
      workspaceId: actor.workspaceId,
      userId: actor.userId,
      action: 'stats.exported',
      meta: { format, rows: rows.length },
    });

    if (format === 'csv') {
      return fileResponse(Buffer.from(rowsToCsv(rows as unknown as Record<string, string>[]), 'utf8'), {
        contentType: 'text/csv; charset=utf-8',
        filename: `qr-altrix-scans-${range.from.toISOString().slice(0, 10)}.csv`,
      });
    }

    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Scans');
    const buffer = XLSX.write(book, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    return fileResponse(buffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `qr-altrix-scans-${range.from.toISOString().slice(0, 10)}.xlsx`,
    });
  }

  const overview = await analyticsOverview(filter);
  return ok({
    data: { range: { from: range.from.toISOString(), to: range.to.toISOString() }, ...overview },
    meta: { deferredProcessing: analyticsDeferred() },
  });
});

/** DELETE /api/v1/stats — resets analytics for the workspace or one code. */
export const DELETE = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'stats.reset')) return fail('Your role cannot reset statistics', 403);

  const url = new URL(request.url);
  const qrCodeId = url.searchParams.get('qr_code_id');
  const removed = await resetWorkspaceAnalytics(actor.workspaceId, qrCodeId);

  await logSecurity({
    type: 'QR_SCANS_RESET',
    userId: actor.userId,
    workspaceId: actor.workspaceId,
    headers: request.headers,
    meta: { scope: qrCodeId ? 'single' : 'workspace', removed },
  });

  return ok({ removed });
});
