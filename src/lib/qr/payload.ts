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

const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/;

/**
 * iCalendar date for a QR event. A value without a time zone (what a datetime-local
 * input produces) becomes "floating" local time, so the phone shows the time the
 * organiser typed — whichever machine builds the code. Values with a zone stay in UTC.
 */
function toICalDate(value: unknown, allDay = false, addDays = 0): string {
  const raw = s(value).trim();
  if (!raw) return '';
  const local = LOCAL_DATE_TIME.exec(raw);
  if (local) {
    const [, y, mo, d, h = '00', mi = '00', sec = '00'] = local;
    const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d) + addDays));
    if (Number.isNaN(date.getTime())) return '';
    const day = date.toISOString().slice(0, 10).replace(/-/g, '');
    return allDay ? day : `${day}T${h}${mi}${sec}`;
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  if (addDays) d.setUTCDate(d.getUTCDate() + addDays);
  if (allDay) {
    return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  }
  return `${d.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

/** Query string with %20 for spaces: mail and wallet apps show a literal "+" otherwise. */
function query(params: Array<[string, unknown]>): string {
  const parts = params
    .filter(([, value]) => s(value).trim() !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(s(value))}`);
  return parts.length ? `?${parts.join('&')}` : '';
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
  const to = s(c.to || c.email).trim();
  return `mailto:${to}${query([['subject', c.subject], ['body', c.body], ['cc', c.cc]])}`;
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
  // A Google Maps link rather than a geo: URI: the iPhone camera does nothing with geo:,
  // while this opens the maps app (or the browser) on every phone.
  const lat = s(c.latitude).trim();
  const lng = s(c.longitude).trim();
  const target = lat && lng ? `${lat},${lng}` : s(c.query).trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`;
}

export function buildEventPayload(c: StaticContent): string {
  const allDay = Boolean(c.allDay);
  // A bare VEVENT is the event format iPhone and Android cameras recognise in a QR code.
  const lines = ['BEGIN:VEVENT', `SUMMARY:${escapeVcard(s(c.title))}`];
  const start = toICalDate(c.start, allDay);
  // An all-day event's end date is exclusive: a one-day event ends the following day.
  const end = allDay ? toICalDate(c.end || c.start, true, 1) : toICalDate(c.end, false);
  if (start) lines.push(allDay ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`);
  if (end) lines.push(allDay ? `DTEND;VALUE=DATE:${end}` : `DTEND:${end}`);
  if (c.location) lines.push(`LOCATION:${escapeVcard(s(c.location))}`);
  if (c.description) lines.push(`DESCRIPTION:${escapeVcard(s(c.description))}`);
  if (c.url) lines.push(`URL:${escapeVcard(s(c.url))}`);
  lines.push('END:VEVENT');
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
  const address = s(c.address).trim();
  return `${scheme}:${address}${query([['amount', s(c.amount).trim()], ['label', c.label], ['message', c.message]])}`;
}

/** Builds the string encoded in a STATIC QR code. */
export function buildStaticPayload(type: string, content: StaticContent): string {
  switch (type) {
    case 'URL': {
      // Without a scheme phones show "example.com" as text instead of opening it.
      const url = s(content.url).trim();
      return url && !/^[a-z][a-z0-9+.-]*:/i.test(url) ? `https://${url}` : url;
    }
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
