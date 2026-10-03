import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './db';

/**
 * Analytics queries. Aggregation happens in PostgreSQL so a workspace with millions of
 * scans stays responsive, and nothing personally identifying is ever selected.
 */

export type Granularity = 'hour' | 'day' | 'week' | 'month';

export interface AnalyticsRange {
  from: Date;
  to: Date;
}

export interface AnalyticsFilter {
  workspaceId: string;
  qrCodeId?: string | null;
  folderId?: string | null;
  range: AnalyticsRange;
  timezone?: string;
}

export interface SeriesPoint {
  bucket: string;
  scans: number;
  unique: number;
}

export interface Breakdown {
  label: string;
  value: number;
  share: number;
}

export interface AnalyticsOverview {
  totalScans: number;
  uniqueScans: number;
  previousTotalScans: number;
  changePercent: number | null;
  firstScanAt: Date | null;
  lastScanAt: Date | null;
  series: SeriesPoint[];
  countries: Breakdown[];
  cities: Breakdown[];
  devices: Breakdown[];
  browsers: Breakdown[];
  operatingSystems: Breakdown[];
  languages: Breakdown[];
  referrers: Breakdown[];
  hours: { hour: number; scans: number }[];
  topCodes: { id: string; name: string; scans: number }[];
  campaigns: { label: string; value: number; share: number }[];
}

export function defaultRange(days = 30): AnalyticsRange {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, to };
}

export function parseRange(fromRaw?: string | null, toRaw?: string | null, fallbackDays = 30): AnalyticsRange {
  const fallback = defaultRange(fallbackDays);
  const from = fromRaw ? new Date(fromRaw) : fallback.from;
  const to = toRaw ? new Date(toRaw) : fallback.to;
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return fallback;
  if (from > to) return { from: to, to: from };
  return { from, to };
}

export function suggestGranularity(range: AnalyticsRange): Granularity {
  const hours = (range.to.getTime() - range.from.getTime()) / 36e5;
  if (hours <= 48) return 'hour';
  if (hours <= 24 * 90) return 'day';
  if (hours <= 24 * 400) return 'week';
  return 'month';
}

function whereClause(filter: AnalyticsFilter): Prisma.ScanEventWhereInput {
  return {
    workspaceId: filter.workspaceId,
    qrCodeId: filter.qrCodeId ?? undefined,
    kind: 'SCAN',
    createdAt: { gte: filter.range.from, lte: filter.range.to },
    ...(filter.folderId ? { qrCode: { folderId: filter.folderId } } : {}),
  };
}

function toBreakdown(
  rows: { label: string | null; count: number }[],
  total: number,
  fallbackLabel = 'Unknown',
): Breakdown[] {
  return rows.map((row) => ({
    label: row.label && row.label.trim() !== '' ? row.label : fallbackLabel,
    value: row.count,
    share: total > 0 ? Math.round((row.count / total) * 1000) / 10 : 0,
  }));
}

async function groupCount(
  filter: AnalyticsFilter,
  field: 'country' | 'city' | 'deviceType' | 'browser' | 'os' | 'language' | 'referrer' | 'utmCampaign',
  take = 12,
): Promise<{ label: string | null; count: number }[]> {
  const rows = await prisma.scanEvent.groupBy({
    by: [field],
    where: whereClause(filter),
    _count: { _all: true },
    orderBy: { _count: { [field]: 'desc' } } as never,
    take,
  });
  return rows.map((row) => ({
    label: (row as Record<string, unknown>)[field] as string | null,
    count: row._count._all,
  }));
}

const GRANULARITY_SQL: Record<Granularity, string> = {
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
};

/** The zone the viewer picked, if it is one the runtime knows; UTC otherwise. */
export function safeTimezone(value: string | undefined | null): string {
  if (!value || !/^[A-Za-z0-9_+\-/]{3,60}$/.test(value)) return 'UTC';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return value;
  } catch {
    return 'UTC';
  }
}

/**
 * The wall-clock time in `timezone` for an instant, expressed as a UTC Date. Buckets
 * from the database are wall-clock values too, so both live on the same grid.
 */
export function toWallClock(instant: Date, timezone: string): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return new Date(Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second')));
}

/**
 * `ScanEvent.createdAt` is `timestamp without time zone` holding UTC. Postgres reads
 * `ts AT TIME ZONE 'Asia/Karachi'` as "this wall-clock is Karachi time" — the reverse
 * of what is wanted — so the value is first pinned to UTC, then converted:
 * a scan at 20:30 UTC lands in the 01:00 Karachi bucket, not 15:00.
 */
function localTimeSql(timezone: string): Prisma.Sql {
  return Prisma.sql`((s."createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${timezone})`;
}

