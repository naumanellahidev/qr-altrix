import { NextResponse } from 'next/server';
import { isSafeKey, readFileBuffer } from '@/lib/storage';

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  zip: 'application/zip',
  json: 'application/json',
};

/**
 * Serves files from local storage. Keys are random, so a key is effectively a
 * capability; traversal is blocked and nothing is executed.
 */
export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await context.params;
  const key = segments.join('/');

  if (!isSafeKey(key)) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  const buffer = await readFileBuffer(key);
  if (!buffer) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  const extension = key.split('.').pop()?.toLowerCase() ?? '';
  const contentType = CONTENT_TYPES[extension] ?? 'application/octet-stream';

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'content-type': contentType,
      'content-length': String(buffer.byteLength),
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
      // SVG is served as a download-safe type to avoid script execution in context.
      ...(extension === 'svg' ? { 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'" } : {}),
    },
  });
}
