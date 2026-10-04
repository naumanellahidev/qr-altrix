'use client';

import * as React from 'react';

export interface LiveScansOptions {
  qrCodeId?: string;
  folderId?: string;
  /** Called when a new scan has been recorded since the last check. */
  onChange: () => void;
  intervalMs?: number;
  enabled?: boolean;
}

export interface LiveScansState {
  /** True while polling is running and the last check succeeded. */
  live: boolean;
  lastScanAt: string | null;
}

/**
 * Keeps a dashboard in step with scans as they happen. It polls the cheap
 * /api/v1/stats/pulse counter while the tab is visible, pauses when it is hidden, checks
 * at once when the tab comes back, and calls `onChange` only when the counter moves.
 * Polling rather than a socket: it survives Cloudflare and Nginx buffering without any
 * extra infrastructure, and the counter read is a single aggregate.
 */
export function useLiveScans({
  qrCodeId,
  folderId,
  onChange,
  intervalMs = 5000,
  enabled = true,
}: LiveScansOptions): LiveScansState {
  const [state, setState] = React.useState<LiveScansState>({ live: false, lastScanAt: null });
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  React.useEffect(() => {
    if (!enabled) return;
    let version: string | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let controller: AbortController | null = null;
    let failures = 0;
    let stopped = false;

    const params = new URLSearchParams();
    if (qrCodeId) params.set('qr_code_id', qrCodeId);
    if (folderId) params.set('folder_id', folderId);
    const url = `/api/v1/stats/pulse${params.size ? `?${params}` : ''}`;

    const schedule = () => {
      if (stopped) return;
      if (timer) clearTimeout(timer);
      // Back off gently after failures so a server hiccup is not hammered.
      timer = setTimeout(tick, intervalMs * Math.min(6, 1 + failures));
    };

    async function tick() {
      if (stopped) return;
      if (document.visibilityState !== 'visible') {
        schedule();
        return;
      }
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
        if (response.status === 401 || response.status === 403) {
          stopped = true;
          setState((current) => ({ ...current, live: false }));
          return;
        }
        const payload = (await response.json()) as {
          ok?: boolean;
          data?: { version: string; lastScanAt: string | null };
        };
        if (!payload.ok || !payload.data) throw new Error('pulse failed');
        failures = 0;
        if (version !== null && payload.data.version !== version) onChangeRef.current();
        version = payload.data.version;
        setState({ live: true, lastScanAt: payload.data.lastScanAt });
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        failures += 1;
        setState((current) => ({ ...current, live: false }));
      }
      schedule();
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') void tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    void tick();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      controller?.abort();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [qrCodeId, folderId, intervalMs, enabled]);

  return state;
}
