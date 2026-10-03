import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '../env';
import { logger } from '../logger';

export const SESSION_COOKIE = 'qra_session';
export const DRAFT_COOKIE = 'qra_draft';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface SessionPayload {
  sub: string;
  /** Bumped on password change / "sign out everywhere" to invalidate old cookies. */
  v: number;
  /** Active workspace id. */
  ws?: string;
  /** Set while a 2FA challenge is pending — such a session cannot access the app. */
  pending2fa?: boolean;
}

function secretKey(): Uint8Array {
  return new TextEncoder().encode(env.authSecret);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('qr-altrix')
    .setAudience('qr-altrix-app')
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: 'qr-altrix',
      audience: 'qr-altrix-app',
    });
    if (typeof payload.sub !== 'string' || typeof payload.v !== 'number') return null;
    return {
      sub: payload.sub,
      v: payload.v,
      ws: typeof payload.ws === 'string' ? payload.ws : undefined,
      pending2fa: payload.pending2fa === true,
    };
  } catch (error) {
    logger.debug('session verify failed', { error: (error as Error).message });
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSessionToken(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.appUrl.startsWith('https://'),
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function readSessionCookie(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

/** Anonymous visitors get a draft id so a homepage QR survives the signup redirect. */
export async function getOrCreateDraftSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(DRAFT_COOKIE)?.value;
  if (existing && /^[a-f0-9]{24,64}$/.test(existing)) return existing;
  const { randomToken } = await import('../utils');
  const id = randomToken(16);
  store.set(DRAFT_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.appUrl.startsWith('https://'),
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return id;
}

export async function readDraftSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(DRAFT_COOKIE)?.value ?? null;
}
