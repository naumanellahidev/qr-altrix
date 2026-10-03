import { prisma } from '@/lib/db';
import { requireAdminApi } from '@/lib/api/admin';
import { fail, ok, withApi } from '@/lib/api/respond';
import { enqueueStrict, queueStats } from '@/lib/queue';
import { redisPing } from '@/lib/redis';
import { storageUsage } from '@/lib/storage';
import { backupStatus } from '@/lib/backups';
import { logActivity } from '@/lib/audit';
import { env } from '@/lib/env';

/** Health snapshot for the admin System page. */
export const GET = withApi(async () => {
  const guard = await requireAdminApi();
  if (!guard.ok) return fail(guard.error, guard.status);

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
    queueStats(),
    storageUsage(),
    backupStatus(),
  ]);

  return ok({
    data: {
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
    },
  });
});

/** Runs housekeeping now: expired drafts, used tokens and (if set) analytics retention. */
export const POST = withApi(async () => {
  const guard = await requireAdminApi();
  if (!guard.ok) return fail(guard.error, guard.status);

  const mode = await enqueueStrict('maintenance.retention', {});
  await logActivity({ userId: guard.auth.user.id, action: 'admin.maintenance.run', meta: { mode } });

  return ok({ data: { queued: mode === 'queued', mode } });
});
