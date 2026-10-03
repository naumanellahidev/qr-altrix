import { actorCan, resolveActor } from '@/lib/api/actor';
import { fail, ok, withApi } from '@/lib/api/respond';
import { resetQrScans } from '@/lib/qr/service';

/** POST /api/v1/qr/:id/reset-scans — clears analytics for one code. */
export const POST = withApi(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'stats.reset') && actor.kind === 'session') {
    return fail('Your role cannot reset statistics', 403);
  }
  if (actor.kind === 'apiKey' && !actorCan(actor, 'qr.update')) {
    return fail('This key cannot reset statistics', 403);
  }

  await resetQrScans(id, {
    workspaceId: actor.workspaceId,
    userId: actor.userId,
    headers: request.headers,
  });

  return ok({ reset: true });
});
