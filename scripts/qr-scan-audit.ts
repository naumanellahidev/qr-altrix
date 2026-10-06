/**
 * Scan audit: renders every static QR type through the real download path (exportQr → PNG)
 * across many designs, then decodes the image the way a phone would and checks the payload
 * survives intact. Each image is decoded twice: crisp, and shrunk + blurred like a camera
 * frame from arm's length.
 *
 *   node --conditions=react-server --import tsx scripts/qr-scan-audit.ts [TYPE...]
 *   DESIGN=<regex> limits the run to matching design labels.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import jsQR from 'jsqr';
import sharp from 'sharp';
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader';
import { buildStaticPayload } from '../src/lib/qr/payload';
import { exportQr } from '../src/lib/qr/export';
import type { QrDesign } from '../src/lib/qr/types';

const SAMPLES: Record<string, Record<string, unknown>> = {
  URL: { url: 'https://qraltrix.co.uk/guides?utm_source=print' },
  TEXT: { text: 'Serial 4471-B. Service every 6 months; call +92 300 1234567.' },
  WIFI: { ssid: 'Cafe Guest 5G', encryption: 'WPA', password: 'p@ss;word:2026', hidden: false },
  WIFI_OPEN: { ssid: 'Dana pani', encryption: 'NONE', password: 'ignored', hidden: true },
  VCARD: {
    firstName: 'Nauman', lastName: 'Cheema', company: 'ALTRIX, Ltd.', jobTitle: 'Founder', phone: '+92 300 1234567',
    email: 'hello@qraltrix.co.uk', website: 'https://qraltrix.co.uk', street: '12 Mall Road', city: 'Lahore',
    country: 'Pakistan', note: 'Met at Expo; follow up',
  },
  EMAIL: { to: 'support@qraltrix.co.uk', subject: 'Quote request – Table 12', body: 'Hi team, please call me back.' },
  WHATSAPP: { phone: '+92 300 1234567', message: 'Hi! I scanned your QR code & want to order' },
  SMS: { phone: '+92 300 1234567', message: 'JOIN rewards' },
  PHONE: { phone: '+92 300 1234567' },
  LOCATION: { latitude: '31.5204', longitude: '74.3587', label: 'ALTRIX Office' },
  LOCATION_QUERY: { query: 'Mall Road, Lahore' },
  EVENT: { title: 'Launch party', start: '2026-11-01T18:00', end: '2026-11-01T21:00', location: 'Lahore, PK', description: 'Food, music; fun' },
  CALENDAR: { title: 'Weekly sync', start: '2026-11-03T10:00', end: '2026-11-03T10:30', location: 'Room 4B', description: 'Agenda: roadmap' },
  CRYPTO: { coin: 'bitcoin', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', amount: '0.001', label: 'ALTRIX Tips', message: 'Thank you' },
};

const typeOf = (key: string) => key.replace(/_(OPEN|QUERY)$/, '');

const DESIGNS: Array<[string, Partial<QrDesign>]> = [['default', {}]];
for (const bodyShape of ['square', 'dots', 'rounded', 'classy', 'extra-rounded', 'mosaic', 'diamond'] as const) {
  DESIGNS.push([`body:${bodyShape}`, { bodyShape }]);
}
for (const eyeFrameShape of ['square', 'rounded', 'circle', 'leaf', 'leaf-flipped', 'shield', 'cut', 'frame-dots'] as const) {
  DESIGNS.push([`eyeFrame:${eyeFrameShape}`, { eyeFrameShape }]);
}
for (const eyeBallShape of ['square', 'rounded', 'circle', 'diamond', 'leaf', 'flower', 'dot-grid'] as const) {
  DESIGNS.push([`eyeBall:${eyeBallShape}`, { eyeBallShape }]);
}
for (const errorCorrection of ['L', 'M', 'Q', 'H'] as const) DESIGNS.push([`ec:${errorCorrection}`, { errorCorrection }]);
for (const logoSize of [20, 26, 34]) {
  for (const errorCorrection of ['M', 'H'] as const) {
    DESIGNS.push([`logo ${logoSize}% pad10 ${errorCorrection}`, { logoPreset: 'wifi', logoSize, logoPadding: 10, logoShape: 'rounded', errorCorrection }]);
  }
}
DESIGNS.push(['gradient', { gradientEnabled: true }]);
DESIGNS.push(['invert', { invert: true }]);
DESIGNS.push(['margin:2', { margin: 2 }]);
for (const frame of ['banner-bottom', 'card', 'pin', 'phone', 'ticket', 'poster', 'bubble', 'ribbon']) {
  DESIGNS.push([`frame:${frame}`, { frame, ctaText: 'SCAN ME' }]);
}
// The design of the Wi-Fi code reported as unscannable (logo swapped for a preset of the same size).
for (const logoSize of [20, 34]) {
  DESIGNS.push([`user-report logo ${logoSize}%`, {
    bodyShape: 'diamond', eyeFrameShape: 'cut', eyeBallShape: 'dot-grid', errorCorrection: 'M',
    logoPreset: 'wifi', logoSize, logoPadding: 10, logoShape: 'rounded',
  }]);
}

type Decoder = (png: Buffer) => Promise<string | null>;

async function rgba(png: Buffer) {
  const { data, info } = await sharp(png).flatten({ background: '#ffffff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength), width: info.width, height: info.height };
}

const jsqrDecode: Decoder = async (png) => {
  const { data, width, height } = await rgba(png);
  return jsQR(data, width, height, { inversionAttempts: 'attemptBoth' })?.data ?? null;
};

async function zxingDecoder(): Promise<Decoder> {
  const wasm = readFileSync(createRequire(import.meta.url).resolve('zxing-wasm/reader/zxing_reader.wasm'));
  await prepareZXingModule({ overrides: { wasmBinary: new Uint8Array(wasm).buffer }, fireImmediately: true });
  return async (png) => {
    const { data, width, height } = await rgba(png);
    const results = await readBarcodes(
      { data: new Uint8ClampedArray(data), width, height, colorSpace: 'srgb' },
      { formats: ['QRCode'], tryHarder: true, tryInvert: true },
    );
    return results.find((r) => r.isValid)?.text ?? null;
  };
}

/**
 * Roughly what a phone camera sees from a little distance: small and a touch soft. A phone
 * reads many frames at slightly different scales, so two scales are tried, not one.
 */
