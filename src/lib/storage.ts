import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomToken } from './utils';
import { env } from './env';
import { logger } from './logger';

/**
 * File storage. Local disk is the default so a single VPS needs no extra services;
 * any S3-compatible bucket can be switched on with environment variables alone.
 */

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'];
export const ALLOWED_DOC_TYPES = ['application/pdf'];
export const ALLOWED_MEDIA_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/aac',
];

export const ALLOWED_UPLOAD_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES, ...ALLOWED_MEDIA_TYPES];

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/aac': 'aac',
};

export interface StoredFile {
  key: string;
  url: string;
  size: number;
  mimeType: string;
}

function localRoot(): string {
  return path.resolve(process.cwd(), env.storage.localDir);
}

/** Blocks traversal (`..`) and absolute paths before any filesystem access. */
export function isSafeKey(key: string): boolean {
  if (!key || key.length > 400) return false;
  if (key.includes('..') || key.startsWith('/') || key.includes('\\') || key.includes('\0')) return false;
  return /^[a-zA-Z0-9/_.-]+$/.test(key);
}

export function buildStorageKey(options: {
  scope?: string | null;
  mimeType: string;
  originalName?: string;
}): string {
  const now = new Date();
  const ext =
    EXTENSION_BY_MIME[options.mimeType] ??
    (options.originalName?.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin');
  const scope = (options.scope ?? 'public').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'public';
  return `${scope}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomToken(10)}.${ext}`;
}

export function publicUrl(key: string): string {
  if (env.storage.driver === 's3' && env.storage.s3.publicBaseUrl) {
    return `${env.storage.s3.publicBaseUrl}/${key}`;
  }
  return `/api/files/${key}`;
}

async function s3Client() {
  const { S3Client } = await import('@aws-sdk/client-s3');
  const { s3 } = env.storage;
  return new S3Client({
    region: s3.region || 'auto',
    endpoint: s3.endpoint || undefined,
    forcePathStyle: s3.forcePathStyle,
    credentials:
      s3.accessKeyId && s3.secretAccessKey
        ? { accessKeyId: s3.accessKeyId, secretAccessKey: s3.secretAccessKey }
        : undefined,
  });
}

export async function putFile(key: string, body: Buffer, mimeType: string): Promise<StoredFile> {
  if (!isSafeKey(key)) throw new Error('Invalid storage key');

  if (env.storage.driver === 's3') {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = await s3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: env.storage.s3.bucket,
        Key: key,
        Body: body,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
  } else {
    const target = path.join(localRoot(), key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, body);
  }

  return { key, url: publicUrl(key), size: body.byteLength, mimeType };
}

export async function readFileBuffer(key: string): Promise<Buffer | null> {
  if (!isSafeKey(key)) return null;
  try {
    if (env.storage.driver === 's3') {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const client = await s3Client();
      const result = await client.send(new GetObjectCommand({ Bucket: env.storage.s3.bucket, Key: key }));
      const bytes = await result.Body?.transformToByteArray();
      return bytes ? Buffer.from(bytes) : null;
    }
    return await fs.readFile(path.join(localRoot(), key));
  } catch {
    return null;
  }
}

export async function deleteFile(key: string): Promise<void> {
  if (!isSafeKey(key)) return;
  try {
    if (env.storage.driver === 's3') {
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      const client = await s3Client();
      await client.send(new DeleteObjectCommand({ Bucket: env.storage.s3.bucket, Key: key }));
    } else {
      await fs.unlink(path.join(localRoot(), key));
    }
  } catch (error) {
    logger.warn('file delete failed', { key, error: (error as Error).message });
  }
}

export interface UploadValidationResult {
  ok: boolean;
  error?: string;
}

export function validateUpload(
  file: { size: number; type: string; name: string },
  allowed: string[] = ALLOWED_UPLOAD_TYPES,
  maxMb = env.storage.maxUploadMb,
): UploadValidationResult {
  if (!file || file.size === 0) return { ok: false, error: 'The file is empty.' };
  if (file.size > maxMb * 1024 * 1024) {
    return { ok: false, error: `File is larger than the ${maxMb} MB limit.` };
  }
  const type = (file.type || '').toLowerCase();
  if (!allowed.includes(type)) {
    return { ok: false, error: `This file type is not allowed (${type || 'unknown'}).` };
  }
  if (/\.(exe|bat|cmd|sh|js|php|jar|msi|scr|dll|html?)$/i.test(file.name)) {
    return { ok: false, error: 'Executable and script files cannot be uploaded.' };
  }
  return { ok: true };
}

/** SVG uploads are sanitised because they can carry scripts. */
export function sanitizeSvg(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|xlink:href)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '')
    .replace(/<!ENTITY[\s\S]*?>/gi, '');
}

export async function storageUsage(): Promise<{ bytes: number; files: number }> {
  if (env.storage.driver === 's3') {
    return { bytes: 0, files: 0 };
  }
  let bytes = 0;
  let files = 0;
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        try {
          const stat = await fs.stat(full);
          bytes += stat.size;
          files += 1;
        } catch {
          /* ignore */
        }
      }
    }
  }
  await walk(localRoot());
  return { bytes, files };
}
