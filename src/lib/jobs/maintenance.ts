import 'server-only';
import { prisma } from '../db';
import { getSettings } from '../settings';
import { logger } from '../logger';

/**
 * Housekeeping. Deliberately conservative: it removes expired tokens, abandoned
 * anonymous drafts and — only when an admin has set a retention period — old scan rows.
 * It never touches QR codes, because codes do not expire.
 */
export async function runMaintenance(): Promise<{
  draftsRemoved: number;
  tokensRemoved: number;
  scansRemoved: number;
}> {
  const now = new Date();
  const settings = await getSettings();

  const drafts = await prisma.anonymousQRDraft.deleteMany({ where: { expiresAt: { lt: now } } });

  const [resets, verifications] = await Promise.all([
    prisma.passwordResetToken.deleteMany({
      where: { OR: [{ expiresAt: { lt: now } }, { usedAt: { not: null } }] },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: { OR: [{ expiresAt: { lt: now } }, { usedAt: { not: null } }] },
    }),
  ]);

  let scansRemoved = 0;
  if (settings.analyticsRetentionDays > 0) {
    const cutoff = new Date(now.getTime() - settings.analyticsRetentionDays * 24 * 60 * 60 * 1000);
    const result = await prisma.scanEvent.deleteMany({ where: { createdAt: { lt: cutoff } } });
    scansRemoved = result.count;
  }

  const summary = {
    draftsRemoved: drafts.count,
    tokensRemoved: resets.count + verifications.count,
    scansRemoved,
  };
  logger.info('maintenance complete', summary);
  return summary;
}
