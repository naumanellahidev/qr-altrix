import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import {
  ALLOWED_DOC_TYPES, ALLOWED_IMAGE_TYPES, ALLOWED_MEDIA_TYPES, buildStorageKey, putFile,
  sanitizeSvg, validateUpload,
} from '@/lib/storage';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { created, fail, tooMany, withApi } from '@/lib/api/respond';
import { logActivity } from '@/lib/audit';

const KIND_TYPES: Record<string, string[]> = {
  image: ALLOWED_IMAGE_TYPES,
  logo: ALLOWED_IMAGE_TYPES,
  pdf: ALLOWED_DOC_TYPES,
  media: ALLOWED_MEDIA_TYPES,
  any: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES, ...ALLOWED_MEDIA_TYPES],
};

/** Accepts a file for a QR code (logo, PDF, gallery image, audio, video). */
export const POST = withApi(async (request: Request) => {
  const auth = await getAuthContext();
  if (!auth) return fail('Sign in to upload files', 401);

  const limit = await rateLimit(`upload:${auth.user.id}`, 120, 60);
  if (!limit.allowed) return tooMany('Too many uploads at once', rateLimitHeaders(limit));

  const form = await request.formData().catch(() => null);
  if (!form) return fail('Send the file as multipart form data', 400);

  const file = form.get('file');
  const kind = String(form.get('kind') ?? 'any');
  if (!(file instanceof File)) return fail('No file was received', 400);

  const settings = await getSettings();
  const validation = validateUpload(
    { size: file.size, type: file.type, name: file.name },
    KIND_TYPES[kind] ?? KIND_TYPES.any,
    settings.maxUploadMb,
  );
  if (!validation.ok) return fail(validation.error ?? 'That file cannot be uploaded', 400);

  let buffer = Buffer.from(await file.arrayBuffer());

  // SVG can carry scripts, so it is cleaned before it is ever served back.
  if (file.type === 'image/svg+xml') {
    buffer = Buffer.from(sanitizeSvg(buffer.toString('utf8')), 'utf8');
  }

  const key = buildStorageKey({ scope: auth.workspace.id, mimeType: file.type, originalName: file.name });
  const stored = await putFile(key, buffer, file.type);

  const record = await prisma.uploadedFile.create({
    data: {
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      kind,
      originalName: file.name.slice(0, 200),
      storageKey: stored.key,
      mimeType: file.type,
      size: stored.size,
    },
  });

  await prisma.workspace.update({
    where: { id: auth.workspace.id },
    data: { storageUsed: { increment: BigInt(stored.size) } },
  });

  void logActivity({
    workspaceId: auth.workspace.id,
    userId: auth.user.id,
    action: 'file.uploaded',
    entityType: 'UploadedFile',
    entityId: record.id,
    meta: { name: record.originalName, size: record.size, kind },
  });

  return created({
    id: record.id,
    url: stored.url,
    key: stored.key,
    name: record.originalName,
    size: record.size,
    mimeType: record.mimeType,
  });
});
