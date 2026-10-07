import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './db';
import {
  analyticsOverview, localTimeSql, safeTimezone, sqlConditions, whereClause,
  type AnalyticsFilter, type AnalyticsOverview, type AnalyticsRange,
} from './analytics';
import { getTypeDef } from './qr/catalog';

/**
 * Platform-wide scan analytics for platform administrators: every workspace, every code.
 * The live parts (snapshot and feed) are read every second or two by the admin stream,
 * so they stay on indexed columns (ScanEvent.createdAt) and small windows.
 */

// ------------------------------------------------------------------ live

export interface LiveScan {
  id: string;
  at: string;
  codeId: string;
  codeName: string;
  codeType: string;
  codeTypeLabel: string;
  workspaceId: string;
  workspaceName: string;
  country: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  unique: boolean;
}

export interface LiveSnapshot {
  now: string;
  last5m: number;
  last60m: number;
  today: number;
  todayUnique: number;
  /** All-time scans of every code (the per-code counters the worker keeps). */
  allTime: number;
  lastScanAt: string | null;
  /** Scans per minute for the last 60 minutes, oldest first; the last entry is this minute. */
  perMinute: number[];
}

const LIVE_SELECT = {
  id: true,
  createdAt: true,
  qrCodeId: true,
  workspaceId: true,
  country: true,
  city: true,
  deviceType: true,
  browser: true,
  os: true,
  isUnique: true,
  qrCode: { select: { name: true, type: true } },
  workspace: { select: { name: true } },
} satisfies Prisma.ScanEventSelect;

type LiveRow = Prisma.ScanEventGetPayload<{ select: typeof LIVE_SELECT }>;

function toLiveScan(row: LiveRow): LiveScan {
  const type = String(row.qrCode?.type ?? '');
  return {
    id: row.id,
    at: row.createdAt.toISOString(),
    codeId: row.qrCodeId,
    codeName: row.qrCode?.name ?? 'Deleted code',
    codeType: type,
    codeTypeLabel: getTypeDef(type)?.label ?? type,
    workspaceId: row.workspaceId,
    workspaceName: row.workspace?.name ?? 'Deleted workspace',
    country: row.country,
    city: row.city,
    device: row.deviceType,
    browser: row.browser,
    os: row.os,
    unique: row.isUnique,
  };
}

/**
 * Which scans a live view follows. Empty = the whole platform (administrators); a
 * workspace dashboard always passes its workspace, and may narrow to one code or folder.
 */
export interface LiveScope {
  workspaceId?: string | null;
  qrCodeId?: string | null;
  folderId?: string | null;
}

function scopeWhere(scope: LiveScope): Prisma.ScanEventWhereInput {
  return {
    kind: 'SCAN',
    ...(scope.workspaceId ? { workspaceId: scope.workspaceId } : {}),
    ...(scope.qrCodeId ? { qrCodeId: scope.qrCodeId } : {}),
    ...(scope.folderId ? { qrCode: { folderId: scope.folderId } } : {}),
  };
}

function scopeSql(scope: LiveScope): Prisma.Sql {
  const parts: Prisma.Sql[] = [Prisma.sql`s."kind" = 'SCAN'::"ScanEventKind"`];
  if (scope.workspaceId) parts.push(Prisma.sql`s."workspaceId" = ${scope.workspaceId}`);
  if (scope.qrCodeId) parts.push(Prisma.sql`s."qrCodeId" = ${scope.qrCodeId}`);
  if (scope.folderId) {
    parts.push(Prisma.sql`s."qrCodeId" IN (SELECT q."id" FROM "QRCode" q WHERE q."folderId" = ${scope.folderId})`);
  }
  return Prisma.join(parts, ' AND ');
}

function scopeCodes(scope: LiveScope): Prisma.QRCodeWhereInput {
  return {
    ...(scope.workspaceId ? { workspaceId: scope.workspaceId } : {}),
    ...(scope.qrCodeId ? { id: scope.qrCodeId } : {}),
    ...(scope.folderId ? { folderId: scope.folderId } : {}),
  };
}

/** The most recent scans in scope (the whole platform by default), newest first. */
export async function recentScans(limit = 30, scope: LiveScope = {}): Promise<LiveScan[]> {
  const rows = await prisma.scanEvent.findMany({
    where: scopeWhere(scope),
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: LIVE_SELECT,
  });
  return rows.map(toLiveScan);
}

/**
 * Scans recorded since `since`, oldest first. The worker writes a scan a moment after it
 * happened (with the time it happened), so the stream asks for a window that reaches back
 * further than its last poll and drops the ids it has already sent.
 */
