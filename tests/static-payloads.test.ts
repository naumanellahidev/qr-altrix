import { describe, expect, it } from 'vitest';
import { buildStaticPayload } from '@/lib/qr/payload';

describe('URL and text', () => {
  it('encodes a URL verbatim', () => {
    expect(buildStaticPayload('URL', { url: 'https://example.com/a?b=c' })).toBe('https://example.com/a?b=c');
  });

  it('encodes text verbatim, including newlines', () => {
    expect(buildStaticPayload('TEXT', { text: 'line one\nline two' })).toBe('line one\nline two');
  });
});

describe('Wi-Fi', () => {
  it('builds a WPA network string', () => {
    const payload = buildStaticPayload('WIFI', { ssid: 'Cafe-Guest', encryption: 'WPA', password: 'hunter22' });
    expect(payload).toBe('WIFI:T:WPA;S:Cafe-Guest;P:hunter22;;');
  });

  it('uses nopass for an open network and omits the password', () => {
    const payload = buildStaticPayload('WIFI', { ssid: 'Open', encryption: 'NONE', password: 'ignored' });
    expect(payload).toBe('WIFI:T:nopass;S:Open;;');
  });

  it('marks hidden networks', () => {
    const payload = buildStaticPayload('WIFI', { ssid: 'Hidden', encryption: 'WPA', password: 'x', hidden: true });
    expect(payload).toContain('H:true');
  });

  it('escapes the reserved characters so the string cannot be broken', () => {
    const payload = buildStaticPayload('WIFI', { ssid: 'My;Net,work', encryption: 'WPA', password: 'a:b\\c"d' });
    expect(payload).toContain('S:My\\;Net\\,work');
    expect(payload).toContain('P:a\\:b\\\\c\\"d');
  });
});

describe('vCard', () => {
  it('produces a valid vCard 3.0 with CRLF line endings', () => {
    const payload = buildStaticPayload('VCARD', {
      firstName: 'Ayesha',
      lastName: 'Khan',
      company: 'Altrix',
      jobTitle: 'Head of Design',
      phone: '+92 300 1234567',
      email: 'ayesha@example.com',
      website: 'https://example.com',
      city: 'Lahore',
      country: 'Pakistan',
    });

    expect(payload.startsWith('BEGIN:VCARD\r\nVERSION:3.0')).toBe(true);
    expect(payload.endsWith('END:VCARD')).toBe(true);
    expect(payload).toContain('N:Khan;Ayesha;;;');
    expect(payload).toContain('FN:Ayesha Khan');
    expect(payload).toContain('ORG:Altrix');
    expect(payload).toContain('TITLE:Head of Design');
    expect(payload).toContain('TEL;TYPE=CELL:+923001234567');
    expect(payload).toContain('EMAIL;TYPE=INTERNET:ayesha@example.com');
    expect(payload).toContain('ADR;TYPE=WORK:;;;Lahore;;;Pakistan');
  });

  it('escapes semicolons, commas and newlines in free text', () => {
    const payload = buildStaticPayload('VCARD', { firstName: 'A', note: 'Floor 3; Suite 4, back\nentrance' });
    expect(payload).toContain('NOTE:Floor 3\\; Suite 4\\, back\\nentrance');
  });
});

describe('contact actions', () => {
  it('builds a mailto with subject and body', () => {
    const payload = buildStaticPayload('EMAIL', { to: 'hi@example.com', subject: 'Hello there', body: 'A & B' });
    expect(payload.startsWith('mailto:hi@example.com?')).toBe(true);
    expect(payload).toContain('subject=Hello+there');
    expect(payload).toContain('body=A+%26+B');
  });

  it('builds an SMSTO string with the message', () => {
    expect(buildStaticPayload('SMS', { phone: '+92 300 1234567', message: 'Hi' })).toBe('SMSTO:+923001234567:Hi');
  });

  it('builds a wa.me link without the leading plus', () => {
    const payload = buildStaticPayload('WHATSAPP', { phone: '+92 300 1234567', message: 'Hi there' });
    expect(payload).toBe('https://wa.me/923001234567?text=Hi%20there');
  });

  it('builds a tel link', () => {
    expect(buildStaticPayload('PHONE', { phone: '+92 (300) 123-4567' })).toBe('tel:+923001234567');
  });
});

describe('location', () => {
  it('builds a geo URI from coordinates', () => {
    expect(buildStaticPayload('LOCATION', { latitude: '31.5204', longitude: '74.3587' })).toBe(
      'geo:31.5204,74.3587',
    );
  });

  it('includes a label when one is given', () => {
    const payload = buildStaticPayload('LOCATION', { latitude: '31.5', longitude: '74.3', label: 'Our shop' });
    expect(payload).toContain('(Our%20shop)');
  });

  it('falls back to a maps search when only an address is given', () => {
    const payload = buildStaticPayload('LOCATION', { query: 'Mall Road, Lahore' });
    expect(payload).toBe('https://www.google.com/maps/search/?api=1&query=Mall%20Road%2C%20Lahore');
  });
});

describe('calendar', () => {
  it('builds a VEVENT with UTC timestamps', () => {
    const payload = buildStaticPayload('EVENT', {
      title: 'Launch',
      start: '2026-07-01T17:00:00.000Z',
      end: '2026-07-01T20:00:00.000Z',
      location: 'Alhamra, Lahore',
    });
    expect(payload).toContain('BEGIN:VEVENT');
    expect(payload).toContain('SUMMARY:Launch');
    expect(payload).toContain('DTSTART:20260701T170000Z');
    expect(payload).toContain('DTEND:20260701T200000Z');
    expect(payload).toContain('LOCATION:Alhamra\\, Lahore');
  });

  it('uses date-only values for all-day events', () => {
    const payload = buildStaticPayload('EVENT', { title: 'Holiday', start: '2026-07-01T00:00:00.000Z', allDay: true });
    expect(payload).toContain('DTSTART;VALUE=DATE:20260701');
  });

  it('skips unparseable dates rather than emitting rubbish', () => {
    const payload = buildStaticPayload('EVENT', { title: 'Broken', start: 'not a date' });
    expect(payload).not.toContain('DTSTART');
  });
});

describe('crypto', () => {
  it('maps a coin name to its URI scheme and appends the amount', () => {
    expect(buildStaticPayload('CRYPTO', { coin: 'btc', address: '1A1zP1', amount: '0.5' })).toBe(
      'bitcoin:1A1zP1?amount=0.5',
    );
  });

  it('omits the query string when there is nothing to add', () => {
    expect(buildStaticPayload('CRYPTO', { coin: 'ethereum', address: '0xabc' })).toBe('ethereum:0xabc');
  });
});

describe('unknown types', () => {
  it('falls back to text or url rather than throwing', () => {
    expect(buildStaticPayload('MYSTERY', { text: 'hello' })).toBe('hello');
    expect(buildStaticPayload('MYSTERY', {})).toBe('');
  });
});
