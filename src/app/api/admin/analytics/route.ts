import { prisma } from '@/lib/db';
import { requireAdminApi } from '@/lib/api/admin';
import { fail, fileResponse, ok, withApi } from '@/lib/api/respond';
import { parseRange, rowsToCsv } from '@/lib/analytics';
import { platformExportRows, platformReport } from '@/lib/admin-analytics';
import { QR_TYPES } from '@/lib/qr/catalog';
import { logActivity } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/** Longest period one report may cover, so a single request cannot scan years of events. */
const MAX_RANGE_MS = 400 * 864e5;

/**
 * GET /api/admin/analytics — scan analytics across the whole platform (administrators).
 * `from`/`to` (ISO), `timezone`, optional `workspace_id` and `type`; `format=csv` exports
 * the raw scans instead of the report.
 */
export const GET = withApi(async (request: Request) => {
  const guard = await requireAdminApi();
  if (!guard.ok) return fail(guard.error, guard.status);

  const url = new URL(request.url);
  const range = parseRange(url.searchParams.get('from'), url.searchParams.get('to'));
  if (range.to.getTime() - range.from.getTime() > MAX_RANGE_MS) {
    range.from = new Date(range.to.getTime() - MAX_RANGE_MS);
  }
  const type = url.searchParams.get('type');
  const filter = {
    workspaceId: url.searchParams.get('workspace_id') || null,
    qrType: type && QR_TYPES.some((item) => item.type === type) ? type : null,
    range,
    timezone: url.searchParams.get('timezone') ?? 'UTC',
  };

  if (url.searchParams.get('format') === 'csv') {
    const rows = await platformExportRows(filter);
    await logActivity({
      userId: guard.auth.user.id,
      action: 'admin.analytics.exported',
      meta: { rows: rows.length, workspaceId: filter.workspaceId, type: filter.qrType },
    });
    return fileResponse(Buffer.from(rowsToCsv(rows as unknown as Record<string, string>[]), 'utf8'), {
      contentType: 'text/csv; charset=utf-8',
      filename: `qr-altrix-platform-scans-${range.from.toISOString().slice(0, 10)}.csv`,
    });
  }

  const [report, workspaces] = await Promise.all([
    platformReport(filter),
    prisma.workspace.findMany({ orderBy: { name: 'asc' }, take: 500, select: { id: true, name: true } }),
  ]);

  return ok(
    {
      data: {
        range: { from: range.from.toISOString(), to: range.to.toISOString() },
        ...report,
        options: {
          workspaces,
          types: QR_TYPES.map((item) => ({ type: item.type, label: item.label, kind: item.kind })),
        },
      },
    },
    { headers: { 'cache-control': 'no-store' } },
  );
});
