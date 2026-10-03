import 'server-only';
import { UAParser } from 'ua-parser-js';

/** Extracts the bits of a request QR ALTRIX needs, from any reverse-proxy setup. */

export interface ClientInfo {
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  language: string | null;
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'other';
  browser: string | null;
  os: string | null;
  referrer: string | null;
  isBot: boolean;
}

type HeaderSource = Headers | { get(name: string): string | null };

function header(headers: HeaderSource, name: string): string | null {
  const value = headers.get(name);
  return value && value.trim() !== '' ? value.trim() : null;
}

export function clientIp(headers: HeaderSource): string | null {
  const forwarded = header(headers, 'x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return (
    header(headers, 'cf-connecting-ip') ??
    header(headers, 'x-real-ip') ??
    header(headers, 'x-client-ip') ??
    null
  );
}

/**
 * Geo comes from the edge/proxy when available (Cloudflare, Nginx GeoIP module or any
 * CDN that sets these headers). No third-party lookup happens at request time.
 */
export function geoFromHeaders(headers: HeaderSource): { country: string | null; region: string | null; city: string | null } {
  const country =
    header(headers, 'cf-ipcountry') ??
    header(headers, 'x-vercel-ip-country') ??
    header(headers, 'x-geoip-country-code') ??
    header(headers, 'x-country-code');
  const region =
    header(headers, 'x-vercel-ip-country-region') ??
    header(headers, 'x-geoip-region') ??
    header(headers, 'cf-region-code');
  const city =
    header(headers, 'x-vercel-ip-city') ??
    header(headers, 'x-geoip-city') ??
    header(headers, 'cf-ipcity');

  const decode = (value: string | null) => {
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  return {
    country: country ? country.toUpperCase().slice(0, 2) : null,
    region: decode(region),
    city: decode(city),
  };
}

export function primaryLanguage(headers: HeaderSource): string | null {
  const accept = header(headers, 'accept-language');
  if (!accept) return null;
  const first = accept.split(',')[0]?.trim();
  if (!first) return null;
  return first.toLowerCase().slice(0, 12);
}

const BOT_PATTERN =
  /bot|crawler|spider|crawling|facebookexternalhit|slackbot|whatsapp|telegrambot|discordbot|preview|headless|curl|wget|python-requests|axios|postman|monitor|uptime/i;

export function parseClient(headers: HeaderSource): ClientInfo {
  const userAgent = header(headers, 'user-agent') ?? '';
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  const geo = geoFromHeaders(headers);
  const isBot = BOT_PATTERN.test(userAgent);

  let deviceType: ClientInfo['deviceType'] = 'desktop';
  if (isBot) deviceType = 'bot';
  else if (result.device.type === 'mobile') deviceType = 'mobile';
  else if (result.device.type === 'tablet') deviceType = 'tablet';
  else if (result.device.type === 'wearable' || result.device.type === 'console' || result.device.type === 'smarttv')
    deviceType = 'other';

  const referrerRaw = header(headers, 'referer') ?? header(headers, 'referrer');
  let referrer: string | null = null;
  if (referrerRaw) {
    try {
      referrer = new URL(referrerRaw).hostname;
    } catch {
      referrer = referrerRaw.slice(0, 120);
    }
  }

  return {
    ip: clientIp(headers),
    country: geo.country,
    region: geo.region,
    city: geo.city,
    language: primaryLanguage(headers),
    userAgent: userAgent.slice(0, 400),
    deviceType,
    browser: result.browser.name ?? null,
    os: result.os.name ?? null,
    referrer,
    isBot,
  };
}

/** The hostname a request arrived on — used to resolve custom short domains. */
export function requestHost(headers: HeaderSource): string | null {
  const host = header(headers, 'x-forwarded-host') ?? header(headers, 'host');
  if (!host) return null;
  return host.split(':')[0].toLowerCase();
}
