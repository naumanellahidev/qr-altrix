'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, CalendarDays, Clock, Info, QrCode, Users } from 'lucide-react';
import { countryFlag, countryName, deviceLabel } from '@/lib/viz/labels';
import { useVizPalette } from '@/lib/viz/palette';
import { cn, compactNumber, formatNumber } from '@/lib/utils';
import type { LiveCounters, LiveScanItem } from '@/lib/hooks/use-live-scans';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { SectionHeader } from '@/components/ui/page-header';
import { LiveIndicator } from '@/components/dashboard/live-indicator';

export function timeAgo(iso: string | null, now: number): string {
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

function place(scan: Pick<LiveScanItem, 'country' | 'city'>): string {
  if (!scan.country) return 'Unknown location';
  return scan.city ? `${scan.city}, ${countryName(scan.country)}` : countryName(scan.country);
}

/** A clock that ticks every second, so "12s ago" stays true without new data. */
export function useNow(): number {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export interface LiveScanPanelProps {
  live: boolean;
  counters: LiveCounters | null;
  feed: LiveScanItem[];
  fresh: Set<string>;
  /** Where a scan's code name links to. */
  codeHref: (scan: LiveScanItem) => string;
  /** Second line of a feed row (for example the workspace, on the platform view). */
  rowContext?: (scan: LiveScanItem) => string;
  /** Hides the code name in the feed (a page about one code). */
  singleCode?: boolean;
  /** Link for the "All time" card. */
  allTimeHref?: string;
  allTimeHint?: string;
  subtitle?: string;
  emptyText?: string;
  /** Static codes in view: their scans never reach the server, so say so plainly. */
  staticCodes?: number;
  staticCodesHref?: string;
  /** Keeps the element ids unique when the panel appears twice on a page. */
  idPrefix?: string;
}

/**
 * The live part of every scan dashboard: counters that move as scans happen, scans per
 * minute for the last hour, and a feed of the latest scans. Every card is clickable.
 */
export function LiveScanPanel({
  live,
  counters,
  feed,
  fresh,
  codeHref,
  rowContext,
  singleCode = false,
  allTimeHref,
  allTimeHint = 'Every scan ever counted',
  subtitle,
  emptyText = 'No scans yet. They appear here a second or two after someone scans.',
  staticCodes = 0,
  staticCodesHref,
  idPrefix = 'live',
}: LiveScanPanelProps) {
  const palette = useVizPalette();
  const now = useNow();
  const chartId = `${idPrefix}-minutes`;
  const feedId = `${idPrefix}-feed`;

  const perMinute = React.useMemo(() => {
    const series = counters?.perMinute ?? Array.from({ length: 60 }, () => 0);
    const base = counters ? Date.parse(counters.now) : now;
    const thisMinute = Math.floor(base / 60_000) * 60_000;
    return series.map((scans, index) => {
      const at = new Date(thisMinute - (series.length - 1 - index) * 60_000);
      return {
        label: index === series.length - 1 ? 'now' : `-${series.length - 1 - index}m`,
        time: at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scans,
      };
    });
    // `now` only matters before the first snapshot arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counters]);

  return (
    <section className="space-y-3" aria-label="Live scans">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <LiveIndicator live={live} />
          <p className="text-[12.5px] text-muted-foreground">
            Last scan:{' '}
            <span className="font-medium text-foreground">
              {counters ? timeAgo(counters.lastScanAt, now) : '…'}
            </span>
          </p>
        </div>
        {subtitle ? <p className="text-[12px] text-muted-foreground">{subtitle}</p> : null}
      </div>

      {staticCodes > 0 ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-3 text-[12.5px] leading-5">
          <Info className="mt-0.5 size-4 shrink-0 text-warning" />
          <p>
            <span className="font-semibold">
              {formatNumber(staticCodes)} {staticCodes === 1 ? 'code is' : 'codes are'} static, so {staticCodes === 1 ? 'its' : 'their'} scans
              cannot be counted.
            </span>{' '}
            A static code holds the link or Wi-Fi details itself, so the phone opens it directly and never reaches
            QR ALTRIX. To count scans, create a dynamic code (for example <em>Website redirect</em>) — it is free and you
            can change its link at any time.{' '}
            {staticCodesHref ? (
              <Link href={staticCodesHref} className="font-medium text-primary underline-offset-2 hover:underline">
                See static codes
              </Link>
            ) : null}
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Right now"
          value={formatNumber(counters?.last5m ?? 0)}
          hint="Scans in the last 5 minutes"
          icon={<Activity />}
          onClick={() => scrollTo(chartId)}
        />
        <StatCard
          label="Last hour"
          value={formatNumber(counters?.last60m ?? 0)}
          hint="Scans in the last 60 minutes"
          icon={<Clock />}
          onClick={() => scrollTo(chartId)}
        />
        <StatCard
          label="Today"
          value={formatNumber(counters?.today ?? 0)}
          hint="Since midnight, your time"
          icon={<CalendarDays />}
          onClick={() => scrollTo(feedId)}
        />
        <StatCard
          label="Unique today"
          value={formatNumber(counters?.todayUnique ?? 0)}
          hint="First-time visitors today"
          icon={<Users />}
          onClick={() => scrollTo(feedId)}
        />
        <StatCard
          label="All time"
          value={compactNumber(counters?.allTime ?? 0)}
          hint={allTimeHint}
          icon={<QrCode />}
          className="col-span-2 lg:col-span-1"
          href={allTimeHref}
          onClick={allTimeHref ? undefined : () => scrollTo(feedId)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="scroll-mt-20 p-4 sm:p-5" id={chartId}>
          <SectionHeader title="Scans per minute" description="The last 60 minutes, updated as scans arrive." />
          <div className="h-44 sm:h-52">
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

        <Card className="flex max-h-[420px] scroll-mt-20 flex-col p-0" id={feedId}>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-[13.5px] font-semibold">Live feed</p>
            <Badge variant="outline">{feed.length ? `${feed.length} latest` : 'Waiting'}</Badge>
          </div>
          {feed.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">{emptyText}</p>
          ) : (
            <ol className="min-h-0 flex-1 divide-y divide-border overflow-y-auto" aria-live="polite">
              {feed.map((scan) => (
                <li key={scan.id}>
                  <Link
                    href={codeHref(scan)}
                    prefetch={false}
                    className={cn(
                      'flex items-start gap-3 px-4 py-2.5 transition-colors duration-700 hover:bg-surface-muted',
                      fresh.has(scan.id) && 'bg-success/10',
                    )}
                  >
                    <span className="mt-0.5 text-[18px] leading-none" aria-hidden>
                      {scan.country ? countryFlag(scan.country) : '🌐'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-semibold">
                          {singleCode ? place(scan) : scan.codeName}
                        </span>
                        <Badge variant={scan.unique ? 'success' : 'outline'} className="shrink-0">
                          {scan.unique ? 'New' : 'Repeat'}
                        </Badge>
                      </span>
                      {rowContext ? (
                        <span className="block truncate text-[12px] text-muted-foreground">{rowContext(scan)}</span>
                      ) : null}
                      <span className="block truncate text-[12px] text-muted-foreground">
                        {singleCode ? '' : place(scan)}
                        {scan.device ? `${singleCode ? '' : ' · '}${deviceLabel(scan.device)}` : ''}
                        {scan.browser ? ` · ${scan.browser}` : ''}
                        {scan.os ? ` · ${scan.os}` : ''}
                      </span>
                    </span>
                    <time
                      dateTime={scan.at}
                      className="shrink-0 text-[11.5px] tabular-nums text-muted-foreground"
                      title={new Date(scan.at).toLocaleString()}
                    >
                      {timeAgo(scan.at, now)}
                    </time>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </section>
  );
}