export async function scansSince(since: Date, limit = 200, scope: LiveScope = {}): Promise<LiveScan[]> {
  // Newest first, so a burst larger than the limit still shows its latest scans (the
  // counters in the snapshot stay exact either way); handed back oldest first.
  const rows = await prisma.scanEvent.findMany({
    where: { ...scopeWhere(scope), createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: LIVE_SELECT,
  });
  return rows.reverse().map(toLiveScan);
}

export async function liveSnapshot(timezone = 'UTC', scope: LiveScope = {}): Promise<LiveSnapshot> {
  const zone = safeTimezone(timezone);
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60_000);
  const hourAgo = new Date(now.getTime() - 60 * 60_000);
  const conditions = scopeSql(scope);

  const [last5m, minuteRows, todayRows, counters] = await Promise.all([
    prisma.scanEvent.count({ where: { ...scopeWhere(scope), createdAt: { gte: fiveMinutesAgo } } }),
    prisma.$queryRaw<{ minute: Date; scans: bigint }[]>(Prisma.sql`
      SELECT date_trunc('minute', s."createdAt") AS minute, COUNT(*)::bigint AS scans
      FROM "ScanEvent" s
      WHERE ${conditions} AND s."createdAt" >= ${hourAgo}
      GROUP BY 1
    `),
    // "Today" starts at midnight where the viewer is, not at midnight UTC.
    prisma.$queryRaw<{ scans: bigint; unique_scans: bigint }[]>(Prisma.sql`
      SELECT COUNT(*)::bigint AS scans, COUNT(*) FILTER (WHERE s."isUnique")::bigint AS unique_scans
      FROM "ScanEvent" s
      WHERE ${conditions}
        AND s."createdAt" >= (date_trunc('day', now() AT TIME ZONE ${zone}) AT TIME ZONE ${zone}) AT TIME ZONE 'UTC'
    `),
    prisma.qRCode.aggregate({ where: scopeCodes(scope), _sum: { scanCount: true }, _max: { lastScanAt: true } }),
  ]);

  const byMinute = new Map(minuteRows.map((row) => [new Date(row.minute).getTime(), Number(row.scans)]));
  const thisMinute = Math.floor(now.getTime() / 60_000) * 60_000;
  const perMinute = Array.from({ length: 60 }, (_, index) => byMinute.get(thisMinute - (59 - index) * 60_000) ?? 0);

  return {
    now: now.toISOString(),
    last5m,
    last60m: perMinute.reduce((sum, value) => sum + value, 0),
    today: Number(todayRows[0]?.scans ?? 0),
    todayUnique: Number(todayRows[0]?.unique_scans ?? 0),
    allTime: counters._sum.scanCount ?? 0,
    lastScanAt: counters._max.lastScanAt?.toISOString() ?? null,
    perMinute,
  };
}

// ------------------------------------------------------------------ range report

export interface RankedCode {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  kind: string;
  workspaceId: string;
  workspaceName: string;
  scans: number;
  unique: number;
}

export interface PlatformReport extends AnalyticsOverview {
  topCodesDetailed: RankedCode[];
  topWorkspaces: { id: string; name: string; scans: number; codes: number }[];
  byType: { type: string; label: string; scans: number; share: number }[];
  /** heatmap[weekday][hour], weekday 0 = Monday, in the administrator's time zone. */
  heatmap: number[][];
  activeCodes: number;
  activeWorkspaces: number;
  returningScans: number;
}

