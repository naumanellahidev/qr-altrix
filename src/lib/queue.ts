import 'server-only';
import { randomUUID } from 'node:crypto';
import type { Queue } from 'bullmq';
import { getRedis, redisEnabled } from './redis';
import { logger } from './logger';

/**
 * Background jobs. With Redis present, work is handed to BullMQ and picked up by the
 * worker container. Without Redis the same handler runs inline, so nothing silently
 * disappears on a minimal deployment.
 */

export const QUEUE_NAME = 'qr-altrix';

export interface ScanJobPayload {
  /** Fixed when the scan is queued, so a retried job can never record the same scan twice. */
  scanId?: string;
  qrCodeId: string;
  workspaceId: string;
  kind?: 'SCAN' | 'PASSWORD_FAILED' | 'BLOCKED';
  ipHash: string | null;
  visitorHash: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  language?: string | null;
  referrer?: string | null;
  destinationUrl?: string | null;
  utm?: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    term?: string | null;
    content?: string | null;
  };
  scannedAt: string;
}

export interface JobMap {
  'scan.record': ScanJobPayload;
  'bulk.process': { bulkJobId: string };
  'webhook.deliver': { webhookId: string; event: string; payload: Record<string, unknown> };
  'maintenance.retention': Record<string, never>;
  'domain.verify': { domainId: string };
}

export type JobName = keyof JobMap;

const globalForQueue = globalThis as unknown as { qrAltrixQueue?: Queue | null };

export async function getQueue(): Promise<Queue | null> {
  if (!redisEnabled()) return null;
  if (globalForQueue.qrAltrixQueue !== undefined) return globalForQueue.qrAltrixQueue;
  try {
    const connection = await getRedis();
    if (!connection) {
      globalForQueue.qrAltrixQueue = null;
      return null;
    }
    const { Queue: BullQueue } = await import('bullmq');
    const queue = new BullQueue(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 500,
        removeOnFail: 2000,
      },
    });
    globalForQueue.qrAltrixQueue = queue;
    return queue;
  } catch (error) {
    logger.error('queue init failed', { error: (error as Error).message });
    globalForQueue.qrAltrixQueue = null;
    return null;
  }
}

/**
 * Fire-and-forget enqueue. Scan logging must never block or break a redirect, so
 * failures are logged rather than thrown.
 */
export async function enqueue<T extends JobName>(name: T, data: JobMap[T]): Promise<void> {
  if (name === 'scan.record') {
    const scan = data as ScanJobPayload;
    scan.scanId ??= randomUUID();
  }
  try {
    const queue = await getQueue();
    if (queue) {
      await queue.add(name, data, { jobId: undefined });
      return;
    }
    const { processJob } = await import('./jobs');
    await processJob(name, data);
  } catch (error) {
    logger.error('job dispatch failed', { name, error: (error as Error).message });
  }
}

/** Same as enqueue but surfaces errors — used by API routes that report job status. */
export async function enqueueStrict<T extends JobName>(name: T, data: JobMap[T]): Promise<'queued' | 'inline'> {
  const queue = await getQueue();
  if (queue) {
    await queue.add(name, data);
    return 'queued';
  }
  const { processJob } = await import('./jobs');
  await processJob(name, data);
  return 'inline';
}

export async function queueStats(): Promise<{
  enabled: boolean;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
} | null> {
  const queue = await getQueue();
  if (!queue) return { enabled: false, waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
  const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
  return {
    enabled: true,
    waiting: counts.waiting ?? 0,
    active: counts.active ?? 0,
    completed: counts.completed ?? 0,
    failed: counts.failed ?? 0,
    delayed: counts.delayed ?? 0,
  };
}

/** True when scan analytics are processed out-of-band and may lag behind by seconds. */
export function analyticsDeferred(): boolean {
  return redisEnabled();
}
