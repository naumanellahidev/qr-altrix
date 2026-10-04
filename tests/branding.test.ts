import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import jsQR from 'jsqr';
import { renderQr } from '@/lib/qr/render';
import { exportQr } from '@/lib/qr/export';
import { DEFAULT_DESIGN, type QrDesign } from '@/lib/qr/types';
import { brandingFromSettings, cleanBrandingText, defaultBrandingText } from '@/lib/qr/branding';

const URL_DATA = 'https://qr.altrixcore.com/q/abc1234';
const CREDIT = 'Free QR codes by QR ALTRIX · qr.altrixcore.com';

async function decodePng(png: Buffer): Promise<string | null> {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data ?? null;
}

describe('credit line text', () => {
  it('follows the install host and can be switched off', () => {
    expect(defaultBrandingText('https://qr.altrixcore.com')).toBe(CREDIT);
    expect(defaultBrandingText('https://www.example.org/x')).toBe('Free QR codes by QR ALTRIX · example.org');
    expect(brandingFromSettings({ brandingEnabled: false, brandingText: 'x' })).toBeNull();
    expect(brandingFromSettings({ brandingEnabled: true, brandingText: '   ' }, 'https://qr.altrixcore.com')).toBe(CREDIT);
    expect(brandingFromSettings(null, 'https://qr.altrixcore.com')).toBe(CREDIT);
  });

  it('collapses whitespace and clamps the length', () => {
    expect(cleanBrandingText('  a   b  ')).toBe('a b');
    expect(cleanBrandingText('x'.repeat(200))).toHaveLength(60);
    expect(cleanBrandingText('')).toBeNull();
  });
});

describe('credit line in the renderer', () => {
  it('adds a band under the code and leaves the code itself untouched', () => {
    const plain = renderQr(URL_DATA, DEFAULT_DESIGN, { idPrefix: 't' });
    const branded = renderQr(URL_DATA, DEFAULT_DESIGN, { idPrefix: 't', branding: CREDIT });
    expect(branded.units.width).toBe(plain.units.width);
    expect(branded.units.height).toBeGreaterThan(plain.units.height);
    expect(branded.svg).toContain('Free QR codes by <tspan font-weight="800">QR ALTRIX</tspan> · qr.altrixcore.com');
    expect(plain.svg).not.toContain('QR ALTRIX');
    expect(branded.moduleCount).toBe(plain.moduleCount);
  });

  it('escapes operator text', () => {
    const svg = renderQr(URL_DATA, DEFAULT_DESIGN, { branding: '<script>&"' }).svg;
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });

  it('sits below frames, labels and a map pin', () => {
    for (const frame of ['banner-bottom', 'pin', 'ticket']) {
      const design = { ...DEFAULT_DESIGN, frame, ctaText: 'SCAN ME' };
      const plain = renderQr(URL_DATA, design);
      const branded = renderQr(URL_DATA, design, { branding: CREDIT });
      expect(branded.units.height).toBeGreaterThan(plain.units.height);
    }
  });

  it('is omitted when the line is null or blank', () => {
    expect(renderQr(URL_DATA, DEFAULT_DESIGN, { branding: null }).svg).not.toContain('<text');
    expect(renderQr(URL_DATA, DEFAULT_DESIGN, { branding: '  ' }).svg).not.toContain('<text');
  });
});

describe('branded exports still scan', () => {
  const designs: Record<string, Partial<QrDesign>> = {
    plain: DEFAULT_DESIGN,
    framed: { ...DEFAULT_DESIGN, frame: 'banner-bottom', ctaText: 'SCAN ME', bodyShape: 'rounded' as QrDesign['bodyShape'] },
    transparent: { ...DEFAULT_DESIGN, transparentBg: true },
    coloured: { ...DEFAULT_DESIGN, fgColor: '#9D174D', bgColor: '#FDF2F8' },
  };

  for (const [name, design] of Object.entries(designs)) {
    it(`decodes the ${name} PNG with the credit line`, async () => {
      const result = await exportQr({ data: URL_DATA, design, format: 'png', size: 1024, branding: CREDIT });
      // jsQR needs an opaque image: flatten transparent output onto white first.
      const png = await sharp(result.body).flatten({ background: '#ffffff' }).png().toBuffer();
      expect(await decodePng(png)).toBe(URL_DATA);
      const meta = await sharp(result.body).metadata();
      expect(meta.height!).toBeGreaterThan(meta.width!);
    }, 60_000);
  }

  it('prints the line in the EPS file too', async () => {
    const result = await exportQr({ data: URL_DATA, design: DEFAULT_DESIGN, format: 'eps', branding: CREDIT });
    const text = result.body.toString('latin1');
    expect(text).toContain('(Free QR codes by QR ALTRIX \\267 qr.altrixcore.com)');
    const [, , w, h] = /%%BoundingBox: (\d+) (\d+) (\d+) (\d+)/.exec(text)!.map(Number);
    expect(h).toBeGreaterThan(w);
  });

  it('honours an explicit null even when the platform has it on', async () => {
    const result = await exportQr({ data: URL_DATA, design: DEFAULT_DESIGN, format: 'svg', branding: null });
    expect(result.body.toString()).not.toContain('qr.altrixcore.com</text>');
  });
});