function sqlConditions(filter: AnalyticsFilter): Prisma.Sql {
  const conditions: Prisma.Sql[] = [
    Prisma.sql`s."workspaceId" = ${filter.workspaceId}`,
    Prisma.sql`s."kind" = 'SCAN'::"ScanEventKind"`,
    Prisma.sql`s."createdAt" >= ${filter.range.from}`,
    Prisma.sql`s."createdAt" <= ${filter.range.to}`,
  ];
  if (filter.qrCodeId) conditions.push(Prisma.sql`s."qrCodeId" = ${filter.qrCodeId}`);
  if (filter.folderId) {
    conditions.push(
      Prisma.sql`s."qrCodeId" IN (SELECT q."id" FROM "QRCode" q WHERE q."folderId" = ${filter.folderId})`,
    );
  }
  return Prisma.join(conditions, ' AND ');
}

export async function scanSeries(filter: AnalyticsFilter, granularity: Granularity): Promise<SeriesPoint[]> {
  const unit = GRANULARITY_SQL[granularity] ?? 'day';
  const timezone = safeTimezone(filter.timezone);

  const rows = await prisma.$queryRaw<{ bucket: Date; scans: bigint; unique_scans: bigint }[]>(Prisma.sql`
    SELECT date_trunc(${unit}, ${localTimeSql(timezone)}) AS bucket,
           COUNT(*)::bigint AS scans,
           COUNT(*) FILTER (WHERE s."isUnique")::bigint AS unique_scans
    FROM "ScanEvent" s
    WHERE ${sqlConditions(filter)}
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  return rows.map((row) => ({
    bucket: row.bucket instanceof Date ? row.bucket.toISOString() : String(row.bucket),
    scans: Number(row.scans),
    unique: Number(row.unique_scans),
  }));
}

/** Fills gaps so a chart shows zero-scan days instead of skipping them. */
export function densifySeries(
  series: SeriesPoint[],
  range: AnalyticsRange,
  granularity: Granularity,
  timezone = 'UTC',
): SeriesPoint[] {
  const stepMs =
    granularity === 'hour' ? 36e5 : granularity === 'day' ? 864e5 : granularity === 'week' ? 6048e5 : 0;
  if (stepMs === 0) return series;

  // The grid is built in the same wall-clock terms as the buckets (see toWallClock), and
  // aligned the way date_trunc aligns: to the hour, to midnight, or to Monday.
  const map = new Map(series.map((point) => [new Date(point.bucket).getTime(), point]));
  const out: SeriesPoint[] = [];
  const zone = safeTimezone(timezone);
  const start = toWallClock(range.from, zone);
  const end = toWallClock(range.to, zone);
  if (granularity === 'hour') start.setUTCMinutes(0, 0, 0);
  else start.setUTCHours(0, 0, 0, 0);
  if (granularity === 'week') start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));

  for (let t = start.getTime(); t <= end.getTime(); t += stepMs) {
    const existing = map.get(t);
    out.push(existing ?? { bucket: new Date(t).toISOString(), scans: 0, unique: 0 });
  }
  // Keep any buckets the database returned that fell outside the generated grid.
  for (const point of series) {
    if (!out.some((p) => p.bucket === point.bucket)) out.push(point);
  }
  return out.sort((a, b) => a.bucket.localeCompare(b.bucket)).slice(-800);
}

export async function analyticsOverview(filter: AnalyticsFilter): Promise<AnalyticsOverview> {
  const granularity = suggestGranularity(filter.range);
  const where = whereClause(filter);
  const spanMs = filter.range.to.getTime() - filter.range.from.getTime();
  const previousRange: AnalyticsRange = {
    from: new Date(filter.range.from.getTime() - spanMs),
    to: filter.range.from,
  };

  const [totals, previousTotal, bounds, series, countries, cities, devices, browsers, oses, languages, referrers, hourRows, topCodeRows, campaigns] =
    await Promise.all([
      prisma.scanEvent.aggregate({
        where,
        _count: { _all: true },
      }),
      prisma.scanEvent.count({ where: { ...where, createdAt: { gte: previousRange.from, lt: previousRange.to } } }),
      prisma.scanEvent.aggregate({
        where,
        _min: { createdAt: true },
        _max: { createdAt: true },
      }),
      scanSeries(filter, granularity),
      groupCount(filter, 'country'),
      groupCount(filter, 'city'),
      groupCount(filter, 'deviceType', 6),
      groupCount(filter, 'browser'),
      groupCount(filter, 'os'),
      groupCount(filter, 'language'),
      groupCount(filter, 'referrer'),
      // Hour of day in the zone the viewer picked. The stored `hourOfDay` column is UTC,
      // which mislabelled the chart for anyone not on UTC.
      prisma.$queryRaw<{ hour: number; scans: bigint }[]>(Prisma.sql`
        SELECT EXTRACT(HOUR FROM ${localTimeSql(safeTimezone(filter.timezone))})::int AS hour,
               COUNT(*)::bigint AS scans
        FROM "ScanEvent" s
        WHERE ${sqlConditions(filter)}
        GROUP BY 1
      `),
      prisma.scanEvent.groupBy({
        by: ['qrCodeId'],
        where,
        _count: { _all: true },
        orderBy: { _count: { qrCodeId: 'desc' } },
        take: 10,
      }),
      groupCount(filter, 'utmCampaign', 10),
    ]);

  const uniqueScans = await prisma.scanEvent.count({ where: { ...where, isUnique: true } });
  const totalScans = totals._count._all;

  const codeNames = topCodeRows.length
    ? await prisma.qRCode.findMany({
        where: { id: { in: topCodeRows.map((r) => r.qrCodeId) } },
        select: { id: true, name: true },
      })
    : [];

  const hours = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    scans: Number(hourRows.find((row) => Number(row.hour) === hour)?.scans ?? 0),
  }));

  const changePercent =
    previousTotal === 0 ? (totalScans > 0 ? null : 0) : Math.round(((totalScans - previousTotal) / previousTotal) * 1000) / 10;

  return {
    totalScans,
    uniqueScans,
    previousTotalScans: previousTotal,
    changePercent,
    firstScanAt: bounds._min.createdAt ?? null,
    lastScanAt: bounds._max.createdAt ?? null,
    series: densifySeries(series, filter.range, granularity, filter.timezone),
    countries: toBreakdown(countries, totalScans),
    cities: toBreakdown(cities, totalScans),
    devices: toBreakdown(devices, totalScans),
    browsers: toBreakdown(browsers, totalScans),
    operatingSystems: toBreakdown(oses, totalScans),
    languages: toBreakdown(languages, totalScans),
    referrers: toBreakdown(referrers, totalScans, 'Direct / camera app'),
    hours,
    topCodes: topCodeRows.map((row) => ({
      id: row.qrCodeId,
      name: codeNames.find((c) => c.id === row.qrCodeId)?.name ?? 'Deleted code',
      scans: row._count._all,
    })),
    campaigns: toBreakdown(campaigns, totalScans, 'No campaign'),
  };
}

export interface ExportRow {
  scanned_at: string;
  qr_code: string;
  qr_type: string;
  country: string;
  region: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  language: string;
  referrer: string;
  unique_visitor: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  destination: string;
}

export async function analyticsExportRows(filter: AnalyticsFilter, limit = 100_000): Promise<ExportRow[]> {
  const rows = await prisma.scanEvent.findMany({
    where: whereClause(filter),
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      createdAt: true,
      country: true,
      region: true,
      city: true,
      deviceType: true,
      browser: true,
      os: true,
      language: true,
      referrer: true,
      isUnique: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      destinationUrl: true,
      qrCode: { select: { name: true, type: true } },
    },
  });

  return rows.map((row) => ({
    scanned_at: row.createdAt.toISOString(),
    qr_code: row.qrCode?.name ?? '',
    qr_type: row.qrCode?.type ?? '',
    country: row.country ?? '',
    region: row.region ?? '',
    city: row.city ?? '',
    device: row.deviceType ?? '',
    browser: row.browser ?? '',
    os: row.os ?? '',
    language: row.language ?? '',
    referrer: row.referrer ?? '',
    unique_visitor: row.isUnique ? 'yes' : 'no',
    utm_source: row.utmSource ?? '',
    utm_medium: row.utmMedium ?? '',
    utm_campaign: row.utmCampaign ?? '',
    destination: row.destinationUrl ?? '',
  }));
}

export function rowsToCsv(rows: Record<string, string>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value: string) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n');
}

export async function resetWorkspaceAnalytics(workspaceId: string, qrCodeId?: string | null): Promise<number> {
  const result = await prisma.scanEvent.deleteMany({
    where: { workspaceId, qrCodeId: qrCodeId ?? undefined },
  });
  await prisma.qRCode.updateMany({
    where: { workspaceId, id: qrCodeId ?? undefined },
    data: { scanCount: 0, uniqueScanCount: 0, firstScanAt: null, lastScanAt: null },
  });
  return result.count;
}

// Display labels live in lib/viz/labels so the client charts can share them.
export { COUNTRY_NAMES, countryName, countryFlag, deviceLabel } from './viz/labels';
