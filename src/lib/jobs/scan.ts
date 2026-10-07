import 'server-only';
import { prisma } from '../db';
import { logger } from '../logger';
import type { ScanJobPayload } from '../queue';
import { deliverWebhookEvent } from './webhook';

/**
 * Writes a scan into analytics. Runs after the redirect has already been served, so a
 * slow or failing write can never delay or break a scan.
 */
export async function recordScan(payload: ScanJobPayload): Promise<void> {
  const scannedAt = new Date(payload.scannedAt);
  const kind = payload.kind ?? 'SCAN';

  // One transaction: the event and the code's counters are written together or not at
  // all, so a retried job can no longer leave the counters out of step with the events.
  let isUnique: boolean;
  try {
    isUnique = await prisma.$transaction(async (tx) => {
      let unique = true;
      if (payload.visitorHash) {
        // Two scans from the same visitor at the same moment must not both count as the
        // first one: serialise them on (code, visitor) for the length of the transaction.
        const key = `${payload.qrCodeId}:${payload.visitorHash}`;
        await tx.$queryRaw`SELECT 1 AS ok FROM pg_advisory_xact_lock(hashtext(${key}))`;
        const seen = await tx.scanEvent.findFirst({
          where: { qrCodeId: payload.qrCodeId, visitorHash: payload.visitorHash },
          select: { id: true },
        });
        unique = !seen;
      }

      await tx.scanEvent.create({
        data: {
          // The id fixed at enqueue time makes a retry of an already recorded scan fail
          // on the primary key instead of counting it again.
          ...(payload.scanId ? { id: payload.scanId } : {}),
          qrCodeId: payload.qrCodeId,
          workspaceId: payload.workspaceId,
          kind,
          createdAt: scannedAt,
          ipHash: payload.ipHash,
          visitorHash: payload.visitorHash,
          isUnique: unique,
          country: payload.country ?? null,
          region: payload.region ?? null,
          city: payload.city ?? null,
          deviceType: payload.deviceType ?? null,
          browser: payload.browser ?? null,
          os: payload.os ?? null,
          language: payload.language ?? null,
          referrer: payload.referrer ?? null,
          hourOfDay: scannedAt.getUTCHours(),
          utmSource: payload.utm?.source ?? null,
          utmMedium: payload.utm?.medium ?? null,
          utmCampaign: payload.utm?.campaign ?? null,
          utmTerm: payload.utm?.term ?? null,
          utmContent: payload.utm?.content ?? null,
          destinationUrl: payload.destinationUrl ?? null,
        },
      });

      if (kind === 'SCAN') {
        await tx.qRCode.update({
          where: { id: payload.qrCodeId },
          data: {
            scanCount: { increment: 1 },
            uniqueScanCount: unique ? { increment: 1 } : undefined,
            lastScanAt: scannedAt,
          },
        });
        // firstScanAt must only ever be written once, so it is a separate conditional write.
        await tx.qRCode.updateMany({
          where: { id: payload.qrCodeId, firstScanAt: null },
          data: { firstScanAt: scannedAt },
        });
      }
      return unique;
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002' && payload.scanId) {
      logger.info('scan already recorded, skipping retry', { scanId: payload.scanId });
      return;
    }
    throw error;
  }

  if (kind === 'SCAN') {
    await deliverWebhookEvent(payload.workspaceId, 'qr.scanned', {
      qrCodeId: payload.qrCodeId,
      scannedAt: payload.scannedAt,
      country: payload.country ?? null,
      deviceType: payload.deviceType ?? null,
      isUnique,
    }).catch(() => undefined);
  }
}
