import 'server-only';
import type Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

/**
 * Redis is optional. Without REDIS_URL the app still works end to end: queues run
 * inline and rate limiting falls back to an in-process counter. That keeps local
 * development and small single-container deployments simple.
 */

const globalForRedis = globalThis as unknown as { qrAltrixRedis?: Redis | null };

export function redisEnabled(): boolean {
  return Boolean(env.redisUrl);
}

export async function getRedis(): Promise<Redis | null> {
  if (!redisEnabled()) return null;
  if (globalForRedis.qrAltrixRedis !== undefined) return globalForRedis.qrAltrixRedis;

  try {
    const { default: RedisClient } = await import('ioredis');
    const client = new RedisClient(env.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: false,
    });
    client.on('error', (error) => logger.warn('redis error', { error: error.message }));
    globalForRedis.qrAltrixRedis = client;
    return client;
  } catch (error) {
    logger.error('redis connection failed', { error: (error as Error).message });
    globalForRedis.qrAltrixRedis = null;
    return null;
  }
}

export async function redisPing(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const client = await getRedis();
  if (!client) return { ok: false, error: 'Redis is not configured' };
  const start = Date.now();
  try {
    await client.ping();
    return { ok: true, latencyMs: Date.now() - start };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
