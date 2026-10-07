import { actorCan, resolveActor } from '@/lib/api/actor';
import { fail } from '@/lib/api/respond';
import { liveScanStream } from '@/lib/live-stream';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/stats/stream — Server-Sent Events with the workspace's scans as they are
 * recorded (about a second and a half after the scan). `qr_code_id` or `folder_id`
 * narrow it to one code or folder; the workspace always bounds it, so an id from another
 * workspace simply yields nothing.
 */
export async function GET(request: Request) {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'stats.read')) return fail('This key cannot read statistics', 403);

  const url = new URL(request.url);
  return liveScanStream(
    request,
    {
      workspaceId: actor.workspaceId,
      qrCodeId: url.searchParams.get('qr_code_id') || null,
      folderId: url.searchParams.get('folder_id') || null,
    },
    url.searchParams.get('timezone') ?? 'UTC',
  );
}
