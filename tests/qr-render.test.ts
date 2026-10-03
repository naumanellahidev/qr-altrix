import { describe, expect, it } from 'vitest';
import { buildMatrix, estimateDensity } from '@/lib/qr/matrix';
import { renderQr, renderQrSvg } from '@/lib/qr/render';
import { checkScanSafety, contrastRatio } from '@/lib/qr/contrast';
import { BODY_SHAPES, EYE_BALL_SHAPES, EYE_FRAME_SHAPES, FRAME_PRESETS, LOGO_PRESETS } from '@/lib/qr/presets';
import { DEFAULT_DESIGN } from '@/lib/qr/types';

const PAYLOAD = 'https://qr-altrix.test/q/abc1234';

describe('matrix', () => {
  it('produces an odd, version-consistent module count', () => {
    const matrix = buildMatrix(PAYLOAD, 'M');
    expect(matrix.size % 4).toBe(1); // 21, 25, 29 … all satisfy size = 17 + 4v
    expect(matrix.size).toBeGreaterThanOrEqual(21);
  });

  it('marks the three finder patterns as eyes and nothing else', () => {
    const matrix = buildMatrix(PAYLOAD, 'M');
    expect(matrix.isEye(0, 0)).toBe(true);
    expect(matrix.isEye(matrix.size - 1, 0)).toBe(true);
    expect(matrix.isEye(0, matrix.size - 1)).toBe(true);
    // The bottom-right corner has no finder pattern.
    expect(matrix.isEye(matrix.size - 1, matrix.size - 1)).toBe(false);
  });

  it('grows with the error-correction level', () => {
    const low = buildMatrix(PAYLOAD, 'L').size;
    const high = buildMatrix(PAYLOAD, 'H').size;
    expect(high).toBeGreaterThanOrEqual(low);
  });

  it('never throws on empty content', () => {
    expect(() => buildMatrix('', 'M')).not.toThrow();
  });

  it('flags crowded payloads', () => {
    const long = estimateDensity('x'.repeat(900), 'H');
    expect(long.crowded).toBe(true);
    expect(estimateDensity('https://a.co', 'M').crowded).toBe(false);
  });
});

describe('renderQr', () => {
  it('returns a single well-formed SVG', () => {
    const { svg, units, moduleCount } = renderQr(PAYLOAD, {}, { size: 512 });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain(`viewBox="0 0 ${units.width}`);
    expect(moduleCount).toBeGreaterThan(20);
  });

  it('renders every body shape without error and with visible path data', () => {
    for (const shape of BODY_SHAPES) {
      const svg = renderQrSvg(PAYLOAD, { bodyShape: shape.value });
      expect(svg).toContain('<path');
      expect(svg.length).toBeGreaterThan(500);
    }
  });

  it('renders every eye style', () => {
    for (const frame of EYE_FRAME_SHAPES) {
      for (const ball of EYE_BALL_SHAPES) {
        const svg = renderQrSvg(PAYLOAD, { eyeFrameShape: frame.value, eyeBallShape: ball.value });
        expect(svg).toContain('fill-rule="evenodd"');
      }
    }
  });

  it('renders every frame preset, with its call to action when there is one', () => {
    for (const preset of FRAME_PRESETS) {
      const svg = renderQrSvg(PAYLOAD, { frame: preset.id, ctaText: 'SCAN ME' });
      expect(svg.startsWith('<svg')).toBe(true);
      if (preset.label_ !== 'none' && preset.id !== 'none') {
        expect(svg).toContain('SCAN ME');
      }
    }
  });

  it('adds a gradient definition only when gradients are on', () => {
    const plain = renderQrSvg(PAYLOAD, { gradientEnabled: false });
    expect(plain).not.toContain('linearGradient');

    const gradient = renderQrSvg(PAYLOAD, { gradientEnabled: true, gradientType: 'linear' });
    expect(gradient).toContain('<linearGradient');
    expect(gradient).toContain('url(#');

    const radial = renderQrSvg(PAYLOAD, { gradientEnabled: true, gradientType: 'radial' });
    expect(radial).toContain('<radialGradient');
  });

  it('omits the background rectangle when the background is transparent', () => {
    const opaque = renderQrSvg(PAYLOAD, { transparentBg: false, bgColor: '#FFEEDD' });
    expect(opaque).toContain('#FFEEDD');

    const transparent = renderQrSvg(PAYLOAD, { transparentBg: true, bgColor: '#FFEEDD' });
    expect(transparent).not.toContain('fill="#FFEEDD"');
  });

  it('swaps the colours when inverted', () => {
    const svg = renderQrSvg(PAYLOAD, { invert: true, fgColor: '#111111', bgColor: '#EEEEEE' });
    // The pattern is now painted in the former background colour.
    expect(svg).toContain('fill="#EEEEEE"');
  });

  it('escapes the call-to-action text so it cannot inject markup', () => {
    const svg = renderQrSvg(PAYLOAD, { frame: 'banner-bottom', ctaText: '<script>alert(1)</script>' });
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });

  it('rejects a javascript: logo source but keeps data URIs', () => {
    const evil = renderQrSvg(PAYLOAD, { logoUrl: 'javascript:alert(1)' });
    expect(evil).not.toContain('javascript:');
    expect(evil).not.toContain('<image');

    const dataUri =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8AARAAD/wH/gAAAAABJRU5ErkJggg==';
    const good = renderQrSvg(PAYLOAD, { logoUrl: dataUri });
    expect(good).toContain('<image');
  });

  it('falls back to a safe colour when given rubbish', () => {
    const svg = renderQrSvg(PAYLOAD, { fgColor: 'url(#evil)" onload="alert(1)' });
    expect(svg).not.toContain('onload');
    expect(svg).toContain(DEFAULT_DESIGN.fgColor);
  });

  it('draws a built-in logo preset as an inline data URI', () => {
    const svg = renderQrSvg(PAYLOAD, { logoPreset: LOGO_PRESETS[0].id, logoShape: 'circle' });
    expect(svg).toContain('<image');
    expect(svg).toContain('data:image/svg+xml;base64,');
    expect(svg).toContain('clip-path="url(#');
  });

  it('grows the canvas when a frame with a label is used', () => {
    const bare = renderQr(PAYLOAD, { frame: 'none' }, {});
    const framed = renderQr(PAYLOAD, { frame: 'banner-bottom', ctaText: 'SCAN ME' }, {});
    expect(framed.units.height).toBeGreaterThan(bare.units.height);
    expect(framed.units.width).toBeGreaterThan(bare.units.width);
  });

  it('honours the bare option for thumbnails', () => {
    const framed = renderQr(PAYLOAD, { frame: 'poster', ctaText: 'SCAN' }, {});
    const bare = renderQr(PAYLOAD, { frame: 'poster', ctaText: 'SCAN' }, { bare: true });
    expect(bare.units.height).toBeLessThan(framed.units.height);
    expect(bare.svg).not.toContain('SCAN');
  });

  it('is deterministic for the same input', () => {
    const a = renderQrSvg(PAYLOAD, { bodyShape: 'classy' }, { idPrefix: 'fixed' });
    const b = renderQrSvg(PAYLOAD, { bodyShape: 'classy' }, { idPrefix: 'fixed' });
    expect(a).toBe(b);
  });

  it('clamps an absurd quiet zone instead of producing a broken canvas', () => {
    const svg = renderQrSvg(PAYLOAD, { margin: 999 });
    expect(svg.startsWith('<svg')).toBe(true);
  });
});

