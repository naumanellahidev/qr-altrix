import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { env } from '../env';
import { logger } from '../logger';

export type ResolvedQr = Prisma.QRCodeGetPayload<{
  include: {
    design: true;
    destinations: true;
    customDomain: true;
    workspace: { select: { id: true; name: true; isDisabled: true } };
  };
}>;

const includeShape = {
  design: true,
  destinations: true,
  customDomain: true,
  workspace: { select: { id: true, name: true, isDisabled: true } },
} as const;

function appHost(): string {
  try {
    return new URL(env.appUrl).hostname.toLowerCase();
  } catch {
    return 'localhost';
  }
}

function shortHost(): string {
  try {
    return new URL(env.shortUrlBase).hostname.toLowerCase();
  } catch {
    return appHost();
  }
}

/**
 * Finds a QR code from the host and code in the URL. Custom domains resolve by slug,
 * the platform domain resolves by short code, and a custom slug on the platform domain
 * is also accepted as a convenience.
 */
export async function resolveQr(options: { host?: string | null; code: string }): Promise<ResolvedQr | null> {
  const code = options.code?.trim();
  if (!code || code.length > 80) return null;

  const host = options.host?.toLowerCase().replace(/:\d+$/, '') ?? null;
  const isPlatformHost = !host || host === appHost() || host === shortHost() || host === 'localhost';

  try {
    if (host && !isPlatformHost) {
      const domain = await prisma.customDomain.findUnique({ where: { host } });
      if (!domain || domain.status !== 'VERIFIED') return null;
      const bySlug = await prisma.qRCode.findFirst({
        where: { customDomainId: domain.id, slug: code },
        include: includeShape,
      });
      if (bySlug) return bySlug;
      // A short code also works on a custom domain, so printed codes keep resolving
      // if the owner later moves them between domains.
      return prisma.qRCode.findFirst({ where: { shortCode: code }, include: includeShape });
    }

    const byShortCode = await prisma.qRCode.findUnique({ where: { shortCode: code }, include: includeShape });
    if (byShortCode) return byShortCode;

    return prisma.qRCode.findFirst({
      where: { slug: code, customDomainId: null },
      include: includeShape,
    });
  } catch (error) {
    logger.error('qr resolve failed', { code, error: (error as Error).message });
    return null;
  }
}

// ------------------------------------------------------------------ short links

export function shortLinkFor(qr: {
  shortCode: string | null;
  slug: string | null;
  customDomain?: { host: string; status: string } | null;
}): string {
  if (qr.customDomain && qr.customDomain.status === 'VERIFIED' && qr.slug) {
    return `https://${qr.customDomain.host}/${qr.slug}`;
  }
  const base = env.shortUrlBase;
  return `${base}/q/${qr.slug && !qr.customDomain ? qr.slug : qr.shortCode}`;
}

/** The string actually encoded into a dynamic QR symbol. */
export function dynamicPayloadFor(qr: {
  shortCode: string | null;
  slug: string | null;
  customDomain?: { host: string; status: string } | null;
}): string {
  return shortLinkFor(qr);
}
