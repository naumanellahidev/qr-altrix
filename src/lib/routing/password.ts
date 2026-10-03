import 'server-only';
import { cookies } from 'next/headers';
import { env } from '../env';
import { safeCompare, signPayload } from '../hash';

/**
 * Password-gate cookies for protected QR codes.
 *
 * Kept apart from `resolve.ts` so that module stays free of `next/headers`: the
 * background worker imports the resolver, and it runs outside a Next request.
 */

function cookieName(qrId: string): string {
  return `qra_pw_${qrId.slice(0, 20)}`;
}

function cookieValue(qrId: string, passwordHash: string): string {
  return signPayload(`${qrId}:${passwordHash}`).slice(0, 48);
}

export async function markPasswordVerified(qrId: string, passwordHash: string): Promise<void> {
  const store = await cookies();
  store.set(cookieName(qrId), cookieValue(qrId, passwordHash), {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.appUrl.startsWith('https://'),
    path: '/',
    maxAge: 60 * 60 * 12,
  });
}

export async function isPasswordVerified(qrId: string, passwordHash: string | null): Promise<boolean> {
  if (!passwordHash) return true;
  const store = await cookies();
  const value = store.get(cookieName(qrId))?.value;
  if (!value) return false;
  return safeCompare(value, cookieValue(qrId, passwordHash));
}
