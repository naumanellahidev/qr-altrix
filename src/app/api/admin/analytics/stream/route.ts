import { requireAdminApi } from '@/lib/api/admin';
import { liveScanStream } from '@/lib/live-stream';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/stream — Server-Sent Events for platform administrators:
 * every scan of every code on the platform, as it is recorded.
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
  return liveScanStream(request, {}, timezone);
}
