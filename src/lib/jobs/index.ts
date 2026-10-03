import 'server-only';
import type { JobMap, JobName } from '../queue';
import { logger } from '../logger';

/** Single dispatcher used by both the BullMQ worker and the inline fallback. */
export async function processJob<T extends JobName>(name: T, data: JobMap[T]): Promise<void> {
  const started = Date.now();
  switch (name) {
    case 'scan.record': {
      const { recordScan } = await import('./scan');
      await recordScan(data as JobMap['scan.record']);
      break;
    }
    case 'bulk.process': {
      const { processBulkJob } = await import('./bulk');
      await processBulkJob(data as JobMap['bulk.process']);
      break;
    }
    case 'webhook.deliver': {
      const { deliverWebhook } = await import('./webhook');
      await deliverWebhook(data as JobMap['webhook.deliver']);
      break;
    }
    case 'maintenance.retention': {
      const { runMaintenance } = await import('./maintenance');
      await runMaintenance();
      break;
    }
    case 'domain.verify': {
      const { checkDomain } = await import('./domain');
      await checkDomain((data as JobMap['domain.verify']).domainId);
      break;
    }
    default:
      logger.warn('unknown job', { name });
      return;
  }
  logger.debug('job done', { name, ms: Date.now() - started });
}
