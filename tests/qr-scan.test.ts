import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import { beforeAll, describe, expect, it } from 'vitest';
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader';
import { buildStaticPayload } from '@/lib/qr/payload';
import { exportQr } from '@/lib/qr/export';
import { effectiveErrorCorrection, logoPlate, MAX_LOGO_PLATE } from '@/lib/qr/scan-safe';
import { parseRange } from '@/lib/http-range';
import type { QrDesign } from '@/lib/qr/types';

/**
 * End-to-end scan checks: every static type is rendered through the real download path
 * (exportQr → PNG, credit line included) and decoded with ZXing, the decoder family phone
 * cameras use. A design the editor allows must never produce a code a phone cannot read.
 */

const require = createRequire(import.meta.url);

beforeAll(async () => {
  await prepareZXingModule({
    overrides: { wasmBinary: new Uint8Array(readFileSync(require.resolve('zxing-wasm/reader/zxing_reader.wasm'))).buffer },
    fireImmediately: true,
  });
});

async function scan(png: Buffer, width?: number): Promise<string | null> {
  let image = sharp(png).flatten({ background: '#ffffff' });
  if (width) image = image.resize({ width }).blur(0.6);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const results = await readBarcodes(
    { data: new Uint8ClampedArray(data), width: info.width, height: info.height, colorSpace: 'srgb' },
    { formats: ['QRCode'], tryHarder: true, tryInvert: true },
  );
  return results.find((result) => result.isValid)?.text ?? null;
}

async function render(payload: string, design: Partial<QrDesign>): Promise<Buffer> {
  const { body } = await exportQr({
    data: payload,
    design,
    format: 'png',
    size: 600,
    branding: 'Free QR codes by QR ALTRIX · qr.altrixcore.com',
  });
  return body;
}

const SAMPLES: Array<[string, Record<string, unknown>]> = [
  ['URL', { url: 'https://qr.altrixcore.com/guides?utm_source=print' }],
  ['TEXT', { text: 'Serial 4471-B. Service every 6 months; call +92 300 1234567.' }],
  ['WIFI', { ssid: 'Cafe Guest 5G', encryption: 'WPA', password: 'p@ss;word:2026' }],
  ['WIFI', { ssid: 'Dana pani', encryption: 'NONE', password: 'ignored', hidden: true }],
  ['VCARD', { firstName: 'Nauman', lastName: 'Cheema', company: 'ALTRIX', phone: '+92 300 1234567', email: 'hello@altrixcore.com', city: 'Lahore' }],
  ['EMAIL', { to: 'support@altrixcore.com', subject: 'Quote request', body: 'Please call me back.' }],
  ['WHATSAPP', { phone: '+92 300 1234567', message: 'Hi! I scanned your QR code' }],
  ['SMS', { phone: '+92 300 1234567', message: 'JOIN' }],
  ['PHONE', { phone: '+92 300 1234567' }],
  ['LOCATION', { latitude: '31.5204', longitude: '74.3587' }],
  ['EVENT', { title: 'Launch party', start: '2026-11-01T18:00', end: '2026-11-01T21:00', location: 'Lahore' }],
  ['CRYPTO', { coin: 'bitcoin', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', amount: '0.001' }],
];

/** The design of a Wi-Fi code that was reported as unscannable, with a preset logo. */
const REPORTED: Partial<QrDesign> = {
  bodyShape: 'diamond', eyeFrameShape: 'cut', eyeBallShape: 'dot-grid', errorCorrection: 'M',
  logoPreset: 'wifi', logoSize: 34, logoPadding: 10, logoShape: 'rounded',
};

describe('every static type scans', () => {
  for (const [type, content] of SAMPLES) {
    const payload = buildStaticPayload(type, content);
    it(`${type}: default design and the reported risky design`, async () => {
      expect(await scan(await render(payload, {}))).toBe(payload);
      const risky = await render(payload, REPORTED);
      expect(await scan(risky)).toBe(payload);
      expect(await scan(risky, 320)).toBe(payload);
    });
  }
});

describe('every shape scans', () => {
  const payload = buildStaticPayload('WIFI', { ssid: 'Dana pani', encryption: 'NONE', hidden: true });
  const shapes: Array<[keyof QrDesign, string[]]> = [
    ['bodyShape', ['square', 'dots', 'rounded', 'classy', 'extra-rounded', 'mosaic', 'diamond']],
    ['eyeFrameShape', ['square', 'rounded', 'circle', 'leaf', 'leaf-flipped', 'shield', 'cut', 'frame-dots']],
    ['eyeBallShape', ['square', 'rounded', 'circle', 'diamond', 'leaf', 'flower', 'dot-grid']],
  ];
  for (const [key, values] of shapes) {
    for (const value of values) {
      it(`${key}: ${value}`, async () => {
        const png = await render(payload, { [key]: value });
        expect(await scan(png)).toBe(payload);
        expect(await scan(png, 300)).toBe(payload);
      });
    }
  }
});

describe('logos never break a code', () => {
  it('raises error correction for any logo', () => {
    expect(effectiveErrorCorrection({ errorCorrection: 'M', logoSize: 14, logoPadding: 4 }, true)).toBe('Q');
    expect(effectiveErrorCorrection({ errorCorrection: 'M', logoSize: 34, logoPadding: 10 }, true)).toBe('H');
    expect(effectiveErrorCorrection({ errorCorrection: 'L', logoSize: 34, logoPadding: 10 }, false)).toBe('L');
  });

  it('caps the logo plate', () => {
    expect(logoPlate({ logoSize: 34, logoPadding: 24 }).plate).toBeCloseTo(MAX_LOGO_PLATE, 5);
    expect(logoPlate({ logoSize: 16, logoPadding: 4 }).plate).toBeCloseTo(0.2, 5);
  });

  it('a maximum-size logo at error correction L still scans', async () => {
    const payload = buildStaticPayload('URL', { url: 'https://qr.altrixcore.com/menu' });
    const png = await render(payload, { logoPreset: 'menu', logoSize: 34, logoPadding: 24, logoShape: 'square', errorCorrection: 'L' });
    expect(await scan(png)).toBe(payload);
  });
});

describe('byte ranges for media playback', () => {
  it('parses the forms browsers send', () => {
    expect(parseRange(null, 100)).toBeNull();
    expect(parseRange('bytes=0-', 100)).toEqual([0, 99]);
    expect(parseRange('bytes=0-1', 100)).toEqual([0, 1]);
    expect(parseRange('bytes=10-500', 100)).toEqual([10, 99]);
    expect(parseRange('bytes=-20', 100)).toEqual([80, 99]);
    expect(parseRange('bytes=100-', 100)).toBe('invalid');
    expect(parseRange('items=0-1', 100)).toBeNull();
  });
});
