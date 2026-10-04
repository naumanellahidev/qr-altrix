'use client';

import * as React from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Clock, Download, FileSpreadsheet, Globe2, Info, Languages, Link2, Monitor, MousePointerClick,
  RotateCcw, Smartphone, Users,
} from 'lucide-react';
import { countryFlag, countryName } from '@/lib/viz/labels';
import { useVizPalette } from '@/lib/viz/palette';
import { cn, compactNumber, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTriggerLine } from '@/components/ui/tabs';
import { Alert, EmptyState, InlineLoader } from '@/components/ui/feedback';
import { SectionHeader } from '@/components/ui/page-header';
import { ConfirmDialog } from '@/components/ui/confirm';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useDateFormat, DATE, DATE_TIME, TIME } from '@/lib/hooks/use-date-format';
import { useLiveScans } from '@/lib/hooks/use-live-scans';
import { LiveIndicator } from '@/components/dashboard/live-indicator';

export interface Breakdown {
  label: string;
  value: number;
  share: number;
}

export interface AnalyticsPayload {
  totalScans: number;
  uniqueScans: number;
  changePercent: number | null;
  firstScanAt: string | null;
  lastScanAt: string | null;
  series: { bucket: string; scans: number; unique: number }[];
  countries: Breakdown[];
  cities: Breakdown[];
  devices: Breakdown[];
  browsers: Breakdown[];
  operatingSystems: Breakdown[];
  languages: Breakdown[];
  referrers: Breakdown[];
  hours: { hour: number; scans: number }[];
  topCodes: { id: string; name: string; scans: number }[];
  campaigns: Breakdown[];
}

export interface AnalyticsViewProps {
  initial: AnalyticsPayload;
  deferredProcessing: boolean;
  codes: { id: string; name: string }[];
  folders: { id: string; name: string }[];
  selectedCodeId?: string | null;
  canExport: boolean;
  canReset: boolean;
  timezone: string;
}

const RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
];

const TIMEZONES = [
  'UTC', 'Asia/Karachi', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Europe/London',
  'Europe/Berlin', 'Europe/Istanbul', 'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Australia/Sydney',
];

function rangeToDates(range: string): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  if (range === 'all') from.setFullYear(from.getFullYear() - 10);
  else from.setDate(from.getDate() - Number(range));
  return { from: from.toISOString(), to: to.toISOString() };
}

/**
 * Buckets come from `date_trunc(... AT TIME ZONE <chosen zone>)`: wall-clock values that
 * are already in the zone picked above the chart. Formatting them in the browser's zone
 * would shift them a second time (an hourly chart viewed from Karachi moved five hours),
 * so they are printed in UTC, which leaves the wall-clock untouched — and renders the
 * same on server and client.
 */
function formatBucket(bucket: string, granularity: 'hour' | 'day' | 'month'): string {
  const date = new Date(bucket);
  if (Number.isNaN(date.getTime())) return bucket;
  const options: Intl.DateTimeFormatOptions =
    granularity === 'hour'
      ? { hour: '2-digit', minute: '2-digit', hour12: false }
      : granularity === 'month'
        ? { month: 'short', year: '2-digit' }
        : { day: '2-digit', month: 'short' };
  return date.toLocaleString('en-GB', { ...options, timeZone: 'UTC' });
}

