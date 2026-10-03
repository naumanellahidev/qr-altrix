import 'server-only';
import { NextResponse } from 'next/server';
import { env } from '../env';
import { hashIp, visitorFingerprint } from '../hash';
import { parseClient, requestHost } from '../request';
import { enqueue } from '../queue';
import { resolveQr, type ResolvedQr } from './resolve';
import { isPasswordVerified } from './password';
import {
  applyUtm, evaluateAccess, pickAppStoreUrl, pickDestination,
  type DestinationRule, type TimeRule, type UtmConfig,
} from './evaluate';
import { isHostedType } from '../qr/catalog';
import { logger } from '../logger';
import { expiryPolicyFromSettings } from '../qr/expiry';
import { getSettings } from '../settings';

/**
 * The scan handler — everything a printed QR code depends on.
 *
 * It lives here rather than in the route file so that `/q/:code` and `/r/:code` share one
 * implementation without one route module importing another.
 *
 * Order of work, deliberately: resolve the code, apply the owner's own gates, log the
 * scan asynchronously, then redirect. Nothing in this path can expire a code.
 */

/** Query parameters QR ALTRIX uses itself and therefore does not forward onwards. */
const RESERVED_PARAMS = new Set(['preview', 'qra_pw']);

function forwardParams(destination: string, incoming: URLSearchParams): string {
  const pass = Array.from(incoming.entries()).filter(([key]) => !RESERVED_PARAMS.has(key));
  if (pass.length === 0) return destination;
  try {
    const url = new URL(destination);
    for (const [key, value] of pass) {
      // Never overwrite a parameter the owner put on the destination themselves.
      if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    return destination;
  }
}

function inactiveUrl(code: string, reason: string, resumesAt?: string | null): string {
  const params = new URLSearchParams({ reason });
  if (resumesAt) params.set('resumes', resumesAt);
  return `${env.appUrl}/inactive/${encodeURIComponent(code)}?${params.toString()}`;
}

function destinationFor(qr: ResolvedQr, client: ReturnType<typeof parseClient>): string | null {
  const content = (qr.content ?? {}) as Record<string, unknown>;

  if (qr.type === 'APP_STORE') {
    return pickAppStoreUrl(
      {
        iosUrl: typeof content.iosUrl === 'string' ? content.iosUrl : null,
        androidUrl: typeof content.androidUrl === 'string' ? content.androidUrl : null,
        otherUrl: typeof content.otherUrl === 'string' ? content.otherUrl : null,
      },
      client.userAgent,
    );
  }

  const rules: DestinationRule[] = qr.destinations.map((destination) => ({
    kind: destination.kind,
    matchValue: destination.matchValue,
    url: destination.url,
    priority: destination.priority,
  }));

  // Codes whose destination lives only in `content` still resolve.
  if (!rules.some((rule) => rule.kind === 'DEFAULT') && typeof content.url === 'string') {
    rules.push({ kind: 'DEFAULT', url: content.url, priority: 0 });
  }

  return pickDestination(rules, {
    country: client.country,
    language: client.language,
    deviceType: client.deviceType,
    now: new Date(),
  });
}

export async function handleScan(request: Request, code: string): Promise<NextResponse> {
  const url = new URL(request.url);
  const host = requestHost(request.headers);
  const preview = url.searchParams.get('preview') === '1';

  const qr = await resolveQr({ host, code });

  if (!qr || qr.kind === 'STATIC') {
    return NextResponse.redirect(inactiveUrl(code, 'not_found'), 302);
  }
  if (qr.workspace.isDisabled) {
    return NextResponse.redirect(inactiveUrl(code, 'admin_disabled'), 302);
  }

  const [passwordVerified, settings] = await Promise.all([
    isPasswordVerified(qr.id, qr.passwordHash),
    // Cached for 20 seconds, so this costs nothing on the hot path.
    getSettings().catch(() => null),
  ]);

  const access = evaluateAccess(
    {
      status: qr.status,
      deletedAt: qr.deletedAt,
      passwordHash: qr.passwordHash,
      scheduleEnabled: qr.scheduleEnabled,
      scheduleStart: qr.scheduleStart,
      scheduleEnd: qr.scheduleEnd,
      timeRules: (qr.timeRules as TimeRule[] | null) ?? null,
      scanLimitEnabled: qr.scanLimitEnabled,
      scanLimitMax: qr.scanLimitMax,
      scanCount: qr.scanCount,
      createdAt: qr.createdAt,
      lastScanAt: qr.lastScanAt,
    },
    { passwordVerified, timeZone: 'UTC', expiry: expiryPolicyFromSettings(settings) },
  );

  const client = parseClient(request.headers);
  const ipHash = hashIp(client.ip);
  const visitorHash = visitorFingerprint([ipHash, client.userAgent, qr.id]);

  if (access.kind === 'password') {
    return NextResponse.redirect(`${env.appUrl}/p/${encodeURIComponent(code)}`, 302);
  }

  if (access.kind === 'inactive') {
    // A blocked scan is still worth recording: it tells the owner the code is in use.
    if (!preview && !client.isBot) {
      void enqueue('scan.record', {
        qrCodeId: qr.id,
        workspaceId: qr.workspaceId,
        kind: 'BLOCKED',
        ipHash,
        visitorHash,
        country: client.country,
        region: client.region,
        city: client.city,
        deviceType: client.deviceType,
        browser: client.browser,
        os: client.os,
        language: client.language,
        referrer: client.referrer,
        destinationUrl: null,
        scannedAt: new Date().toISOString(),
      });
    }
    return NextResponse.redirect(inactiveUrl(code, access.reason, access.resumesAt), 302);
  }

  // Hosted landing types render in place, keeping the short URL in the address bar.
  const hosted = isHostedType(qr.type);
  let destination: string | null = null;

  if (!hosted) {
    destination = destinationFor(qr, client);
    if (!destination) {
      logger.warn('dynamic code has no destination', { qrCodeId: qr.id });
      return NextResponse.redirect(inactiveUrl(code, 'no_destination'), 302);
    }
    destination = applyUtm(destination, (qr.utm as UtmConfig | null) ?? null);
    destination = forwardParams(destination, url.searchParams);
  }

  if (!preview && !client.isBot) {
    void enqueue('scan.record', {
      qrCodeId: qr.id,
      workspaceId: qr.workspaceId,
      kind: 'SCAN',
      ipHash,
      visitorHash,
      country: client.country,
      region: client.region,
      city: client.city,
      deviceType: client.deviceType,
      browser: client.browser,
      os: client.os,
      language: client.language,
      referrer: client.referrer,
      destinationUrl: destination,
      utm: {
        source: url.searchParams.get('utm_source'),
        medium: url.searchParams.get('utm_medium'),
        campaign: url.searchParams.get('utm_campaign'),
        term: url.searchParams.get('utm_term'),
        content: url.searchParams.get('utm_content'),
      },
      scannedAt: new Date().toISOString(),
    });
  }

  if (hosted) {
    const target = new URL(`/l/${qr.id}`, env.appUrl);
    target.search = url.search;
    const response = NextResponse.rewrite(target);
    response.headers.set('cache-control', 'no-store');
    return response;
  }

  const response = NextResponse.redirect(destination as string, 302);
  response.headers.set('cache-control', 'no-store, no-cache, must-revalidate');
  response.headers.set('referrer-policy', 'no-referrer-when-downgrade');
  return response;
}

/** Some printers and link checkers send a HEAD request before the real scan. */
export async function headScan(request: Request, code: string): Promise<NextResponse> {
  const qr = await resolveQr({ host: requestHost(request.headers), code });
  if (!qr) return new NextResponse(null, { status: 404 });
  return new NextResponse(null, { status: 200, headers: { 'cache-control': 'no-store' } });
}
