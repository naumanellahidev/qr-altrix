import 'server-only';
import type { QrKind, QrType } from '@prisma/client';
import { prisma } from './db';
import { logger } from './logger';
import { createQrCode } from './qr/service';
import { getTypeDef } from './qr/catalog';
import { anonymousDraftSchema } from './validation';

/**
 * Anonymous drafts. A visitor designs a code on the homepage before they have an
 * account; the draft is stored against their draft-session cookie and turned into a real
 * QR code the moment they sign up or log in. Nothing they designed is ever lost.
 */

const DRAFT_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export interface DraftPayload {
  type: string;
  kind: 'STATIC' | 'DYNAMIC';
  name?: string;
  content: Record<string, unknown>;
  design?: Record<string, unknown>;
}

export async function saveDraft(sessionId: string, raw: unknown): Promise<void> {
  const parsed = anonymousDraftSchema.safeParse(raw);
  if (!parsed.success) {
    logger.debug('draft rejected', { issues: parsed.error.issues.length });
    return;
  }

  const payload = {
    type: parsed.data.type,
    kind: parsed.data.kind,
    name: parsed.data.name ?? '',
    content: (parsed.data.content ?? {}) as Record<string, unknown>,
    design: parsed.data.design ?? {},
  };

  // Drafts can contain a logo as a data URI; keep them bounded so storage cannot be abused.
  const serialized = JSON.stringify(payload);
  if (serialized.length > 1_500_000) {
    logger.warn('draft too large, skipping server copy', { bytes: serialized.length });
    return;
  }

  await prisma.anonymousQRDraft.upsert({
    where: { sessionId },
    create: { sessionId, payload: payload as object, expiresAt: new Date(Date.now() + DRAFT_TTL_MS) },
    update: { payload: payload as object, expiresAt: new Date(Date.now() + DRAFT_TTL_MS), claimedAt: null },
  });
}

export async function getDraft(sessionId: string | null | undefined): Promise<DraftPayload | null> {
  if (!sessionId) return null;
  const row = await prisma.anonymousQRDraft.findUnique({ where: { sessionId } });
  if (!row || row.claimedAt || row.expiresAt < new Date()) return null;
  return row.payload as unknown as DraftPayload;
}

/**
 * Converts the draft into a saved QR code owned by the user. Returns the new code id so
 * the caller can send the user straight to their download.
 */
export async function claimDraft(options: {
  sessionId: string | null | undefined;
  userId: string;
  workspaceId: string;
  headers?: Headers | null;
}): Promise<string | null> {
  const { sessionId, userId, workspaceId } = options;
  if (!sessionId) return null;

  const draft = await getDraft(sessionId);
  if (!draft) return null;

  const def = getTypeDef(draft.type);
  if (!def) return null;

  try {
    const created = await createQrCode(
      {
        name: draft.name?.trim() || `${def.label} code`,
        kind: draft.kind as QrKind,
        type: draft.type as QrType,
        content: draft.content,
        design: draft.design as never,
      },
      { workspaceId, userId, headers: options.headers ?? null, source: 'homepage' },
    );

    await prisma.anonymousQRDraft.update({
      where: { sessionId },
      data: { claimedAt: new Date(), claimedBy: userId },
    });

    return created.id;
  } catch (error) {
    // A draft that fails validation (e.g. an upload-only type) must not break signup.
    logger.warn('draft claim failed', { error: (error as Error).message, type: draft.type });
    return null;
  }
}

export async function purgeExpiredDrafts(): Promise<number> {
  const result = await prisma.anonymousQRDraft.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return result.count;
}
