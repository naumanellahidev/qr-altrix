import { actorCan, resolveActor } from '@/lib/api/actor';
import { created, fail, withApi } from '@/lib/api/respond';
import { duplicateQrCode, serializeQr } from '@/lib/qr/service';

export const POST = withApi(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'qr.create')) return fail('This key cannot create QR codes', 403);

  const copy = await duplicateQrCode(id, {
    workspaceId: actor.workspaceId,
    userId: actor.userId,
    headers: request.headers,
    source: actor.kind === 'apiKey' ? 'api' : 'dashboard',
  });

  return created({ data: serializeQr(copy) });
});
