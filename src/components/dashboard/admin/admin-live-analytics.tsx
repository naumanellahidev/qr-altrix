'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Activity, Building2, Download, Globe2, MonitorSmartphone, QrCode, RefreshCw, Repeat, Users,
} from 'lucide-react';
import { countryFlag, countryName, deviceLabel } from '@/lib/viz/labels';
import { useVizPalette } from '@/lib/viz/palette';
import { cn, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, InlineLoader } from '@/components/ui/feedback';
import { SectionHeader } from '@/components/ui/page-header';
import { LiveScanPanel } from '@/components/dashboard/live-scan-panel';
import { useLiveScans } from '@/lib/hooks/use-live-scans';

// ------------------------------------------------------------------ types (API payloads)

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

// ------------------------------------------------------------------ view

function jump(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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
  const onNewScans = React.useRef<() => void>(() => undefined);
  const { live, counters: snapshot, feed, fresh } = useLiveScans({
    endpoint: '/api/admin/analytics/stream',
    feedLimit: FEED_LIMIT,
    onChange: () => onNewScans.current(),
  });

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
      <LiveScanPanel
        live={live}
        counters={snapshot}
        feed={feed}
        fresh={fresh}
        codeHref={(scan) => `/admin/codes?q=${encodeURIComponent(scan.codeName)}`}
        rowContext={(scan) => `${scan.workspaceName} · ${scan.codeTypeLabel}`}
        allTimeHref="/admin/codes"
        allTimeHint="Scans of every code"
        subtitle="Every scan on every QR code, as it happens."
        emptyText="No scans yet. They appear here the moment someone scans any QR code."
        idPrefix="admin-live"
      />

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
                onClick={() => jump('admin-report-series')}
              />
              <StatCard label="Unique visitors" value={formatNumber(report.uniqueScans)} hint="Counted once per code" icon={<Users />} onClick={() => jump('admin-report-series')} />
              <StatCard label="Repeat scans" value={formatNumber(report.returningScans)} hint="Visitors who came back" icon={<Repeat />} onClick={() => jump('admin-report-heatmap')} />
              <StatCard label="Codes scanned" value={formatNumber(report.activeCodes)} hint="At least one scan" icon={<QrCode />} onClick={() => jump('admin-report-codes')} />
              <StatCard
                label="Active workspaces"
                value={formatNumber(report.activeWorkspaces)}
                hint="With at least one scan"
                icon={<Building2 />}
                className="col-span-2 lg:col-span-1"
                onClick={() => jump('admin-report-workspaces')}
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
                <Card className="scroll-mt-20 p-4 sm:p-5" id="admin-report-series">
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
                  <Card className="scroll-mt-20 p-4 sm:p-5" id="admin-report-codes">
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

                  <Card className="scroll-mt-20 p-4 sm:p-5" id="admin-report-workspaces">
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

                <Card className="scroll-mt-20 p-4 sm:p-5" id="admin-report-heatmap">
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