describe('scan safety', () => {
  it('computes a known contrast ratio', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 1);
  });

  it('scores black on white as excellent', () => {
    const report = checkScanSafety({ ...DEFAULT_DESIGN, fgColor: '#000000', bgColor: '#FFFFFF' }, 29);
    expect(report.level).toBe('excellent');
    expect(report.issues).toHaveLength(0);
  });

  it('fails a low-contrast combination with an error', () => {
    const report = checkScanSafety({ ...DEFAULT_DESIGN, fgColor: '#BBBBBB', bgColor: '#CCCCCC' }, 29);
    expect(report.level).toBe('fail');
    expect(report.issues.some((issue) => issue.severity === 'error')).toBe(true);
  });

  it('flags an oversized logo as an error', () => {
    const report = checkScanSafety({ ...DEFAULT_DESIGN, logoPreset: 'wifi', logoSize: 33 }, 29);
    expect(report.issues.some((issue) => issue.severity === 'error' && issue.title.includes('Logo'))).toBe(true);
  });

  it('warns about a large logo with weak error correction', () => {
    const report = checkScanSafety({ ...DEFAULT_DESIGN, logoPreset: 'wifi', logoSize: 28, errorCorrection: 'M' }, 29);
    expect(report.issues.some((issue) => issue.title.includes('error correction'))).toBe(true);
  });

  it('warns when there is no quiet zone', () => {
    const report = checkScanSafety({ ...DEFAULT_DESIGN, margin: 0 }, 29);
    expect(report.issues.some((issue) => issue.title.includes('quiet zone'))).toBe(true);
  });

  it('warns about inverted colours', () => {
    const report = checkScanSafety({ ...DEFAULT_DESIGN, fgColor: '#FFFFFF', bgColor: '#101010' }, 29);
    expect(report.issues.some((issue) => issue.title.includes('Light pattern'))).toBe(true);
  });

  it('suggests a dynamic code when the pattern is very dense', () => {
    const report = checkScanSafety(DEFAULT_DESIGN, 65);
    expect(report.issues.some((issue) => issue.fix.includes('dynamic'))).toBe(true);
  });

  it('uses the weaker end of a gradient for the contrast check', () => {
    const report = checkScanSafety(
      { ...DEFAULT_DESIGN, gradientEnabled: true, gradientFrom: '#000000', gradientTo: '#F5F5F5' },
      29,
    );
    expect(report.contrastRatio).toBeLessThan(2);
  });
});
