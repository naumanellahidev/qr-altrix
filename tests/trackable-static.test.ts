import { describe, expect, it } from 'vitest';
import { buildStaticPayload } from '@/lib/qr/payload';
import { isValidHttpUrl } from '@/lib/utils';

// The builder saves these static types as a counted Website redirect whose destination is
// the static payload, so the payload must always be a web link the redirect can follow.
describe('static types the builder can count', () => {
  it('Website stays a web link, and gains https:// when it was left off', () => {
    expect(buildStaticPayload('URL', { url: 'qraltrix.co.uk/menu' })).toBe('https://qraltrix.co.uk/menu');
    expect(isValidHttpUrl(buildStaticPayload('URL', { url: 'https://example.com/a?b=1' }))).toBe(true);
  });

  it('WhatsApp becomes a wa.me link', () => {
    const payload = buildStaticPayload('WHATSAPP', { phone: '+92 300 1234567', message: 'Hi there' });
    expect(payload).toBe('https://wa.me/923001234567?text=Hi%20there');
    expect(isValidHttpUrl(payload)).toBe(true);
  });

  it('Location becomes a maps link, from coordinates or an address', () => {
    expect(isValidHttpUrl(buildStaticPayload('LOCATION', { latitude: '31.52', longitude: '74.35' }))).toBe(true);
    expect(isValidHttpUrl(buildStaticPayload('LOCATION', { query: 'Mall Road, Lahore' }))).toBe(true);
  });
});
