'use client';

import { useRouter } from 'next/navigation';
import { useLiveScans } from '@/lib/hooks/use-live-scans';
import { LiveScanPanel } from '@/components/dashboard/live-scan-panel';

/**
 * Live scans on the dashboard home. New scans move the counters and the feed at once,
 * and refresh the server-rendered figures around them (30-day totals, recent codes).
 */
export function DashboardLive({ staticCodes }: { staticCodes: number }) {
  const router = useRouter();
  const live = useLiveScans({ onChange: () => router.refresh() });

  return (
    <LiveScanPanel
      live={live.live}
      counters={live.counters}
      feed={live.feed}
      fresh={live.fresh}
      codeHref={(scan) => `/dashboard/codes/${scan.codeId}`}
      rowContext={(scan) => scan.codeTypeLabel}
      allTimeHref="/dashboard/stats"
      allTimeHint="Every scan of your codes"
      subtitle="Scans of your codes, a second or two after they happen."
      staticCodes={staticCodes}
      staticCodesHref="/dashboard/codes?filter=static"
      idPrefix="home-live"
    />
  );
}
