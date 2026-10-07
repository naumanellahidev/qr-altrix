import { requireAdminApi } from '@/lib/api/admin';
import { liveSnapshot, recentScans, scansSince } from '@/lib/admin-analytics';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/** How often the stream looks for new scans. */
const POLL_MS = 1500;
/** A scan is written a moment after it happens, stamped with the time it happened: look back this far. */
const LOOKBACK_MS = 60_000;
/** Refresh the counters at least this often even when nothing new arrived (minute buckets roll over). */
const SNAPSHOT_MS = 10_000;
/** Comment line that keeps proxies from closing a quiet connection (nginx times out at 70 s). */
const PING_MS = 15_000;
/** The browser reconnects by itself; a bounded lifetime keeps server resources tidy. */
const MAX_LIFETIME_MS = 10 * 60_000;

/**
 * GET /api/admin/analytics/stream — Server-Sent Events for platform administrators.
 *
 * Events: `snapshot` (live counters and the per-minute series), `scans` (new scans,
 * oldest first) and `init` (the most recent scans when the connection opens).
 */
export async function GET(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) {
    return new Response(JSON.stringify({ ok: false, error: guard.error }), {
      status: guard.status,
      headers: { 'content-type': 'application/json' },
    });
  }

  const timezone = new URL(request.url).searchParams.get('timezone') ?? 'UTC';
  const encoder = new TextEncoder();
  const opened = Date.now();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const seen = new Map<string, number>();
      let lastSnapshot = 0;
      let lastPing = Date.now();

      const send = (event: string, data: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // already closed by the client
        }
      };
      request.signal.addEventListener('abort', close);

      try {
        // Tell the browser to wait a little before reconnecting after a drop.
        controller.enqueue(encoder.encode('retry: 3000\n\n'));
        const initial = await recentScans(30);
        for (const scan of initial) seen.set(scan.id, Date.parse(scan.at));
        send('init', initial);
        send('snapshot', await liveSnapshot(timezone));
        lastSnapshot = Date.now();
      } catch (error) {
        logger.error('admin stream start failed', { error: (error as Error).message });
        close();
        return;
      }

      while (!closed && Date.now() - opened < MAX_LIFETIME_MS) {
        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
        if (closed) break;
        try {
          const now = Date.now();
          const fresh = (await scansSince(new Date(now - LOOKBACK_MS))).filter((scan) => !seen.has(scan.id));
          for (const scan of fresh) seen.set(scan.id, Date.parse(scan.at));
          // Forget ids older than the look-back window: they can no longer come back.
          for (const [id, at] of seen) if (at < now - LOOKBACK_MS * 2) seen.delete(id);

          if (fresh.length > 0) send('scans', fresh);
          if (fresh.length > 0 || now - lastSnapshot >= SNAPSHOT_MS) {
            send('snapshot', await liveSnapshot(timezone));
            lastSnapshot = now;
          }
          if (now - lastPing >= PING_MS) {
            controller.enqueue(encoder.encode(': ping\n\n'));
            lastPing = now;
          }
        } catch (error) {
          // A failed poll (database restart, network blip) is retried on the next tick.
          logger.warn('admin stream poll failed', { error: (error as Error).message });
        }
      }
      close();
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-store, no-transform',
      connection: 'keep-alive',
      // Nginx must pass events through as they are written.
      'x-accel-buffering': 'no',
    },
  });
}
