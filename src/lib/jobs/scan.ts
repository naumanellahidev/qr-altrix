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

  let isUnique = false;
  if (payload.visitorHash) {
    const seen = await prisma.scanEvent.findFirst({
      where: { qrCodeId: payload.qrCodeId, visitorHash: payload.visitorHash },
      select: { id: true },
    });
    isUnique = !seen;
  } else {
    isUnique = true;
  }

  await prisma.scanEvent.create({
    data: {
      qrCodeId: payload.qrCodeId,
      workspaceId: payload.workspaceId,
      kind,
      createdAt: scannedAt,
      ipHash: payload.ipHash,
      visitorHash: payload.visitorHash,
      isUnique,
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
    await prisma.qRCode.update({
      where: { id: payload.qrCodeId },
      data: {
        scanCount: { increment: 1 },
        uniqueScanCount: isUnique ? { increment: 1 } : undefined,
        lastScanAt: scannedAt,
      },
    });

    // firstScanAt must only ever be written once, so it is a separate conditional write.
    await prisma.qRCode.updateMany({
      where: { id: payload.qrCodeId, firstScanAt: null },
      data: { firstScanAt: scannedAt },
    });

    await deliverWebhookEvent(payload.workspaceId, 'qr.scanned', {
      qrCodeId: payload.qrCodeId,
      scannedAt: payload.scannedAt,
      country: payload.country ?? null,
      deviceType: payload.deviceType ?? null,
      isUnique,
    }).catch(() => undefined);
  }
}
