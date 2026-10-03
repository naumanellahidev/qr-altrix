import 'server-only';
import { getRedis } from './redis';

/**
 * Fixed-window rate limiting. Backed by Redis when available, otherwise by an
 * in-process map (correct for a single container, which is the default deployment).
 *
 * These limits exist only to stop abuse — they never cap how many QR codes a user may
 * create, because QR ALTRIX is free and unlimited by design.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const memory = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds = 60,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const redis = await getRedis();

  if (redis) {
    const bucketKey = `rl:${key}:${Math.floor(now / windowMs)}`;
    try {
      const count = await redis.incr(bucketKey);
      if (count === 1) await redis.pexpire(bucketKey, windowMs);
      const resetAt = (Math.floor(now / windowMs) + 1) * windowMs;
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        limit,
        resetAt,
        retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
      };
    } catch {
      /* fall through to memory */
    }
  }

  const existing = memory.get(key);
  if (!existing || existing.resetAt <= now) {
    const bucket = { count: 1, resetAt: now + windowMs };
    memory.set(key, bucket);
    if (memory.size > 10_000) {
      for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
    }
    return { allowed: true, remaining: limit - 1, limit, resetAt: bucket.resetAt, retryAfterSeconds: windowSeconds };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    limit,
    resetAt: existing.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
    ...(result.allowed ? {} : { 'Retry-After': String(result.retryAfterSeconds) }),
  };
}

/** Clears all in-memory buckets. Used by tests. */
export function resetRateLimitMemory(): void {
  memory.clear();
}
