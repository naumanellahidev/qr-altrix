/**
 * QR ALTRIX background worker.
 *
 * Processes scan logging, bulk imports, webhook delivery and housekeeping from the
 * BullMQ queue. Run it as its own process (the Compose file does) so a burst of scans
 * never slows a redirect:
 *
 *   npm run worker
 *
 * With no REDIS_URL the web process handles jobs inline and this worker is unnecessary.
 *
 * It runs through tsx (`node --conditions=react-server --import tsx`). Two reasons:
 * tsx resolves the extensionless relative imports the application code uses, which plain
 * Node cannot; and the `react-server` condition makes the `server-only` marker resolve to
 * an empty module instead of throwing outside a React Server Component graph.
 */

import { Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import { processJob } from '../src/lib/jobs/index.ts';
import type { JobMap, JobName } from '../src/lib/queue.ts';
import { logger } from '../src/lib/logger.ts';
import { prisma } from '../src/lib/db.ts';

const QUEUE_NAME = 'qr-altrix';
const redisUrl = process.env.REDIS_URL;
const concurrency = Number(process.env.WORKER_CONCURRENCY ?? '5') || 5;

if (!redisUrl) {
  logger.error('REDIS_URL is not set — the worker has nothing to connect to.');
  logger.info('Without Redis the web process runs jobs inline, so no worker is needed.');
  process.exit(1);
}

const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: false });

connection.on('error', (error) => logger.error('redis connection error', { error: error.message }));

const worker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const started = Date.now();
    await processJob(job.name as JobName, job.data as JobMap[JobName]);
    logger.info('job processed', { name: job.name, id: job.id, ms: Date.now() - started });
  },
  { connection, concurrency },
);

worker.on('failed', (job, error) => {
  logger.error('job failed', {
    name: job?.name,
    id: job?.id,
    attempts: job?.attemptsMade,
    error: error?.message,
  });
});

worker.on('error', (error) => logger.error('worker error', { error: error.message }));

logger.info('worker started', { queue: QUEUE_NAME, concurrency });

/**
 * Housekeeping runs hourly from here rather than from a cron container, so a single
 * `docker compose up` gives a complete, self-maintaining install.
 */
const maintenanceTimer = setInterval(
  () => {
    void processJob('maintenance.retention', {}).catch((error: Error) =>
      logger.error('scheduled maintenance failed', { error: error.message }),
    );
  },
  60 * 60 * 1000,
);

async function shutdown(signal: string) {
  logger.info('worker shutting down', { signal });
  clearInterval(maintenanceTimer);
  try {
    await worker.close();
    await connection.quit();
    await prisma.$disconnect();
  } catch (error) {
    logger.error('shutdown error', { error: (error as Error).message });
  }
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
