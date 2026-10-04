import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { exportQr, MAX_RASTER_SIDE, rasterDensity } from '@/lib/qr/export';
import { DEFAULT_DESIGN } from '@/lib/qr/types';

// A design that exercises everything the raster path has to draw: gradient, frame,
// rounded modules and an embedded logo.
const design = {
  ...DEFAULT_DESIGN,
  bodyShape: 'rounded',
  gradientEnabled: true,
  frame: 'banner-bottom',
  ctaText: 'SCAN ME',
  logoUrl: null,
};
// Same shape as the photo in the bug report: a 720x1280 portrait JPEG.
async function photoLogo(): Promise<string> {
  const jpeg = await sharp({
    create: { width: 720, height: 1280, channels: 3, background: { r: 120, g: 140, b: 160 } },
  })
    .jpeg()
    .toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
}

describe('raster density', () => {
  it('never asks for an intermediate raster wider than the cap', () => {
    for (const size of [64, 512, 1024, 2048, 4096]) {
      const side = (size * rasterDensity(size)) / 72;
      expect(side).toBeLessThanOrEqual(MAX_RASTER_SIDE);
      expect(side).toBeGreaterThanOrEqual(size * 2 - 1); // still supersampled at least 2x
    }
  });
});

describe('exportQr raster sizes', () => {
  // "Huge · 4096 px" failed for PNG, JPEG and WebP with "Input image exceeds pixel limit".
  for (const [format, size] of [
    ['png', 512], ['png', 1024], ['png', 2048], ['png', 4096], ['jpeg', 4096], ['webp', 4096],
  ] as const) {
    it(`renders ${format} at ${size} px`, async () => {
      const result = await exportQr({
        data: 'https://qr.altrixcore.com/q/abc1234',
        design: { ...design, logoUrl: await photoLogo(), logoShape: 'rounded' } as never,
        format,
        size,
      });
      const meta = await sharp(result.body).metadata();
      expect(meta.width).toBe(size);
      expect(meta.format).toBe(format === 'jpeg' ? 'jpeg' : format);
    }, 120_000);
  }
});
