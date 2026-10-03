import 'server-only';
import dns from 'node:dns/promises';
import { prisma } from '../db';
import { env } from '../env';
import { logSecurity } from '../audit';
import { logger } from '../logger';

/**
 * Custom domain verification. Two independent proofs are accepted:
 *   1. a TXT record at _qr-altrix.<host> containing the token, or
 *   2. the host already pointing here and serving the verification file.
 */

export const TXT_RECORD_NAME = '_qr-altrix';

export interface DomainCheckResult {
  verified: boolean;
  method: 'txt' | 'http' | null;
  dnsPointsHere: boolean;
  error?: string;
}

function appHostname(): string {
  try {
    return new URL(env.appUrl).hostname;
  } catch {
    return 'localhost';
  }
}

async function resolvesToApp(host: string): Promise<boolean> {
  try {
    const target = appHostname();
    const [hostAddresses, appAddresses] = await Promise.all([
      dns.resolve4(host).catch(() => [] as string[]),
      dns.resolve4(target).catch(() => [] as string[]),
    ]);
    if (hostAddresses.length > 0 && appAddresses.some((ip) => hostAddresses.includes(ip))) return true;

    const cnames = await dns.resolveCname(host).catch(() => [] as string[]);
    return cnames.some((cname) => cname.replace(/\.$/, '').toLowerCase() === target.toLowerCase());
  } catch {
    return false;
  }
}

export async function checkDomain(domainId: string): Promise<DomainCheckResult> {
  const domain = await prisma.customDomain.findUnique({ where: { id: domainId } });
  if (!domain) return { verified: false, method: null, dnsPointsHere: false, error: 'Domain not found' };

  let method: DomainCheckResult['method'] = null;
  let error: string | undefined;

  try {
    const records = await dns.resolveTxt(`${TXT_RECORD_NAME}.${domain.host}`).catch(() => [] as string[][]);
    const flat = records.flat().map((r) => r.trim().replace(/^"|"$/g, ''));
    if (flat.some((value) => value === domain.verifyToken || value === `qr-altrix-verify=${domain.verifyToken}`)) {
      method = 'txt';
    }
  } catch (err) {
    error = (err as Error).message;
  }

  const dnsPointsHere = await resolvesToApp(domain.host);

  if (!method && dnsPointsHere) {
    try {
      const response = await fetch(`https://${domain.host}/.well-known/qr-altrix-domain-verification`, {
        signal: AbortSignal.timeout(8000),
        redirect: 'follow',
      });
      if (response.ok) {
        const text = (await response.text()).trim();
        if (text.includes(domain.verifyToken)) method = 'http';
      }
    } catch (err) {
      error = error ?? (err as Error).message;
    }
  }

  const verified = method !== null;

  await prisma.customDomain.update({
    where: { id: domainId },
    data: {
      status: verified ? 'VERIFIED' : domain.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
      verifiedAt: verified ? (domain.verifiedAt ?? new Date()) : domain.verifiedAt,
      lastCheckedAt: new Date(),
      lastCheckError: verified ? null : (error ?? 'Verification record not found yet'),
      // SSL is provisioned by Certbot on the host; once DNS points here we mark it pending.
      sslStatus: verified ? (domain.sslStatus === 'ACTIVE' ? 'ACTIVE' : 'PENDING') : domain.sslStatus,
    },
  });

  if (verified && domain.status !== 'VERIFIED') {
    await logSecurity({
      type: 'DOMAIN_VERIFIED',
      workspaceId: domain.workspaceId,
      meta: { host: domain.host, method },
    });
  }

  logger.info('domain check', { host: domain.host, verified, method, dnsPointsHere });
  return { verified, method, dnsPointsHere, error };
}

/** Confirms SSL is live by completing a TLS handshake through a plain HTTPS request. */
export async function checkDomainSsl(domainId: string): Promise<boolean> {
  const domain = await prisma.customDomain.findUnique({ where: { id: domainId } });
  if (!domain) return false;
  try {
    const response = await fetch(`https://${domain.host}/.well-known/qr-altrix-domain-verification`, {
      signal: AbortSignal.timeout(8000),
    });
    const ok = response.status < 500;
    await prisma.customDomain.update({
      where: { id: domainId },
      data: { sslStatus: ok ? 'ACTIVE' : 'ERROR', lastCheckedAt: new Date() },
    });
    return ok;
  } catch {
    await prisma.customDomain.update({
      where: { id: domainId },
      data: { sslStatus: 'ERROR', lastCheckedAt: new Date() },
    });
    return false;
  }
}
