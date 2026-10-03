/**
 * Encoders that turn structured QR content into the exact string stored in the symbol.
 * Static codes embed these strings directly; dynamic codes embed a short URL instead.
 */

export type StaticContent = Record<string, unknown>;

function s(value: unknown): string {
  if (value === undefined || value === null) return '';
  return String(value);
}

/** Wi-Fi / MeCard style escaping: \ ; , : and " must be backslash-escaped. */
function escapeMecard(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

function escapeVcard(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function toICalDate(value: unknown, allDay = false): string {
  const raw = s(value);
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  if (allDay) {
    return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  }
  return `${d.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

function digitsOnly(value: unknown): string {
  return s(value).replace(/[^\d+]/g, '');
}

export function buildWifiPayload(c: StaticContent): string {
  const encryption = s(c.encryption || 'WPA').toUpperCase();
  const parts = [`T:${encryption === 'NONE' ? 'nopass' : encryption}`];
  parts.push(`S:${escapeMecard(s(c.ssid))}`);
  if (encryption !== 'NONE' && c.password) parts.push(`P:${escapeMecard(s(c.password))}`);
  if (c.hidden) parts.push('H:true');
  return `WIFI:${parts.join(';')};;`;
}

export function buildVcardPayload(c: StaticContent): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  const first = s(c.firstName);
  const last = s(c.lastName);
  lines.push(`N:${escapeVcard(last)};${escapeVcard(first)};;;`);
  lines.push(`FN:${escapeVcard(`${first} ${last}`.trim())}`);
  if (c.company) lines.push(`ORG:${escapeVcard(s(c.company))}`);
  if (c.jobTitle) lines.push(`TITLE:${escapeVcard(s(c.jobTitle))}`);
  if (c.phone) lines.push(`TEL;TYPE=CELL:${digitsOnly(c.phone)}`);
  if (c.phoneWork) lines.push(`TEL;TYPE=WORK:${digitsOnly(c.phoneWork)}`);
  if (c.email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVcard(s(c.email))}`);
  if (c.website) lines.push(`URL:${escapeVcard(s(c.website))}`);
  const address = [c.street, c.city, c.state, c.zip, c.country].map((p) => escapeVcard(s(p)));
  if (address.some(Boolean)) lines.push(`ADR;TYPE=WORK:;;${address[0]};${address[1]};${address[2]};${address[3]};${address[4]}`);
  if (c.note) lines.push(`NOTE:${escapeVcard(s(c.note))}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function buildEmailPayload(c: StaticContent): string {
  const to = s(c.to || c.email);
  const params = new URLSearchParams();
  if (c.subject) params.set('subject', s(c.subject));
  if (c.body) params.set('body', s(c.body));
  if (c.cc) params.set('cc', s(c.cc));
  const qs = params.toString();
  return `mailto:${to}${qs ? `?${qs}` : ''}`;
}

export function buildSmsPayload(c: StaticContent): string {
  const number = digitsOnly(c.phone);
  const message = s(c.message);
  return message ? `SMSTO:${number}:${message}` : `SMSTO:${number}`;
}

export function buildWhatsappPayload(c: StaticContent): string {
  const number = digitsOnly(c.phone).replace(/^\+/, '');
  const message = s(c.message);
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function buildLocationPayload(c: StaticContent): string {
  const lat = s(c.latitude);
  const lng = s(c.longitude);
  if (c.query && !lat) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s(c.query))}`;
  }
  const label = s(c.label);
  return label ? `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})` : `geo:${lat},${lng}`;
}

export function buildEventPayload(c: StaticContent): string {
  const allDay = Boolean(c.allDay);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QR ALTRIX//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${escapeVcard(s(c.title))}`,
  ];
  const start = toICalDate(c.start, allDay);
  const end = toICalDate(c.end, allDay);
  if (start) lines.push(allDay ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`);
  if (end) lines.push(allDay ? `DTEND;VALUE=DATE:${end}` : `DTEND:${end}`);
  if (c.location) lines.push(`LOCATION:${escapeVcard(s(c.location))}`);
  if (c.description) lines.push(`DESCRIPTION:${escapeVcard(s(c.description))}`);
  if (c.url) lines.push(`URL:${escapeVcard(s(c.url))}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

const CRYPTO_SCHEMES: Record<string, string> = {
  bitcoin: 'bitcoin',
  btc: 'bitcoin',
  ethereum: 'ethereum',
  eth: 'ethereum',
  litecoin: 'litecoin',
  ltc: 'litecoin',
  dogecoin: 'dogecoin',
  bitcoincash: 'bitcoincash',
  monero: 'monero',
  tron: 'tron',
  solana: 'solana',
};

export function buildCryptoPayload(c: StaticContent): string {
  const coin = s(c.coin || 'bitcoin').toLowerCase();
  const scheme = CRYPTO_SCHEMES[coin] ?? coin;
  const address = s(c.address);
  const params = new URLSearchParams();
  if (c.amount) params.set('amount', s(c.amount));
  if (c.label) params.set('label', s(c.label));
  if (c.message) params.set('message', s(c.message));
  const qs = params.toString();
  return `${scheme}:${address}${qs ? `?${qs}` : ''}`;
}

/** Builds the string encoded in a STATIC QR code. */
export function buildStaticPayload(type: string, content: StaticContent): string {
  switch (type) {
    case 'URL':
      return s(content.url);
    case 'TEXT':
      return s(content.text);
    case 'WIFI':
      return buildWifiPayload(content);
    case 'VCARD':
      return buildVcardPayload(content);
    case 'EMAIL':
      return buildEmailPayload(content);
    case 'WHATSAPP':
      return buildWhatsappPayload(content);
    case 'SMS':
      return buildSmsPayload(content);
    case 'PHONE':
      return `tel:${digitsOnly(content.phone)}`;
    case 'LOCATION':
      return buildLocationPayload(content);
    case 'EVENT':
    case 'CALENDAR':
      return buildEventPayload(content);
    case 'CRYPTO':
      return buildCryptoPayload(content);
    default:
      return s(content.text ?? content.url ?? '');
  }
}