export async function platformReport(filter: AnalyticsFilter): Promise<PlatformReport> {
  const zone = safeTimezone(filter.timezone);
  const where = whereClause(filter);

  const [overview, topCodeRows, workspaceRows, typeRows, heatRows, activeRows] = await Promise.all([
    analyticsOverview(filter),
    prisma.$queryRaw<{ qr_code_id: string; scans: bigint; unique_scans: bigint }[]>(Prisma.sql`
      SELECT s."qrCodeId" AS qr_code_id, COUNT(*)::bigint AS scans,
             COUNT(*) FILTER (WHERE s."isUnique")::bigint AS unique_scans
      FROM "ScanEvent" s
      WHERE ${sqlConditions(filter)}
      GROUP BY 1
      ORDER BY 2 DESC
      LIMIT 15
    `),
    prisma.scanEvent.groupBy({
      by: ['workspaceId'],
      where,
      _count: { _all: true },
      orderBy: { _count: { workspaceId: 'desc' } },
      take: 10,
    }),
    prisma.$queryRaw<{ type: string; scans: bigint }[]>(Prisma.sql`
      SELECT q."type"::text AS type, COUNT(*)::bigint AS scans
      FROM "ScanEvent" s JOIN "QRCode" q ON q."id" = s."qrCodeId"
      WHERE ${sqlConditions(filter)}
      GROUP BY 1
      ORDER BY 2 DESC
    `),
    prisma.$queryRaw<{ dow: number; hour: number; scans: bigint }[]>(Prisma.sql`
      SELECT EXTRACT(ISODOW FROM ${localTimeSql(zone)})::int AS dow,
             EXTRACT(HOUR FROM ${localTimeSql(zone)})::int AS hour,
             COUNT(*)::bigint AS scans
      FROM "ScanEvent" s
      WHERE ${sqlConditions(filter)}
      GROUP BY 1, 2
    `),
    prisma.$queryRaw<{ codes: bigint; workspaces: bigint }[]>(Prisma.sql`
      SELECT COUNT(DISTINCT s."qrCodeId")::bigint AS codes, COUNT(DISTINCT s."workspaceId")::bigint AS workspaces
      FROM "ScanEvent" s
      WHERE ${sqlConditions(filter)}
    `),
  ]);

  const [codes, workspaces, workspaceCodeCounts] = await Promise.all([
    topCodeRows.length
      ? prisma.qRCode.findMany({
          where: { id: { in: topCodeRows.map((row) => row.qr_code_id) } },
          select: { id: true, name: true, type: true, kind: true, workspaceId: true, workspace: { select: { name: true } } },
        })
      : [],
    workspaceRows.length
      ? prisma.workspace.findMany({
          where: { id: { in: workspaceRows.map((row) => row.workspaceId) } },
          select: { id: true, name: true },
        })
      : [],
    workspaceRows.length
      ? prisma.qRCode.groupBy({
          by: ['workspaceId'],
          where: { workspaceId: { in: workspaceRows.map((row) => row.workspaceId) }, status: { not: 'DELETED' } },
          _count: { _all: true },
        })
      : [],
  ]);

  const total = overview.totalScans;
  const heatmap = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
  for (const row of heatRows) {
    const day = Number(row.dow) - 1;
    const hour = Number(row.hour);
    if (day >= 0 && day < 7 && hour >= 0 && hour < 24) heatmap[day][hour] = Number(row.scans);
  }

  return {
    ...overview,
    topCodesDetailed: topCodeRows.map((row) => {
      const code = codes.find((item) => item.id === row.qr_code_id);
      const type = String(code?.type ?? '');
      return {
        id: row.qr_code_id,
        name: code?.name ?? 'Deleted code',
        type,
        typeLabel: getTypeDef(type)?.label ?? type,
        kind: String(code?.kind ?? ''),
        workspaceId: code?.workspaceId ?? '',
        workspaceName: code?.workspace?.name ?? 'Deleted workspace',
        scans: Number(row.scans),
        unique: Number(row.unique_scans),
      };
    }),
    topWorkspaces: workspaceRows.map((row) => ({
      id: row.workspaceId,
      name: workspaces.find((item) => item.id === row.workspaceId)?.name ?? 'Deleted workspace',
      scans: row._count._all,
      codes: workspaceCodeCounts.find((item) => item.workspaceId === row.workspaceId)?._count._all ?? 0,
    })),
    byType: typeRows.map((row) => ({
      type: row.type,
      label: getTypeDef(row.type)?.label ?? row.type,
      scans: Number(row.scans),
      share: total > 0 ? Math.round((Number(row.scans) / total) * 1000) / 10 : 0,
    })),
    heatmap,
    activeCodes: Number(activeRows[0]?.codes ?? 0),
    activeWorkspaces: Number(activeRows[0]?.workspaces ?? 0),
    returningScans: Math.max(0, total - overview.uniqueScans),
  };
}

// ------------------------------------------------------------------ export

export interface PlatformExportRow {
  scanned_at: string;
  workspace: string;
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
}

export async function platformExportRows(filter: AnalyticsFilter, limit = 100_000): Promise<PlatformExportRow[]> {
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
      qrCode: { select: { name: true, type: true } },
      workspace: { select: { name: true } },
    },
  });
  return rows.map((row) => ({
    scanned_at: row.createdAt.toISOString(),
    workspace: row.workspace?.name ?? '',
    qr_code: row.qrCode?.name ?? '',
    qr_type: String(row.qrCode?.type ?? ''),
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
  }));
}

export type { AnalyticsRange };
