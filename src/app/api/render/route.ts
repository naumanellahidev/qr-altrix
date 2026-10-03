import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/auth';
import { exportQr } from '@/lib/qr/export';
import type { QrDesign } from '@/lib/qr/types';
import { encodedPayloadFor } from '@/lib/qr/service';
import { designSchema } from '@/lib/validation';
import { getSettings } from '@/lib/settings';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { fail, fileResponse, readJson, tooMany, withApi } from '@/lib/api/respond';
import { ipKey } from '@/lib/api/actor';
import { logActivity } from '@/lib/audit';

const bodySchema = z.object({
  data: z.string().max(4000).optional(),
  design: designSchema.partial().optional(),
  format: z.enum(['svg', 'png', 'jpeg', 'webp', 'pdf', 'eps']),
  size: z.number().int().min(64).max(4096).optional(),
  name: z.string().max(120).optional(),
  kind: z.enum(['STATIC', 'DYNAMIC']).optional(),
  qrCodeId: z.string().cuid().optional(),
});

/**
 * Renders a QR code to a downloadable file.
 *
 * Saved codes are re-rendered from the database so the file always matches what is
 * stored. Ad-hoc payloads (the homepage generator) are rendered as given, with guest
 * access limited to static codes and governed by the platform setting.
 */
export const POST = withApi(async (request: Request) => {
  const parsed = bodySchema.safeParse(await readJson(request));
  if (!parsed.success) return fail('That export request is not valid', 400);
  const body = parsed.data;

  const auth = await getAuthContext();
  const settings = await getSettings();

  const limit = await rateLimit(
    auth ? `render:user:${auth.user.id}` : ipKey(request, 'render'),
    auth ? 240 : 30,
    60,
  );
  if (!limit.allowed) {
    return tooMany('Too many downloads in a row. Wait a moment and try again.', rateLimitHeaders(limit));
  }

  // --- saved code -----------------------------------------------------------
  if (body.qrCodeId) {
    if (!auth) return fail('Sign in to download a saved QR code', 401);
    const qr = await prisma.qRCode.findFirst({
      where: { id: body.qrCodeId, workspaceId: auth.workspace.id },
      include: { design: true, customDomain: { select: { host: true, status: true } } },
    });
    if (!qr) return fail('QR code not found', 404);

    const result = await exportQr({
      data: encodedPayloadFor(qr),
      design: { ...(qr.design ?? {}), ...(body.design ?? {}) } as Partial<QrDesign>,
      format: body.format,
      size: body.size,
      // An empty name from an unnamed form is not a name: fall back to the saved one.
      filenameBase: body.name?.trim() || qr.name,
    });

    void logActivity({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      action: 'qr.downloaded',
      entityType: 'QRCode',
      entityId: qr.id,
      meta: { format: body.format, size: body.size ?? 1024 },
    });

    return fileResponse(result.body, { contentType: result.contentType, filename: result.filename });
  }

  // --- ad-hoc payload -------------------------------------------------------
  const data = (body.data ?? '').trim();
  if (!data) return fail('There is nothing to render yet', 400);

  if (!auth) {
    if (body.kind === 'DYNAMIC') {
      return fail('Dynamic QR codes need a free account so you can manage and track them.', 401);
    }
    if (!settings.allowGuestStaticDownload) {
      return fail('Create a free account to download your QR code.', 401);
    }
  }

  const result = await exportQr({
    data,
    design: body.design ?? {},
    format: body.format,
    size: body.size,
    filenameBase: body.name?.trim() || 'qr-altrix',
  });

  return fileResponse(result.body, { contentType: result.contentType, filename: result.filename });
});
