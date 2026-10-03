import type { QrType } from '@prisma/client';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { deleteQrCode, findQrForWorkspace, serializeQr, updateQrCode } from '@/lib/qr/service';
import { qrUpdateSchema } from '@/lib/validation';

type Context = { params: Promise<{ id: string }> };

/** GET / PATCH / DELETE a single QR code. */
export const GET = withApi(async (request: Request, context: Context) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  if (!actorCan(result.actor, 'qr.read')) return fail('This key cannot read QR codes', 403);

  const qr = await findQrForWorkspace(id, result.actor.workspaceId);
  if (!qr) return fail('QR code not found', 404);
  return ok({ data: serializeQr(qr) });
});

export const PATCH = withApi(async (request: Request, context: Context) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'qr.update')) return fail('This key cannot change QR codes', 403);

  const parsed = qrUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || 'form';
      if (!fields[key]) fields[key] = issue.message;
    }
    return fail(Object.values(fields)[0] ?? 'Please check the submitted fields', 400, { fields });
  }

  if (parsed.data.status !== undefined && !actorCan(actor, 'qr.pause')) {
    return fail('This key cannot pause or resume QR codes', 403);
  }

  const qr = await updateQrCode(
    id,
    {
      ...parsed.data,
      type: parsed.data.type as QrType | undefined,
      gates: parsed.data.gates
        ? {
            password: parsed.data.gates.password,
            scheduleEnabled: parsed.data.gates.scheduleEnabled,
            scheduleStart: parsed.data.gates.scheduleStart ?? null,
            scheduleEnd: parsed.data.gates.scheduleEnd ?? null,
            timeRules: parsed.data.gates.timeRules ?? null,
            scanLimitEnabled: parsed.data.gates.scanLimitEnabled,
            scanLimitMax: parsed.data.gates.scanLimitMax ?? null,
          }
        : undefined,
    },
    {
      workspaceId: actor.workspaceId,
      userId: actor.userId,
      headers: request.headers,
      source: actor.kind === 'apiKey' ? 'api' : 'dashboard',
    },
  );

  return ok({ data: serializeQr(qr) });
});

export const DELETE = withApi(async (request: Request, context: Context) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'qr.delete')) return fail('This key cannot delete QR codes', 403);

  const url = new URL(request.url);
  const permanent = url.searchParams.get('permanent') === 'true';

  await deleteQrCode(id, {
    workspaceId: actor.workspaceId,
    userId: actor.userId,
    headers: request.headers,
    source: actor.kind === 'apiKey' ? 'api' : 'dashboard',
  }, permanent);

  return ok({ deleted: true, permanent });
});
