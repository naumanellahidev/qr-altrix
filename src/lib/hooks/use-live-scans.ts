'use client';

import * as React from 'react';

/** One scan as the live stream sends it (mirrors LiveScan in lib/admin-analytics). */
export interface LiveScanItem {
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

/** Live counters (mirrors LiveSnapshot in lib/admin-analytics). */
export interface LiveCounters {
  now: string;
  last5m: number;
  last60m: number;
  today: number;
  todayUnique: number;
  allTime: number;
  lastScanAt: string | null;
  perMinute: number[];
}

export interface LiveScansOptions {
  qrCodeId?: string;
  folderId?: string;
  /** Called (at most every couple of seconds) when new scans have been recorded. */
  onChange?: () => void;
  enabled?: boolean;
  /** How many recent scans to keep for a feed. */
  feedLimit?: number;
  /** The SSE endpoint (the platform admin view uses its own). */
  endpoint?: string;
}

export interface LiveScansState {
  /** True while the live connection is open. */
  live: boolean;
  lastScanAt: string | null;
  counters: LiveCounters | null;
  /** Most recent scans, newest first. */
  feed: LiveScanItem[];
  /** Ids of scans that arrived in the last few seconds (for a highlight). */
  fresh: Set<string>;
}

const CHANGE_THROTTLE_MS = 2000;
const HIGHLIGHT_MS = 4000;

/**
 * Keeps a dashboard in step with scans as they happen, over Server-Sent Events from
 * /api/v1/stats/stream: a new scan reaches the screen about a second and a half after it
 * is made. The connection closes while the tab is hidden (no server work for nobody) and
 * reopens, with a catch-up refresh, when it comes back. EventSource reconnects by itself
 * after a network drop.
 */
export function useLiveScans({
  qrCodeId,
  folderId,
  onChange,
  enabled = true,
  feedLimit = 30,
  endpoint = '/api/v1/stats/stream',
}: LiveScansOptions = {}): LiveScansState {
  const [live, setLive] = React.useState(false);
  const [counters, setCounters] = React.useState<LiveCounters | null>(null);
  const [feed, setFeed] = React.useState<LiveScanItem[]>([]);
  const [fresh, setFresh] = React.useState<Set<string>>(() => new Set());
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  React.useEffect(() => {
    if (!enabled || typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    const params = new URLSearchParams();
    if (qrCodeId) params.set('qr_code_id', qrCodeId);
    if (folderId) params.set('folder_id', folderId);
    try {
      params.set('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    } catch {
      params.set('timezone', 'UTC');
    }
    const url = `${endpoint}?${params.toString()}`;

    let source: EventSource | null = null;
    let lastChange = 0;
    let changeTimer: ReturnType<typeof setTimeout> | null = null;
    let seenTotal: number | null = null;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    // Throttled, trailing: a burst of scans causes one refresh, never a storm of them.
    const notifyChange = () => {
      if (!onChangeRef.current) return;
      const wait = CHANGE_THROTTLE_MS - (Date.now() - lastChange);
      if (changeTimer) return;
      changeTimer = setTimeout(() => {
        changeTimer = null;
        lastChange = Date.now();
        onChangeRef.current?.();
      }, Math.max(0, wait));
    };

    const open = () => {
      if (source) return;
      source = new EventSource(url);
      source.onopen = () => setLive(true);
      source.onerror = () => {
        setLive(false);
        // 401/403 or a closed stream that will not come back: stop retrying.
        if (source?.readyState === EventSource.CLOSED) {
          source.close();
          source = null;
        }
      };
      source.addEventListener('init', (event) => {
        const scans = JSON.parse((event as MessageEvent).data) as LiveScanItem[];
        setFeed(scans.slice(0, feedLimit));
        setLive(true);
      });
      source.addEventListener('snapshot', (event) => {
        const snapshot = JSON.parse((event as MessageEvent).data) as LiveCounters;
        setCounters(snapshot);
        setLive(true);
        // The counter moved without a scan event (a reset, or scans while the tab was
        // hidden): the page's own figures are stale too.
        if (seenTotal !== null && snapshot.allTime !== seenTotal) notifyChange();
        seenTotal = snapshot.allTime;
      });
      source.addEventListener('scans', (event) => {
        const scans = JSON.parse((event as MessageEvent).data) as LiveScanItem[];
        setFeed((current) => {
          const known = new Set(current.map((scan) => scan.id));
          const added = scans.filter((scan) => !known.has(scan.id)).reverse();
          return [...added, ...current].slice(0, feedLimit);
        });
        const ids = scans.map((scan) => scan.id);
        setFresh((current) => new Set([...current, ...ids]));
        const timer = setTimeout(() => {
          timers.delete(timer);
          setFresh((current) => {
            const next = new Set(current);
            for (const id of ids) next.delete(id);
            return next;
          });
        }, HIGHLIGHT_MS);
        timers.add(timer);
      });
    };

    const shut = () => {
      source?.close();
      source = null;
      setLive(false);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') open();
      else shut();
    };

    if (document.visibilityState === 'visible') open();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      shut();
      if (changeTimer) clearTimeout(changeTimer);
      for (const timer of timers) clearTimeout(timer);
    };
  }, [qrCodeId, folderId, enabled, feedLimit, endpoint]);

  return { live, lastScanAt: counters?.lastScanAt ?? null, counters, feed, fresh };
}
