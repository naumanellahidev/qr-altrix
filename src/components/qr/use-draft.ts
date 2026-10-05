'use client';

import * as React from 'react';
import { DEFAULT_DESIGN, type QrDesign } from '@/lib/qr/types';
import { getTypeDef } from '@/lib/qr/catalog';
import { buildStaticPayload } from '@/lib/qr/payload';

export const DRAFT_STORAGE_KEY = 'qraltrix.draft.v1';

export interface QrDraft {
  type: string;
  kind: 'STATIC' | 'DYNAMIC';
  name: string;
  content: Record<string, unknown>;
  design: QrDesign;
}

export function emptyDraft(type = 'URL'): QrDraft {
  const def = getTypeDef(type);
  return {
    type,
    kind: (def?.kind ?? 'STATIC') as QrDraft['kind'],
    name: '',
    content: {},
    design: { ...DEFAULT_DESIGN },
  };
}

function isDraft(value: unknown): value is QrDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<QrDraft>;
  return typeof draft.type === 'string' && typeof draft.content === 'object' && Boolean(getTypeDef(draft.type));
}

/**
 * Keeps the homepage draft alive across reloads and the signup redirect. The draft is
 * mirrored into localStorage immediately and pushed to the server right before the
 * account gate, so nothing a visitor designed is ever lost.
 */
/**
 * `pinType`: the page is about one type (a /qr-code-generator/<type> page), so a saved
 * draft of another type is not restored over it.
 */
export function useQrDraft(initialType = 'URL', { pinType = false }: { pinType?: boolean } = {}) {
  const [draft, setDraft] = React.useState<QrDraft>(() => emptyDraft(initialType));
  const [restored, setRestored] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isDraft(parsed) && (!pinType || parsed.type === initialType)) {
          setDraft({ ...emptyDraft(parsed.type), ...parsed, design: { ...DEFAULT_DESIGN, ...parsed.design } });
        }
      }
    } catch {
      /* a corrupt draft should never block the page */
    }
    setRestored(true);
  }, []);

  React.useEffect(() => {
    if (!restored) return;
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* private mode / storage full */
    }
  }, [draft, restored]);

  const setType = React.useCallback((type: string) => {
    const def = getTypeDef(type);
    setDraft((current) => ({
      ...current,
      type,
      kind: (def?.kind ?? current.kind) as QrDraft['kind'],
      // Content is type-specific, so switching type starts the fields fresh.
      content: {},
    }));
  }, []);

  const patchContent = React.useCallback((patch: Record<string, unknown>) => {
    setDraft((current) => ({ ...current, content: { ...current.content, ...patch } }));
  }, []);

  const patchDesign = React.useCallback((patch: Partial<QrDesign>) => {
    setDraft((current) => ({ ...current, design: { ...current.design, ...patch } }));
  }, []);

  const setName = React.useCallback((name: string) => {
    setDraft((current) => ({ ...current, name }));
  }, []);

  const clear = React.useCallback(() => {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setDraft(emptyDraft(initialType));
  }, [initialType]);

  return { draft, setDraft, setType, patchContent, patchDesign, setName, clear, restored };
}

/** Saves the draft server-side so it survives the signup round trip. */
export async function persistDraftToServer(draft: QrDraft): Promise<void> {
  try {
    await fetch('/api/drafts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        type: draft.type,
        kind: draft.kind,
        name: draft.name,
        content: draft.content,
        design: draft.design,
      }),
    });
  } catch {
    // localStorage still holds the draft, so this is best-effort only.
  }
}

/**
 * The string that will be encoded. Static codes encode their content; dynamic codes
 * encode a short link that only exists once the code is saved, so the preview uses a
 * representative placeholder of the same length class.
 */
export function previewPayload(draft: QrDraft, shortBase: string): string {
  if (draft.kind === 'STATIC') {
    return buildStaticPayload(draft.type, draft.content);
  }
  const primary = typeof draft.content.url === 'string' ? draft.content.url.trim() : '';
  const hasContent =
    primary.length > 0 ||
    Object.values(draft.content).some((value) =>
      Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim() !== '' : Boolean(value),
    );
  if (!hasContent) return '';
  return `${shortBase.replace(/\/$/, '')}/q/PREVIEW`;
}

/** True when the draft has enough content for the Download button to light up. */
export function draftIsComplete(draft: QrDraft): boolean {
  const def = getTypeDef(draft.type);
  if (!def) return false;
  return def.fields
    .filter((field) => field.required)
    .every((field) => {
      const value = draft.content[field.name];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      return value !== undefined && value !== null && value !== '';
    });
}
