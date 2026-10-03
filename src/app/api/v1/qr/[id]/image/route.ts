import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { fail, fileResponse, withApi } from '@/lib/api/respond';
import { encodedPayloadFor } from '@/lib/qr/service';
import { exportQr } from '@/lib/qr/export';
import type { ExportFormat } from '@/lib/qr/types';

const FORMATS: ExportFormat[] = ['png', 'svg', 'pdf', 'jpeg', 'webp', 'eps'];

/**
 * GET /api/v1/qr/:id/image?format=png&size=1024
 * Returns the rendered code. Useful for embedding a code in another system.
 */
export const GET = withApi(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  if (!actorCan(result.actor, 'qr.read')) return fail('This key cannot read QR codes', 403);

  const url = new URL(request.url);
  const formatParam = (url.searchParams.get('format') ?? 'png').toLowerCase() as ExportFormat;
  const format = FORMATS.includes(formatParam) ? formatParam : 'png';
  const size = Math.min(4096, Math.max(64, Number(url.searchParams.get('size') ?? '1024')));
  const download = url.searchParams.get('download') !== 'false';

  const qr = await prisma.qRCode.findFirst({
    where: { id, workspaceId: result.actor.workspaceId },
    include: { design: true, customDomain: { select: { host: true, status: true } } },
  });
  if (!qr) return fail('QR code not found', 404);

  const rendered = await exportQr({
    data: encodedPayloadFor(qr),
    design: (qr.design ?? {}) as never,
    format,
    size,
    filenameBase: qr.name,
  });

  return fileResponse(rendered.body, {
    contentType: rendered.contentType,
    filename: rendered.filename,
    download,
    maxAge: 300,
  });
});
