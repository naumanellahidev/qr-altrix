'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Activity, Building2, CalendarDays, Clock, Download, Globe2, MonitorSmartphone, QrCode, RefreshCw, Repeat, Users,
} from 'lucide-react';
import { countryFlag, countryName, deviceLabel } from '@/lib/viz/labels';
import { useVizPalette } from '@/lib/viz/palette';
import { cn, compactNumber, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, InlineLoader } from '@/components/ui/feedback';
import { SectionHeader } from '@/components/ui/page-header';
import { LiveIndicator } from '@/components/dashboard/live-indicator';

// ------------------------------------------------------------------ types (API payloads)

interface LiveScan {
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

interface LiveSnapshot {
  now: string;
  last5m: number;
  last60m: number;
  today: number;
  todayUnique: number;
  allTime: number;
  lastScanAt: string | null;
  perMinute: number[];
}

interface Breakdown {
  label: string;
  value: number;
  share: number;
}

interface Report {
  range: { from: string; to: string };
  totalScans: number;
  uniqueScans: number;
  previousTotalScans: number;
  changePercent: number | null;
  series: { bucket: string; scans: number; unique: number }[];
  countries: Breakdown[];
  cities: Breakdown[];
  devices: Breakdown[];
  browsers: Breakdown[];
  operatingSystems: Breakdown[];
  languages: Breakdown[];
  referrers: Breakdown[];
  campaigns: Breakdown[];
  topCodesDetailed: {
    id: string; name: string; type: string; typeLabel: string; kind: string;
    workspaceId: string; workspaceName: string; scans: number; unique: number;
  }[];
  topWorkspaces: { id: string; name: string; scans: number; codes: number }[];
  byType: { type: string; label: string; scans: number; share: number }[];
  heatmap: number[][];
  activeCodes: number;
  activeWorkspaces: number;
  returningScans: number;
  options: { workspaces: { id: string; name: string }[]; types: { type: string; label: string; kind: string }[] };
}

const RANGES = [
  { key: '24h', label: '24 hours', ms: 864e5 },
  { key: '7d', label: '7 days', ms: 7 * 864e5 },
  { key: '30d', label: '30 days', ms: 30 * 864e5 },
  { key: '90d', label: '90 days', ms: 90 * 864e5 },
  { key: '12m', label: '12 months', ms: 365 * 864e5 },
] as const;
type RangeKey = (typeof RANGES)[number]['key'];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FEED_LIMIT = 60;
/** A burst of scans refreshes the report at most this often. */
const REPORT_REFRESH_MS = 15_000;

function timeAgo(iso: string | null, now: number): string {
  if (!iso) return 'never';
  const seconds = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

function place(scan: Pick<LiveScan, 'country' | 'city'>): string {
  if (!scan.country) return 'Unknown location';
  return scan.city ? `${scan.city}, ${countryName(scan.country)}` : countryName(scan.country);
}

// ------------------------------------------------------------------ view

export function AdminLiveAnalytics() {
  const palette = useVizPalette();
  const timezone = React.useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);

  // ---------------------------------------------------------------- live stream
  const [live, setLive] = React.useState(false);
  const [snapshot, setSnapshot] = React.useState<LiveSnapshot | null>(null);
  const [feed, setFeed] = React.useState<LiveScan[]>([]);
  const [fresh, setFresh] = React.useState<Set<string>>(new Set());
  const [now, setNow] = React.useState(() => Date.now());
  const onNewScans = React.useRef<() => void>(() => undefined);

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const source = new EventSource(`/api/admin/analytics/stream?timezone=${encodeURIComponent(timezone)}`);
    source.onopen = () => setLive(true);
    source.onerror = () => setLive(false); // EventSource reconnects on its own
    source.addEventListener('init', (event) => {
      setFeed((JSON.parse((event as MessageEvent).data) as LiveScan[]).slice(0, FEED_LIMIT));
      setLive(true);
    });
    source.addEventListener('snapshot', (event) => {
      setSnapshot(JSON.parse((event as MessageEvent).data) as LiveSnapshot);
      setLive(true);
    });
    source.addEventListener('scans', (event) => {
      const scans = JSON.parse((event as MessageEvent).data) as LiveScan[];
      setFeed((current) => {
        const known = new Set(current.map((scan) => scan.id));
        const added = scans.filter((scan) => !known.has(scan.id)).reverse();
        return [...added, ...current].slice(0, FEED_LIMIT);
      });
      const ids = scans.map((scan) => scan.id);
      setFresh((current) => new Set([...current, ...ids]));
      setTimeout(() => {
        setFresh((current) => {
          const next = new Set(current);
          for (const id of ids) next.delete(id);
          return next;
        });
      }, 4000);
      onNewScans.current();
    });
    return () => source.close();
  }, [timezone]);

  // ---------------------------------------------------------------- range report
  const [rangeKey, setRangeKey] = React.useState<RangeKey>('7d');
  const [workspaceId, setWorkspaceId] = React.useState('all');
  const [type, setType] = React.useState('all');
  const [report, setReport] = React.useState<Report | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const lastFetch = React.useRef(0);
  const pending = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = React.useCallback(() => {
    const range = RANGES.find((item) => item.key === rangeKey) ?? RANGES[1];
    const to = new Date();
    const from = new Date(to.getTime() - range.ms);
    const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString(), timezone });
    if (workspaceId !== 'all') params.set('workspace_id', workspaceId);
    if (type !== 'all') params.set('type', type);
    return params;
  }, [rangeKey, workspaceId, type, timezone]);

  const load = React.useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      lastFetch.current = Date.now();
      try {
        const response = await fetch(`/api/admin/analytics?${query()}`, { cache: 'no-store' });
        const payload = (await response.json()) as { ok?: boolean; data?: Report; error?: string };
        if (!response.ok || !payload.ok || !payload.data) throw new Error(payload.error ?? 'Could not load the report');
        setReport(payload.data);
        setError(null);
      } catch (cause) {
        setError((cause as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  React.useEffect(() => {
    void load();
  }, [load]);

  // New scans refresh the report too, but a burst only once every REPORT_REFRESH_MS.
  onNewScans.current = () => {
    if (pending.current) return;
    const wait = Math.max(0, REPORT_REFRESH_MS - (Date.now() - lastFetch.current));
    pending.current = setTimeout(() => {
      pending.current = null;
      void load(true);
    }, wait);
  };
  React.useEffect(() => () => {
    if (pending.current) clearTimeout(pending.current);
  }, []);

  const perMinute = React.useMemo(() => {
    if (!snapshot) return [];
    const end = Date.parse(snapshot.now);
    return snapshot.perMinute.map((scans, index) => {
      const minutesAgo = 59 - index;
      const time = new Date(end - minutesAgo * 60_000);
      return {
        label: minutesAgo === 0 ? 'now' : `-${minutesAgo}m`,
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scans,
      };
    });
  }, [snapshot]);

  const series = React.useMemo(() => {
    if (!report) return [];
    const hourly = rangeKey === '24h';
    return report.series.map((point) => {
      const date = new Date(point.bucket);
      // Buckets are wall-clock times in the administrator's zone, encoded as UTC.
      const label = hourly
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
        : date.toLocaleDateString([], { day: 'numeric', month: 'short', timeZone: 'UTC' });
      return { label, scans: point.scans, unique: point.unique };
    });
  }, [report, rangeKey]);

  const exportHref = `/api/admin/analytics?${query()}&format=csv`;
  const rangeLabel = RANGES.find((item) => item.key === rangeKey)?.label ?? '';

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------ live */}
      <section className="space-y-3" aria-label="Live">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <LiveIndicator live={live} />
            <p className="text-[12.5px] text-muted-foreground">
              Last scan: <span className="font-medium text-foreground">{timeAgo(snapshot?.lastScanAt ?? null, now)}</span>
            </p>
          </div>
          <p className="text-[12px] text-muted-foreground">Every scan on every QR code, as it happens.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="Right now" value={formatNumber(snapshot?.last5m ?? 0)} hint="Scans in the last 5 minutes" icon={<Activity />} />
          <StatCard label="Last hour" value={formatNumber(snapshot?.last60m ?? 0)} hint="Scans in the last 60 minutes" icon={<Clock />} />
          <StatCard label="Today" value={formatNumber(snapshot?.today ?? 0)} hint="Since midnight, your time" icon={<CalendarDays />} />
          <StatCard label="Unique today" value={formatNumber(snapshot?.todayUnique ?? 0)} hint="First-time visitors today" icon={<Users />} />
          <StatCard
            label="All time"
            value={compactNumber(snapshot?.allTime ?? 0)}
            hint="Scans of every code"
            icon={<QrCode />}
            className="col-span-2 lg:col-span-1"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_420px]">
          <Card className="p-4 sm:p-5">
            <SectionHeader title="Scans per minute" description="The last 60 minutes, updated as scans arrive." />
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perMinute} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} interval={14} tick={{ fill: palette.axis, fontSize: 11 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} tick={{ fill: palette.axis, fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: palette.grid, opacity: 0.4 }}
                    formatter={(value: number) => [formatNumber(value), 'Scans']}
                    labelFormatter={(_, items) => (items?.[0]?.payload as { time?: string } | undefined)?.time ?? ''}
                    contentStyle={{ background: palette.surface, border: `1px solid ${palette.grid}`, borderRadius: 10, fontSize: 12 }}
                  />
                  <Bar dataKey="scans" fill={palette.categorical[0]} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="flex max-h-[420px] flex-col p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-[13.5px] font-semibold">Live feed</p>
              <Badge variant="outline">{feed.length ? `${feed.length} latest` : 'Waiting'}</Badge>
            </div>
            {feed.length === 0 ? (
              <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
                No scans yet. They appear here the moment someone scans any QR code.
              </p>
            ) : (
              <ol className="min-h-0 flex-1 divide-y divide-border overflow-y-auto" aria-live="polite">
                {feed.map((scan) => (
                  <li
                    key={scan.id}
                    className={cn('flex items-start gap-3 px-4 py-2.5 transition-colors duration-700', fresh.has(scan.id) && 'bg-success/10')}
                  >
                    <span className="mt-0.5 text-[18px] leading-none" aria-hidden>
                      {scan.country ? countryFlag(scan.country) : '🌐'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/codes?q=${encodeURIComponent(scan.codeName)}`}
                          className="truncate text-[13px] font-semibold hover:underline"
                        >
                          {scan.codeName}
                        </Link>
                        <Badge variant={scan.unique ? 'success' : 'outline'} className="shrink-0">
                          {scan.unique ? 'New' : 'Repeat'}
                        </Badge>
                      </span>
                      <span className="block truncate text-[12px] text-muted-foreground">
                        {scan.workspaceName} · {scan.codeTypeLabel}
                      </span>
                      <span className="block truncate text-[12px] text-muted-foreground">
                        {place(scan)}
                        {scan.device ? ` · ${deviceLabel(scan.device)}` : ''}
                        {scan.browser ? ` · ${scan.browser}` : ''}
                      </span>
                    </span>
                    <time dateTime={scan.at} className="shrink-0 text-[11.5px] tabular-nums text-muted-foreground" title={new Date(scan.at).toLocaleString()}>
                      {timeAgo(scan.at, now)}
                    </time>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </section>

      {/* ------------------------------------------------------------ filters */}
      <section className="space-y-4" aria-label="Report">
        <Card className="flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-4">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1" role="radiogroup" aria-label="Period">
            {RANGES.map((item) => (
              <button
                key={item.key}
                type="button"
                role="radio"
                aria-checked={rangeKey === item.key}
                onClick={() => setRangeKey(item.key)}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors',
                  rangeKey === item.key ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Select value={workspaceId} onValueChange={setWorkspaceId}>
              <SelectTrigger className="sm:w-48" aria-label="Workspace">
                <SelectValue placeholder="All workspaces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All workspaces</SelectItem>
                {report?.options.workspaces.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="sm:w-44" aria-label="QR type">
                <SelectValue placeholder="All QR types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All QR types</SelectItem>
                {report?.options.types.map((item) => (
                  <SelectItem key={item.type} value={item.type}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => void load()} aria-label="Refresh the report">
              <RefreshCw /> Refresh
            </Button>
            <Button asChild variant="outline">
              <a href={exportHref}>
                <Download /> Export CSV
              </a>
            </Button>
          </div>
        </Card>

        {error ? (
          <Card className="p-5 text-[13px] text-destructive">{error}</Card>
        ) : !report ? (
          <Card className="p-10">
            <InlineLoader label="Loading the report" />
          </Card>
        ) : (
          <div className={cn('space-y-4 transition-opacity', loading && 'opacity-60')}>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <StatCard
                label={`Scans · ${rangeLabel}`}
                value={formatNumber(report.totalScans)}
                change={report.changePercent}
                changeLabel="vs previous period"
                icon={<Activity />}
              />
              <StatCard label="Unique visitors" value={formatNumber(report.uniqueScans)} hint="Counted once per code" icon={<Users />} />
              <StatCard label="Repeat scans" value={formatNumber(report.returningScans)} hint="Visitors who came back" icon={<Repeat />} />
              <StatCard label="Codes scanned" value={formatNumber(report.activeCodes)} hint="At least one scan" icon={<QrCode />} />
              <StatCard
                label="Active workspaces"
                value={formatNumber(report.activeWorkspaces)}
                hint="With at least one scan"
                icon={<Building2 />}
                className="col-span-2 lg:col-span-1"
              />
            </div>

            {report.totalScans === 0 ? (
              <EmptyState
                icon={<Activity />}
                title="No scans in this period"
                description="Try a longer period or clear the filters. New scans show up in the live feed above straight away."
              />
            ) : (
              <>
                <Card className="p-4 sm:p-5">
                  <SectionHeader title="Scans over time" description={`Total and unique scans · ${rangeLabel}`} />
                  <div className="h-56 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <defs>
                          <linearGradient id="qa-admin-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={palette.categorical[0]} stopOpacity={0.28} />
                            <stop offset="100%" stopColor={palette.categorical[0]} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} tick={{ fill: palette.axis, fontSize: 11 }} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={44} tick={{ fill: palette.axis, fontSize: 11 }} />
                        <Tooltip
                          formatter={(value: number, name: string) => [formatNumber(value), name === 'unique' ? 'Unique' : 'Scans']}
                          contentStyle={{ background: palette.surface, border: `1px solid ${palette.grid}`, borderRadius: 10, fontSize: 12 }}
                        />
                        <Area type="monotone" dataKey="scans" stroke={palette.categorical[0]} strokeWidth={2} fill="url(#qa-admin-fill)" isAnimationActive={false} />
                        <Area type="monotone" dataKey="unique" stroke={palette.categorical[1]} strokeWidth={1.5} fill="transparent" isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Card className="p-4 sm:p-5">
                    <SectionHeader title="Top QR codes" description="Most scanned across the platform" />
                    <ol className="space-y-2">
                      {report.topCodesDetailed.map((code, index) => (
                        <li key={code.id} className="flex items-center gap-3">
                          <span className="w-5 shrink-0 text-right text-[12px] font-semibold text-muted-foreground">{index + 1}</span>
                          <span className="min-w-0 flex-1">
                            <Link href={`/admin/codes?q=${encodeURIComponent(code.name)}`} className="block truncate text-[13px] font-semibold hover:underline">
                              {code.name}
                            </Link>
                            <span className="block truncate text-[12px] text-muted-foreground">
                              {code.workspaceName} · {code.typeLabel}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block text-[13px] font-semibold tabular-nums">{formatNumber(code.scans)}</span>
                            <span className="block text-[11px] text-muted-foreground">{formatNumber(code.unique)} unique</span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <SectionHeader title="Top workspaces" description="Where the scans come from" />
                    <ol className="space-y-2">
                      {report.topWorkspaces.map((workspace, index) => (
                        <li key={workspace.id} className="flex items-center gap-3">
                          <span className="w-5 shrink-0 text-right text-[12px] font-semibold text-muted-foreground">{index + 1}</span>
                          <span className="min-w-0 flex-1">
                            <Link href={`/admin/workspaces?q=${encodeURIComponent(workspace.name)}`} className="block truncate text-[13px] font-semibold hover:underline">
                              {workspace.name}
                            </Link>
                            <span className="block text-[12px] text-muted-foreground">{formatNumber(workspace.codes)} codes</span>
                          </span>
                          <span className="shrink-0 text-[13px] font-semibold tabular-nums">{formatNumber(workspace.scans)}</span>
                        </li>
                      ))}
                    </ol>
                  </Card>
                </div>

                <Card className="p-4 sm:p-5">
                  <SectionHeader title="Busiest days and hours" description="Scans by weekday and hour, in your time zone" />
                  <Heatmap data={report.heatmap} color={palette.categorical[0]} empty={palette.grid} />
                </Card>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <BreakdownCard title="QR types" icon={<QrCode />} rows={report.byType.map((row) => ({ label: row.label, value: row.scans, share: row.share }))} color={palette.categorical[0]} />
                  <BreakdownCard
                    title="Countries"
                    icon={<Globe2 />}
                    rows={report.countries.map((row) => ({ ...row, label: row.label === 'Unknown' ? 'Unknown' : `${countryFlag(row.label)} ${countryName(row.label)}` }))}
                    color={palette.categorical[1]}
                  />
                  <BreakdownCard title="Cities" icon={<Globe2 />} rows={report.cities} color={palette.categorical[2]} />
                  <BreakdownCard
                    title="Devices"
                    icon={<MonitorSmartphone />}
                    rows={report.devices.map((row) => ({ ...row, label: deviceLabel(row.label) }))}
                    color={palette.categorical[3]}
                  />
                  <BreakdownCard title="Browsers" icon={<MonitorSmartphone />} rows={report.browsers} color={palette.categorical[4]} />
                  <BreakdownCard title="Operating systems" icon={<MonitorSmartphone />} rows={report.operatingSystems} color={palette.categorical[5]} />
                  <BreakdownCard title="Languages" icon={<Globe2 />} rows={report.languages} color={palette.categorical[0]} />
                  <BreakdownCard title="Referrers" icon={<Activity />} rows={report.referrers} color={palette.categorical[1]} />
                  <BreakdownCard title="Campaigns (UTM)" icon={<Activity />} rows={report.campaigns} color={palette.categorical[2]} />
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ pieces

function BreakdownCard({
  title,
  icon,
  rows,
  color,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Breakdown[];
  color: string;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="mb-3 flex items-center gap-2 text-[13.5px] font-semibold [&_svg]:size-4 [&_svg]:text-muted-foreground">
        {icon}
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="text-[12.5px] text-muted-foreground">No data in this period.</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.slice(0, 8).map((row) => (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                <span className="min-w-0 truncate">{row.label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatNumber(row.value)} · {row.share}%
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full rounded-full" style={{ width: `${Math.max(2, row.share)}%`, background: color }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Heatmap({ data, color, empty }: { data: number[][]; color: string; empty: string }) {
  const max = Math.max(1, ...data.flat());
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-separate border-spacing-[3px] text-[10.5px]">
        <thead>
          <tr>
            <th className="w-9" />
            {Array.from({ length: 24 }, (_, hour) => (
              <th key={hour} className="font-normal text-muted-foreground">
                {hour % 3 === 0 ? hour : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, day) => (
            <tr key={WEEKDAYS[day]}>
              <th scope="row" className="pr-1 text-left font-medium text-muted-foreground">
                {WEEKDAYS[day]}
              </th>
              {row.map((value, hour) => (
                <td
                  key={hour}
                  title={`${WEEKDAYS[day]} ${String(hour).padStart(2, '0')}:00 · ${formatNumber(value)} scans`}
                  className="h-5 rounded-[4px]"
                  style={{ background: value === 0 ? empty : color, opacity: value === 0 ? 0.45 : 0.25 + 0.75 * (value / max) }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
