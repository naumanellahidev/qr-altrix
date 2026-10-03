import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fail, withApi } from '@/lib/api/respond';
import { readFileBuffer } from '@/lib/storage';

/** Download endpoint for hosted files (PDF, audio, images) behind a dynamic code. */
export const GET = withApi(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;

  const qr = await prisma.qRCode.findUnique({
    where: { id },
    select: { id: true, name: true, type: true, status: true, content: true },
  });
  if (!qr) return fail('Not found', 404);
  if (qr.status !== 'ACTIVE') return fail('This file is not available', 410);

  const content = (qr.content ?? {}) as Record<string, unknown>;
  if (content.allowDownload === false) return fail('Downloads are disabled for this code', 403);

  const file = content.file as { url?: string; name?: string } | string | undefined;
  const url = typeof file === 'string' ? file : file?.url;
  if (!url) return fail('Nothing to download', 404);

  // Local assets are read from storage; external links are handed back as a redirect.
  const localKey = /^\/api\/files\/(.+)$/.exec(url)?.[1];
  if (!localKey) {
    return NextResponse.redirect(url, 302);
  }

  const buffer = await readFileBuffer(decodeURIComponent(localKey));
  if (!buffer) return fail('That file is no longer available', 404);

  const name =
    (typeof file === 'object' && file?.name) ||
    `${qr.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) || 'file'}.${localKey.split('.').pop() ?? 'bin'}`;

  const extension = localKey.split('.').pop()?.toLowerCase() ?? '';
  const contentType =
    extension === 'pdf'
      ? 'application/pdf'
      : extension === 'mp3'
        ? 'audio/mpeg'
        : extension === 'mp4'
          ? 'video/mp4'
          : 'application/octet-stream';

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'content-type': contentType,
      'content-length': String(buffer.byteLength),
      'content-disposition': `attachment; filename="${name.replace(/"/g, '')}"`,
      'cache-control': 'public, max-age=3600',
    },
  });
});
