import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { requirePlatformAdmin } from '@/lib/auth';
import { queueStats } from '@/lib/queue';
import { redisPing } from '@/lib/redis';
import { storageUsage } from '@/lib/storage';
import { backupStatus } from '@/lib/backups';
import { PageHeader } from '@/components/ui/page-header';
import { SystemView, type HealthPayload } from '@/components/dashboard/admin/system-view';

export const metadata: Metadata = { title: 'System & queue' };
export const dynamic = 'force-dynamic';

export default async function AdminSystemPage() {
  await requirePlatformAdmin();

  const started = Date.now();
  let databaseOk = true;
  let databaseLatency: number | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseLatency = Date.now() - started;
  } catch {
    databaseOk = false;
  }

  const [redis, queue, storage, backups] = await Promise.all([
    redisPing(),
    queueStats().catch(() => null),
    storageUsage().catch(() => ({ bytes: 0, files: 0 })),
    backupStatus(),
  ]);

  const initial: HealthPayload = {
    database: { ok: databaseOk, latencyMs: databaseLatency },
    redis,
    queue,
    storage,
    backups,
    config: {
      appUrl: env.appUrl,
      shortUrlBase: env.shortUrlBase,
      storageDriver: env.storage.driver,
      smtpConfigured: Boolean(env.smtp.host),
      googleOauth: env.google.enabled,
      workerConcurrency: env.workerConcurrency,
    },
  };

  return (
    <>
      <PageHeader
        title="System & queue"
        description="Health of the pieces this install depends on, and the background job queue."
      />
      <SystemView initial={initial} />
    </>
  );
}