async function cameraFrames(png: Buffer): Promise<Buffer[]> {
  return Promise.all(
    [250, 310].map((width) => sharp(png).flatten({ background: '#ffffff' }).resize({ width }).blur(0.8).png().toBuffer()),
  );
}

async function main() {
  const only = process.argv.slice(2);
  const zxing = await zxingDecoder();
  const failures: string[] = [];
  const jsqrMisses: string[] = [];
  let passed = 0;
  for (const [key, content] of Object.entries(SAMPLES)) {
    if (only.length && !only.includes(key)) continue;
    const payload = buildStaticPayload(typeOf(key), content);
    console.log(`${key}: ${JSON.stringify(payload)}`);
    for (const [label, design] of DESIGNS) {
      if (process.env.DESIGN && !new RegExp(process.env.DESIGN).test(label)) continue;
      const { body } = await exportQr({ data: payload, design, format: 'png', size: 600, branding: 'Free QR codes by QR ALTRIX · qraltrix.co.uk' });
      const camera = await cameraFrames(body);
      const checks: Array<[string, string | null]> = [
        ['zxing', await zxing(body)],
        ['zxing/camera', (await zxing(camera[0])) === payload ? payload : await zxing(camera[1])],
        ['jsqr', await jsqrDecode(body)],
      ];
      // Pass/fail follows ZXing, the decoder family phones use. jsQR (much stricter, and
      // thrown by text near the code) is reported for information only.
      const bad = checks.filter(([name, text]) => name.startsWith('zxing') && text !== payload);
      if (checks.some(([name, text]) => name === 'jsqr' && text !== payload)) jsqrMisses.push(`${key} [${label}]`);
      if (bad.length === 0) passed++;
      else failures.push(`${key} [${label}] ✗ ${bad.map(([name, text]) => `${name}:${text === null ? 'none' : 'MISMATCH'}`).join(' ')}`);
    }
  }
  console.log(`\npassed ${passed}, failed ${failures.length} (jsQR alone missed ${jsqrMisses.length}, informational)`);
  for (const f of failures) console.log('  FAIL', f);
  process.exit(failures.length ? 1 : 0);
}

void main();