/** Share list: a bar chart and its table reading in one, so values are never colour-only. */
function BreakdownList({
  rows,
  icon,
  emptyLabel,
  renderLabel,
  color,
  total,
}: {
  rows: Breakdown[];
  icon?: React.ReactNode;
  emptyLabel: string;
  renderLabel?: (label: string) => React.ReactNode;
  color: string;
  total: number;
}) {
  if (rows.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-surface-muted/50 px-3 py-6 text-center text-[12.5px] text-muted-foreground">
        {icon}
        {emptyLabel}
      </p>
    );
  }

  return (
    <table className="w-full text-[13px]">
      <caption className="sr-only">Scan breakdown with counts and share of total</caption>
      <thead className="sr-only">
        <tr>
          <th>Name</th>
          <th>Scans</th>
          <th>Share</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td className="py-1.5 pr-3 align-middle">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate">{renderLabel ? renderLabel(row.label) : row.label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatNumber(row.value)}
                  <span className="ml-1.5 text-[11.5px]">{row.share}%</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, total > 0 ? (row.value / Math.max(...rows.map((r) => r.value))) * 100 : 0)}%`,
                    background: color,
                  }}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AnalyticsView({
  initial,
  deferredProcessing,
  codes,
  folders,
  selectedCodeId,
  canExport,
  canReset,
  timezone: initialTimezone,
}: AnalyticsViewProps) {
  const formatDate = useDateFormat();
  const palette = useVizPalette();
  const [data, setData] = React.useState<AnalyticsPayload>(initial);
  const [range, setRange] = React.useState('30');
  const [codeId, setCodeId] = React.useState(selectedCodeId ?? 'all');
  const [folderId, setFolderId] = React.useState('all');
  const [timezone, setTimezone] = React.useState(initialTimezone || 'UTC');
  const [loading, setLoading] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [codeQuery, setCodeQuery] = React.useState('');
  const firstRender = React.useRef(true);

  // `silent` is the live refresh: no spinner, no error toast every five seconds.
  const load = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { from, to } = rangeToDates(range);
      const params = new URLSearchParams({ from, to, timezone });
      if (codeId !== 'all') params.set('qr_code_id', codeId);
      if (folderId !== 'all') params.set('folder_id', folderId);

      const response = await fetch(`/api/v1/stats?${params.toString()}`);
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; data?: AnalyticsPayload; error?: string };
      if (!response.ok || !payload.ok || !payload.data) {
        if (!silent) toast.error(payload.error ?? 'Could not load analytics');
        return;
      }
      setData(payload.data);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [range, codeId, folderId, timezone]);

  const liveState = useLiveScans({
    qrCodeId: codeId !== 'all' ? codeId : undefined,
    folderId: folderId !== 'all' ? folderId : undefined,
    onChange: () => void load(true),
  });

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    void load();
  }, [load]);

  const granularity: 'hour' | 'day' | 'month' = range === '7' ? 'day' : range === '365' || range === 'all' ? 'month' : 'day';

  const chartData = React.useMemo(
    () =>
      data.series.map((point) => ({
        label: formatBucket(point.bucket, granularity),
        scans: point.scans,
        unique: point.unique,
      })),
    [data.series, granularity],
  );

  const hasScans = data.totalScans > 0;
  const peakHour = data.hours.reduce((best, current) => (current.scans > best.scans ? current : best), {
    hour: 0,
    scans: 0,
  });

  async function exportRows(format: 'csv' | 'xlsx') {
    const { from, to } = rangeToDates(range);
    const params = new URLSearchParams({ from, to, timezone, format });
    if (codeId !== 'all') params.set('qr_code_id', codeId);
    if (folderId !== 'all') params.set('folder_id', folderId);

    const response = await fetch(`/api/v1/stats?${params.toString()}`);
    if (!response.ok) {
      toast.error('Could not export those rows');
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `qr-altrix-scans.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success(`${format.toUpperCase()} downloaded`);
  }

  const filteredCodes = codes.filter((code) => code.name.toLowerCase().includes(codeQuery.trim().toLowerCase()));

  return (
    <div className="space-y-5">
      {/* --------------------------------------------------------- filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[10.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={codeId} onValueChange={setCodeId}>
          <SelectTrigger className="w-[13rem]">
            <SelectValue placeholder="All QR codes" />
          </SelectTrigger>
          <SelectContent>
            <div className="p-1.5">
              <Input
                value={codeQuery}
                onChange={(event) => setCodeQuery(event.target.value)}
                placeholder="Find a code"
                className="h-8"
                onKeyDown={(event) => event.stopPropagation()}
              />
            </div>
            <SelectItem value="all">All QR codes</SelectItem>
            {filteredCodes.slice(0, 60).map((code) => (
              <SelectItem key={code.id} value={code.id}>
                {code.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {folders.length > 0 ? (
          <Select value={folderId} onValueChange={setFolderId}>
            <SelectTrigger className="w-[11rem]">
              <SelectValue placeholder="All folders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All folders</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-[11.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((zone) => (
              <SelectItem key={zone} value={zone}>
                {zone.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <LiveIndicator live={liveState.live} />

        <div className="ml-auto flex items-center gap-1.5">
          {canExport ? (
            <>
              <Button variant="outline" size="sm" onClick={() => void exportRows('csv')}>
                <Download /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => void exportRows('xlsx')}>
                <FileSpreadsheet /> XLSX
              </Button>
            </>
          ) : null}
          {canReset ? (
            <Button variant="destructive-outline" size="sm" onClick={() => setResetOpen(true)}>
              <RotateCcw /> Reset
            </Button>
          ) : null}
        </div>
      </div>

      {deferredProcessing ? (
        <Alert tone="info">
          <span className="flex items-start gap-2">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Scans are written by the background worker, so a brand-new scan can take a few seconds to appear here.
          </span>
        </Alert>
      ) : null}

      {/* ------------------------------------------------------------- tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total scans"
          value={formatNumber(data.totalScans)}
          change={data.changePercent}
          changeLabel="versus the previous period"
          icon={<MousePointerClick />}
          tone="primary"
        />
        <StatCard
          label="Unique visitors"
          value={formatNumber(data.uniqueScans)}
          hint={
            data.totalScans > 0
              ? `${Math.round((data.uniqueScans / data.totalScans) * 100)}% of scans were first-time`
              : 'No scans yet'
          }
          icon={<Users />}
        />
        <StatCard
          label="Busiest hour"
          value={hasScans ? `${String(peakHour.hour).padStart(2, '0')}:00` : '—'}
          hint={hasScans ? `${formatNumber(peakHour.scans)} scans in that hour (${timezone})` : undefined}
          icon={<Clock />}
        />
        <StatCard
          label="Last scan"
          value={
            formatDate(data.lastScanAt, { day: '2-digit', month: 'short' })
          }
          hint={data.lastScanAt ? formatDate(data.lastScanAt, TIME) : 'Waiting for the first scan'}
          icon={<Globe2 />}
          tone="accent"
        />
      </div>

      {/* -------------------------------------------------------- time series */}
      <Card className="p-5">
        <SectionHeader
          title="Scans over time"
          description={`Totals and unique visitors, bucketed by ${granularity}.`}
          actions={
            <div className="flex items-center gap-3 text-[12px]">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: palette.categorical[0] }} aria-hidden />
                Total scans
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: palette.categorical[2] }} aria-hidden />
                Unique
              </span>
            </div>
          }
        />

        {loading ? (
          <InlineLoader label="Loading scans" />
        ) : !hasScans ? (
          <EmptyState
            icon={<MousePointerClick />}
            title="No scans in this period"
            description="Share or print your code — every scan appears here within seconds."
          />
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="qa-scan-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.categorical[0]} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={palette.categorical[0]} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={28}
                  tick={{ fill: palette.textMuted, fontSize: 11.5 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={46}
                  allowDecimals={false}
                  tick={{ fill: palette.textMuted, fontSize: 11.5 }}
                  tickFormatter={(value: number) => compactNumber(value)}
                />
                <Tooltip
                  cursor={{ stroke: palette.axis, strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    background: palette.surface,
                    border: `1px solid ${palette.grid}`,
                    borderRadius: 12,
                    fontSize: 12.5,
                    color: palette.text,
                    boxShadow: '0 18px 40px -22px rgb(15 23 42 / 0.35)',
                  }}
                  labelStyle={{ color: palette.textMuted, marginBottom: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  name="Total scans"
                  stroke={palette.categorical[0]}
                  strokeWidth={2}
                  fill="url(#qa-scan-fill)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: palette.surface }}
                />
                <Area
                  type="monotone"
                  dataKey="unique"
                  name="Unique visitors"
                  stroke={palette.categorical[2]}
                  strokeWidth={2}
                  fill="transparent"
                  strokeDasharray="5 3"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: palette.surface }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* ------------------------------------------------------- breakdowns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionHeader title="Where scans came from" description="Reported by your proxy or CDN." />
          <Tabs defaultValue="countries">
            <TabsList variant="underline" className="mb-4">
              <TabsTriggerLine value="countries">Countries</TabsTriggerLine>
              <TabsTriggerLine value="cities">Cities</TabsTriggerLine>
              <TabsTriggerLine value="languages">Languages</TabsTriggerLine>
            </TabsList>
            <TabsContent value="countries">
              <BreakdownList
                rows={data.countries}
                total={data.totalScans}
                color={palette.categorical[0]}
                icon={<Globe2 className="size-4" />}
                emptyLabel="No country data yet. Your proxy needs to pass a geo header."
                renderLabel={(label) => (
                  <span className="flex items-center gap-2">
                    <span aria-hidden>{countryFlag(label)}</span>
                    {countryName(label)}
                  </span>
                )}
              />
            </TabsContent>
            <TabsContent value="cities">
              <BreakdownList
                rows={data.cities}
                total={data.totalScans}
                color={palette.categorical[6]}
                icon={<Globe2 className="size-4" />}
                emptyLabel="No city data yet."
              />
            </TabsContent>
            <TabsContent value="languages">
              <BreakdownList
                rows={data.languages}
                total={data.totalScans}
                color={palette.categorical[5]}
                icon={<Languages className="size-4" />}
                emptyLabel="No language data yet."
              />
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-5">
          <SectionHeader title="What people scanned with" />
          <Tabs defaultValue="devices">
            <TabsList variant="underline" className="mb-4">
              <TabsTriggerLine value="devices">Devices</TabsTriggerLine>
              <TabsTriggerLine value="browsers">Browsers</TabsTriggerLine>
              <TabsTriggerLine value="os">Systems</TabsTriggerLine>
            </TabsList>
            <TabsContent value="devices">
              <BreakdownList
                rows={data.devices}
                total={data.totalScans}
                color={palette.categorical[1]}
                icon={<Smartphone className="size-4" />}
                emptyLabel="No device data yet."
                renderLabel={(label) => <span className="capitalize">{label}</span>}
              />
            </TabsContent>
            <TabsContent value="browsers">
              <BreakdownList
                rows={data.browsers}
                total={data.totalScans}
                color={palette.categorical[2]}
                icon={<Monitor className="size-4" />}
                emptyLabel="No browser data yet."
              />
            </TabsContent>
            <TabsContent value="os">
              <BreakdownList
                rows={data.operatingSystems}
                total={data.totalScans}
                color={palette.categorical[4]}
                icon={<Monitor className="size-4" />}
                emptyLabel="No operating-system data yet."
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* ------------------------------------------------------- hour of day */}
      <Card className="p-5">
        <SectionHeader
          title="Scans by time of day"
          description={`Hour of the day in ${timezone}. Useful for deciding when to refresh a campaign.`}
        />
        {hasScans ? (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hours} margin={{ top: 8, right: 8, left: -22, bottom: 0 }} barCategoryGap={2}>
                <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  interval={1}
                  tick={{ fill: palette.textMuted, fontSize: 11 }}
                  tickFormatter={(hour: number) => String(hour).padStart(2, '0')}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  allowDecimals={false}
                  tick={{ fill: palette.textMuted, fontSize: 11.5 }}
                  tickFormatter={(value: number) => compactNumber(value)}
                />
                <Tooltip
                  cursor={{ fill: palette.grid, opacity: 0.4 }}
                  contentStyle={{
                    background: palette.surface,
                    border: `1px solid ${palette.grid}`,
                    borderRadius: 12,
                    fontSize: 12.5,
                    color: palette.text,
                  }}
                  labelFormatter={(hour) => `${String(hour).padStart(2, '0')}:00`}
                />
                <Bar dataKey="scans" name="Scans" radius={[4, 4, 0, 0]}>
                  {data.hours.map((row) => (
                    <Cell
                      key={row.hour}
                      fill={row.hour === peakHour.hour ? palette.categorical[1] : palette.categorical[0]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-[13px] text-muted-foreground">No scans to plot yet.</p>
        )}
      </Card>

      {/* ---------------------------------------------- codes and campaigns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionHeader title="Most scanned codes" />
          {data.topCodes.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-muted-foreground">No scans recorded yet.</p>
          ) : (
            <ol className="space-y-2">
              {data.topCodes.map((code, index) => (
                <li key={code.id} className="flex items-center gap-3">
                  <span className="w-5 text-right text-[12px] tabular-nums text-muted-foreground">{index + 1}</span>
                  <a
                    href={`/dashboard/codes/${code.id}`}
                    className="min-w-0 flex-1 truncate text-[13.5px] font-medium hover:text-primary"
                  >
                    {code.name}
                  </a>
                  <span className="shrink-0 text-[13px] font-semibold tabular-nums">{compactNumber(code.scans)}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card className="p-5">
          <SectionHeader title="Campaigns and referrers" description="From UTM parameters and the referring host." />
          <div className="space-y-4">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Badge variant="outline">utm_campaign</Badge>
              </p>
              <BreakdownList
                rows={data.campaigns}
                total={data.totalScans}
                color={palette.categorical[3]}
                emptyLabel="No campaign tags recorded."
              />
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Link2 className="size-3.5" /> Referrers
              </p>
              <BreakdownList
                rows={data.referrers}
                total={data.totalScans}
                color={palette.categorical[7]}
                emptyLabel="No referrers — most scans come straight from a camera app."
              />
            </div>
          </div>
        </Card>
      </div>

      <p className={cn('text-center text-[11.5px] text-muted-foreground')}>
        Visitor IP addresses are salted and hashed before storage, so unique visitors can be counted but never
        identified.
      </p>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset analytics?"
        description={
          codeId === 'all'
            ? 'Every recorded scan in this workspace will be deleted.'
            : 'Every recorded scan for the selected code will be deleted.'
        }
        warning="This cannot be undone. Your QR codes keep working exactly as before — only the history is cleared."
        confirmLabel="Reset analytics"
        destructive
        requireText={codeId === 'all' ? 'RESET' : undefined}
        onConfirm={async () => {
          const params = new URLSearchParams();
          if (codeId !== 'all') params.set('qr_code_id', codeId);
          const response = await fetch(`/api/v1/stats?${params.toString()}`, { method: 'DELETE' });
          if (response.ok) {
            toast.success('Analytics reset');
            await load();
          } else {
            toast.error('Could not reset analytics');
          }
        }}
      />
    </div>
  );
}
