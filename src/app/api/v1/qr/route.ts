import type { QrType } from '@prisma/client';
import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { created, fail, ok, readJson, withApi } from '@/lib/api/respond';
import { createQrCode, listQrCodes, serializeQr } from '@/lib/qr/service';
import { qrCreateSchema } from '@/lib/validation';
import { isFolderScoped } from '@/lib/rbac';

/**
 * GET  /api/v1/qr — list QR codes
 * POST /api/v1/qr — create a QR code
 */
export const GET = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'qr.read')) return fail('This key cannot read QR codes', 403);

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
  const perPage = Math.min(200, Math.max(1, Number(url.searchParams.get('per_page') ?? '25')));

  let folderScopes: string[] | null = null;
  if (actor.kind === 'session' && isFolderScoped(actor.role) && actor.userId) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId: actor.workspaceId, userId: actor.userId },
      select: { folderScopes: true },
    });
    const scopes = membership?.folderScopes as string[] | null | undefined;
    folderScopes = Array.isArray(scopes) ? scopes : [];
  }

  const { items, total } = await listQrCodes({
    workspaceId: actor.workspaceId,
    search: url.searchParams.get('search') ?? undefined,
    folderId: url.searchParams.get('folder_id'),
    filter: (url.searchParams.get('filter') as never) ?? 'all',
    sort: (url.searchParams.get('sort') as never) ?? 'newest',
    skip: (page - 1) * perPage,
    take: perPage,
    folderScopes,
  });

  return ok({
    data: items.map(serializeQr),
    meta: { page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) },
  });
});

export const POST = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'qr.create')) return fail('This key cannot create QR codes', 403);

  const parsed = qrCreateSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || 'form';
      if (!fields[key]) fields[key] = issue.message;
    }
    return fail(Object.values(fields)[0] ?? 'Please check the submitted fields', 400, { fields });
  }

  const qr = await createQrCode(
    {
      ...parsed.data,
      // zod validated the value against the catalogue; this narrows it for Prisma.
      type: parsed.data.type as QrType,
      content: parsed.data.content ?? {},
      gates: parsed.data.gates
        ? {
            password: parsed.data.gates.password ?? null,
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

  return created({ data: serializeQr(qr) });
});
