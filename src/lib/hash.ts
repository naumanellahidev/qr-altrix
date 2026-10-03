import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from './env';

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/** Tokens are stored hashed so a database leak cannot be replayed. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Salted, truncated IP hash — enough for unique-visitor counting, not reversible. */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip || env.ipStorageMode === 'never') return null;
  return createHmac('sha256', env.ipHashSalt).update(ip).digest('hex').slice(0, 40);
}

/** Stable per-QR visitor fingerprint used to tell unique scans from repeat scans. */
export function visitorFingerprint(parts: Array<string | null | undefined>): string {
  return createHmac('sha256', env.ipHashSalt).update(parts.filter(Boolean).join('|')).digest('hex').slice(0, 40);
}

export function signPayload(payload: string, secret = env.authSecret): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
