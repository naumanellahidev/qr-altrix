import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { redisEnabled, redisPing } from '@/lib/redis';

export const dynamic = 'force-dynamic';

/**
 * Liveness and readiness in one endpoint, used by the container health check and by
 * uptime monitors. It reports detail but never leaks configuration values.
 */
export async function GET() {
  const started = Date.now();

  let database = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch {
    database = false;
  }

  const redis = redisEnabled() ? await redisPing() : { ok: true, skipped: true };

  // The app can still serve redirects from cache if Redis is down, so only the database
  // makes the service unhealthy.
  const healthy = database;

  return NextResponse.json(
    {
      ok: healthy,
      status: healthy ? 'healthy' : 'degraded',
      checks: {
        database: { ok: database },
        redis: { ok: redis.ok, configured: redisEnabled() },
      },
      uptimeSeconds: Math.round(process.uptime()),
      latencyMs: Date.now() - started,
      time: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503, headers: { 'cache-control': 'no-store' } },
  );
}
