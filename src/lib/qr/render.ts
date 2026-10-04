import { buildMatrix, EYE_ORIGINS, type QrMatrix } from './matrix';
import { getFramePreset, getLogoPreset, logoPresetDataUri } from './presets';
import { DEFAULT_DESIGN, type QrDesign, type RenderOptions } from './types';
import { cleanBrandingText } from './branding';

/**
 * QR ALTRIX SVG renderer.
 *
 * Isomorphic by design: the same function powers the server-side export pipeline and
 * the live browser preview, so what a user sees is byte-for-byte what they download.
 * Everything is produced as plain SVG markup — no canvas, no DOM, no vendor assets.
 */

const EYE_SPAN = 7;

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function n(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function sanitizeColor(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed)) return trimmed;
  if (/^(rgb|hsl)a?\([0-9.,%\s/-]+\)$/i.test(trimmed)) return trimmed;
  if (/^[a-z]{3,20}$/i.test(trimmed)) return trimmed;
  return fallback;
}

/** Only data: URIs and same-origin/relative paths are embedded, never javascript:. */
function sanitizeImageSrc(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^data:image\/(png|jpeg|jpg|webp|svg\+xml|gif);base64,[a-z0-9+/=\s]+$/i.test(trimmed)) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^\/[^\s"'<>]*$/.test(trimmed)) return trimmed;
  return null;
}

interface Corners {
  tl: boolean;
  tr: boolean;
  br: boolean;
  bl: boolean;
}

/** Rounded square path with per-corner control, used by most body shapes. */
function roundedSquare(x: number, y: number, size: number, r: number, c: Corners): string {
  const rr = Math.min(r, size / 2);
  const x2 = x + size;
  const y2 = y + size;
  const parts: string[] = [];
  parts.push(`M ${n(x + (c.tl ? rr : 0))} ${n(y)}`);
  parts.push(`H ${n(x2 - (c.tr ? rr : 0))}`);
  if (c.tr) parts.push(`A ${n(rr)} ${n(rr)} 0 0 1 ${n(x2)} ${n(y + rr)}`);
  parts.push(`V ${n(y2 - (c.br ? rr : 0))}`);
  if (c.br) parts.push(`A ${n(rr)} ${n(rr)} 0 0 1 ${n(x2 - rr)} ${n(y2)}`);
  parts.push(`H ${n(x + (c.bl ? rr : 0))}`);
  if (c.bl) parts.push(`A ${n(rr)} ${n(rr)} 0 0 1 ${n(x)} ${n(y2 - rr)}`);
  parts.push(`V ${n(y + (c.tl ? rr : 0))}`);
  if (c.tl) parts.push(`A ${n(rr)} ${n(rr)} 0 0 1 ${n(x + rr)} ${n(y)}`);
  parts.push('Z');
  return parts.join(' ');
}

function circlePath(cx: number, cy: number, r: number): string {
  return `M ${n(cx - r)} ${n(cy)} a ${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0 a ${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0 Z`;
}

function diamondPath(x: number, y: number, size: number): string {
  const h = size / 2;
  return `M ${n(x + h)} ${n(y)} L ${n(x + size)} ${n(y + h)} L ${n(x + h)} ${n(y + size)} L ${n(x)} ${n(y + h)} Z`;
}

/** Body module geometry. Neighbour awareness keeps rounded styles visually connected. */
function bodyModulePath(
  matrix: QrMatrix,
  x: number,
  y: number,
  shape: QrDesign['bodyShape'],
): string {
  const on = (dx: number, dy: number) => matrix.get(x + dx, y + dy) && !matrix.isEye(x + dx, y + dy);
  const top = on(0, -1);
  const right = on(1, 0);
  const bottom = on(0, 1);
  const left = on(-1, 0);

  switch (shape) {
    case 'square':
      return roundedSquare(x, y, 1, 0, { tl: false, tr: false, br: false, bl: false });
    case 'mosaic':
      return roundedSquare(x + 0.09, y + 0.09, 0.82, 0.14, { tl: true, tr: true, br: true, bl: true });
    case 'dots':
      return circlePath(x + 0.5, y + 0.5, 0.44);
    case 'diamond':
      return diamondPath(x + 0.04, y + 0.04, 0.92);
    case 'rounded':
      return roundedSquare(x, y, 1, 0.32, {
        tl: !top && !left,
        tr: !top && !right,
        br: !bottom && !right,
        bl: !bottom && !left,
      });
    case 'extra-rounded':
      return roundedSquare(x, y, 1, 0.5, {
        tl: !top && !left,
        tr: !top && !right,
        br: !bottom && !right,
        bl: !bottom && !left,
      });
    case 'classy': {
      const isolated = !top && !right && !bottom && !left;
      if (isolated) return roundedSquare(x, y, 1, 0.5, { tl: true, tr: false, br: true, bl: false });
      return roundedSquare(x, y, 1, 0.45, {
        tl: !top && !left,
        tr: false,
        br: !bottom && !right,
        bl: false,
      });
    }
    default:
      return roundedSquare(x, y, 1, 0, { tl: false, tr: false, br: false, bl: false });
  }
}

function eyeFramePath(ox: number, oy: number, shape: QrDesign['eyeFrameShape']): string {
  // Ring built as outer shape + inner hole; rendered with fill-rule="evenodd".
  const outer = (r: number, c: Corners = { tl: true, tr: true, br: true, bl: true }) =>
    roundedSquare(ox, oy, EYE_SPAN, r, c);
  const inner = (r: number, c: Corners = { tl: true, tr: true, br: true, bl: true }) =>
    roundedSquare(ox + 1, oy + 1, EYE_SPAN - 2, r, c);

  switch (shape) {
    case 'square':
      return `${outer(0, { tl: false, tr: false, br: false, bl: false })} ${inner(0, { tl: false, tr: false, br: false, bl: false })}`;
    case 'rounded':
      return `${outer(1.8)} ${inner(1.1)}`;
    case 'circle':
      return `${circlePath(ox + 3.5, oy + 3.5, 3.5)} ${circlePath(ox + 3.5, oy + 3.5, 2.5)}`;
    case 'leaf':
      return `${outer(3.2, { tl: true, tr: false, br: true, bl: false })} ${inner(2.2, { tl: true, tr: false, br: true, bl: false })}`;
    case 'leaf-flipped':
      return `${outer(3.2, { tl: false, tr: true, br: false, bl: true })} ${inner(2.2, { tl: false, tr: true, br: false, bl: true })}`;
    case 'shield':
      return `${outer(3.4, { tl: true, tr: true, br: false, bl: false })} ${inner(2.4, { tl: true, tr: true, br: false, bl: false })}`;
    case 'cut':
      return `${outer(2.6, { tl: false, tr: true, br: false, bl: true })} ${inner(1.7, { tl: false, tr: true, br: false, bl: true })}`;
    case 'frame-dots': {
      const dots: string[] = [];
      for (let i = 0; i < EYE_SPAN; i += 1) {
        dots.push(circlePath(ox + i + 0.5, oy + 0.5, 0.42));
        dots.push(circlePath(ox + i + 0.5, oy + EYE_SPAN - 0.5, 0.42));
      }
      for (let i = 1; i < EYE_SPAN - 1; i += 1) {
        dots.push(circlePath(ox + 0.5, oy + i + 0.5, 0.42));
        dots.push(circlePath(ox + EYE_SPAN - 0.5, oy + i + 0.5, 0.42));
      }
      return dots.join(' ');
    }
    default:
      return `${outer(0)} ${inner(0)}`;
  }
}

function eyeBallPath(ox: number, oy: number, shape: QrDesign['eyeBallShape']): string {
  const x = ox + 2;
  const y = oy + 2;
  switch (shape) {
    case 'square':
      return roundedSquare(x, y, 3, 0, { tl: false, tr: false, br: false, bl: false });
    case 'rounded':
      return roundedSquare(x, y, 3, 0.9, { tl: true, tr: true, br: true, bl: true });
    case 'circle':
      return circlePath(x + 1.5, y + 1.5, 1.5);
    case 'diamond':
      return diamondPath(x, y, 3);
    case 'leaf':
      return roundedSquare(x, y, 3, 1.5, { tl: true, tr: false, br: true, bl: false });
    case 'flower': {
      const petals = [
        circlePath(x + 1.5, y + 0.85, 0.85),
        circlePath(x + 1.5, y + 2.15, 0.85),
        circlePath(x + 0.85, y + 1.5, 0.85),
        circlePath(x + 2.15, y + 1.5, 0.85),
      ];
      return petals.join(' ');
    }
    case 'dot-grid': {
      const dots: string[] = [];
      for (let i = 0; i < 3; i += 1) {
        for (let j = 0; j < 3; j += 1) {
          dots.push(circlePath(x + i + 0.5, y + j + 0.5, 0.4));
        }
      }
      return dots.join(' ');
    }
    default:
      return roundedSquare(x, y, 3, 0, { tl: false, tr: false, br: false, bl: false });
  }
}

export interface RenderResult {
  svg: string;
  /** Logical canvas size in module units — useful for raster scaling. */
  units: { width: number; height: number };
  moduleCount: number;
}

export function renderQr(data: string, partialDesign: Partial<QrDesign>, options: RenderOptions = {}): RenderResult {
  const design: QrDesign = { ...DEFAULT_DESIGN, ...partialDesign };
  const idp = options.idPrefix ?? 'qa';
  const matrix = buildMatrix(data, design.errorCorrection);
  const quiet = clamp(Math.round(design.margin), 0, 12);
  const qrUnits = matrix.size + quiet * 2;

  const frame = options.bare ? getFramePreset('none') : getFramePreset(design.frame);
  const pad = frame.padding;
  const border = frame.border;
  const framed = frame.id !== 'none';

  const ctaRaw = (design.ctaText ?? '').trim() || (framed ? (frame.defaultCta ?? '') : '');
  const wantsLabel = framed && frame.label_ !== 'none' && ctaRaw.length > 0;
  const labelBand = wantsLabel ? 7.2 : 0;
  const labelOnTop =
    frame.label_ === 'top' || frame.label_ === 'top-pill' || (frame.label_ === 'bubble' && design.ctaPosition === 'top');
  const labelTop = wantsLabel ? (design.ctaPosition === 'top' || labelOnTop) : false;

  const innerW = qrUnits + 2 * pad;
  const totalW = innerW + 2 * border;
  const totalH = totalW + labelBand;

  const qrX = border + pad + quiet;
  const qrY = border + pad + quiet + (labelTop ? labelBand : 0);

  // Colours ------------------------------------------------------------------
  let fg = sanitizeColor(design.fgColor, DEFAULT_DESIGN.fgColor);
  let bg = sanitizeColor(design.bgColor, DEFAULT_DESIGN.bgColor);
  if (design.invert) {
    const tmp = fg;
    fg = bg;
    bg = tmp;
  }
  const gradFrom = sanitizeColor(design.gradientFrom, DEFAULT_DESIGN.gradientFrom);
  const gradTo = sanitizeColor(design.gradientTo, DEFAULT_DESIGN.gradientTo);
  const frameColor = sanitizeColor(design.frameColor, DEFAULT_DESIGN.frameColor);
  const frameTextColor = sanitizeColor(design.frameTextColor, DEFAULT_DESIGN.frameTextColor);

  const defs: string[] = [];
  let bodyFill = fg;
  if (design.gradientEnabled) {
    const gid = `${idp}-grad`;
    if (design.gradientType === 'radial') {
      defs.push(
        `<radialGradient id="${gid}" cx="50%" cy="50%" r="72%"><stop offset="0%" stop-color="${gradFrom}"/><stop offset="100%" stop-color="${gradTo}"/></radialGradient>`,
      );
    } else {
      const rot = ((design.gradientRotation % 360) + 360) % 360;
      defs.push(
        `<linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(${n(rot)} 0.5 0.5)" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="${gradFrom}"/><stop offset="100%" stop-color="${gradTo}"/></linearGradient>`,
      );
    }
    bodyFill = `url(#${gid})`;
  }
  const eyeFill = design.eyeColor ? sanitizeColor(design.eyeColor, fg) : bodyFill;
  const eyeBallFill = design.eyeBallColor ? sanitizeColor(design.eyeBallColor, fg) : eyeFill;

  // Body ---------------------------------------------------------------------
  const bodyPaths: string[] = [];
  for (let y = 0; y < matrix.size; y += 1) {
    for (let x = 0; x < matrix.size; x += 1) {
      if (!matrix.get(x, y) || matrix.isEye(x, y)) continue;
      bodyPaths.push(bodyModulePath(matrix, x, y, design.bodyShape));
    }
  }

  const eyeFramePaths: string[] = [];
  const eyeBallPaths: string[] = [];
  for (const [ox, oy] of EYE_ORIGINS(matrix.size)) {
    eyeFramePaths.push(eyeFramePath(ox, oy, design.eyeFrameShape));
    eyeBallPaths.push(eyeBallPath(ox, oy, design.eyeBallShape));
  }

  const body: string[] = [];
  body.push(
    `<g transform="translate(${n(qrX)} ${n(qrY)})">`,
    `<path fill="${bodyFill}" fill-rule="evenodd" d="${bodyPaths.join(' ')}"/>`,
    `<path fill="${eyeFill}" fill-rule="evenodd" d="${eyeFramePaths.join(' ')}"/>`,
    `<path fill="${eyeBallFill}" fill-rule="evenodd" d="${eyeBallPaths.join(' ')}"/>`,
    `</g>`,
  );

  // Logo ---------------------------------------------------------------------
  const preset = getLogoPreset(design.logoPreset);
  const logoSrc =
    sanitizeImageSrc(options.logoDataUri) ??
    sanitizeImageSrc(design.logoUrl) ??
    (preset ? logoPresetDataUri(preset) : null);

  if (logoSrc) {
    const pct = clamp(design.logoSize, 8, 34) / 100;
    const logoW = matrix.size * pct;
    const padUnits = (clamp(design.logoPadding, 0, 24) / 100) * matrix.size * 0.5;
    const plateW = logoW + padUnits * 2;
    const cx = qrX + matrix.size / 2;
    const cy = qrY + matrix.size / 2;
    const plateX = cx - plateW / 2;
    const plateY = cy - plateW / 2;
    const plateFill = design.transparentBg ? '#FFFFFF' : bg;

    if (design.logoShape !== 'none') {
      if (design.logoShape === 'circle') {
        body.push(
          `<path d="${circlePath(cx, cy, plateW / 2)}" fill="${plateFill}"/>`,
        );
      } else if (design.logoShape === 'ribbon') {
        body.push(
          `<path d="${roundedSquareRect(plateX - 0.6, plateY + plateW * 0.18, plateW + 1.2, plateW * 0.64, plateW * 0.12)}" fill="${plateFill}"/>`,
        );
      } else {
        const r = design.logoShape === 'rounded' ? plateW * 0.22 : 0;
        body.push(
          `<path d="${roundedSquare(plateX, plateY, plateW, r, { tl: true, tr: true, br: true, bl: true })}" fill="${plateFill}"/>`,
        );
      }
    } else if (padUnits > 0) {
      body.push(
        `<path d="${roundedSquare(plateX, plateY, plateW, plateW * 0.12, { tl: true, tr: true, br: true, bl: true })}" fill="${plateFill}"/>`,
      );
    }

    const clipId = `${idp}-logoclip`;
    const needsClip = design.logoShape === 'circle';
    if (needsClip) {
      defs.push(`<clipPath id="${clipId}"><path d="${circlePath(cx, cy, logoW / 2)}"/></clipPath>`);
    }
    body.push(
      `<image href="${esc(logoSrc)}" x="${n(cx - logoW / 2)}" y="${n(cy - logoW / 2)}" width="${n(logoW)}" height="${n(logoW)}" preserveAspectRatio="xMidYMid meet"${needsClip ? ` clip-path="url(#${clipId})"` : ''}/>`,
    );
  }

  // Frame + label ------------------------------------------------------------
  const chrome: string[] = [];
  if (!design.transparentBg) {
    chrome.push(
      `<path d="${roundedSquare(0, 0, totalW, framed ? frame.radius : 0, { tl: true, tr: true, br: true, bl: true })}" fill="${bg}"/>`,
    );
    if (labelBand > 0) {
      // Extend the background to cover the label band area.
      chrome.length = 0;
      const r = framed ? frame.radius : 0;
      chrome.push(
        `<path d="${roundedSquareRect(0, 0, totalW, totalH, r)}" fill="${bg}"/>`,
      );
    }
  }

  if (framed) {
    if (frame.id === 'shadowbox') {
      defs.push(
        `<filter id="${idp}-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="${n(0.8)}" stdDeviation="${n(0.9)}" flood-color="${frameColor}" flood-opacity="0.28"/></filter>`,
      );
    }
    if (border > 0) {
      const r = frame.radius;
      const inset = border / 2;
      const strokeDash = frame.decoration === 'dashed' ? ` stroke-dasharray="${n(2.2)} ${n(1.6)}"` : '';
      if (frame.decoration === 'corners') {
        chrome.push(cornerBrackets(inset, totalW - border, labelTop ? labelBand : 0, border, frameColor, innerW));
      } else {
        chrome.push(
          `<path d="${roundedSquareRect(inset, inset, totalW - border, totalH - border, Math.max(0, r - inset))}" fill="none" stroke="${frameColor}" stroke-width="${n(border)}"${strokeDash}${frame.id === 'shadowbox' ? ` filter="url(#${idp}-shadow)"` : ''}/>`,
        );
      }
      if (frame.decoration === 'double') {
        const inset2 = border + 1;
        chrome.push(
          `<path d="${roundedSquareRect(inset2, inset2, totalW - inset2 * 2, totalH - inset2 * 2, Math.max(0, r - inset2))}" fill="none" stroke="${frameColor}" stroke-width="${n(border * 0.6)}" opacity="0.65"/>`,
        );
      }
    }

    if (frame.decoration === 'ticket') {
      chrome.push(
        `<path d="${circlePath(0, totalH / 2, 1.3)}" fill="${design.transparentBg ? '#FFFFFF' : bg}" stroke="${frameColor}" stroke-width="${n(Math.max(border, 0.4))}"/>`,
        `<path d="${circlePath(totalW, totalH / 2, 1.3)}" fill="${design.transparentBg ? '#FFFFFF' : bg}" stroke="${frameColor}" stroke-width="${n(Math.max(border, 0.4))}"/>`,
      );
    }
    if (frame.decoration === 'scallop') {
      chrome.push(scallopEdge(totalW, totalH, frameColor));
    }
    if (frame.decoration === 'phone') {
      chrome.push(
        `<path d="${roundedSquareRect(totalW / 2 - 4, 0.9, 8, 1.5, 0.75)}" fill="${frameColor}" opacity="0.8"/>`,
      );
    }
    if (frame.decoration === 'pin') {
      chrome.push(
        `<path d="M ${n(totalW / 2 - 2.2)} ${n(totalH)} L ${n(totalW / 2)} ${n(totalH + 2.6)} L ${n(totalW / 2 + 2.2)} ${n(totalH)} Z" fill="${frameColor}"/>`,
      );
    }
    if (frame.decoration === 'arrow') {
      const ay = labelTop ? labelBand + 1.2 : totalH - labelBand - 1.2;
      chrome.push(
        `<path d="M ${n(totalW / 2 - 2)} ${n(ay)} L ${n(totalW / 2)} ${n(ay + (labelTop ? -2 : 2))} L ${n(totalW / 2 + 2)} ${n(ay)} Z" fill="${frameColor}" opacity="0.9"/>`,
      );
    }
  }

  if (wantsLabel) {
    const bandY = labelTop ? border : totalH - labelBand - border * 0;
    const bandH = labelBand;
    const solid = frame.solidLabel !== false;
    const textY = (labelTop ? border + bandH / 2 : totalH - bandH / 2) + 1.25;
    const fontSize = ctaRaw.length > 22 ? 2.9 : ctaRaw.length > 14 ? 3.3 : 3.8;

    if (solid) {
      if (frame.label_ === 'bottom-pill' || frame.label_ === 'top-pill' || frame.label_ === 'bubble') {
        const pw = Math.min(totalW - 4, Math.max(14, ctaRaw.length * fontSize * 0.62 + 6));
        const px = (totalW - pw) / 2;
        const py = labelTop ? border + 0.8 : totalH - bandH + 0.4;
        chrome.push(
          `<path d="${roundedSquareRect(px, py, pw, bandH - 1.6, (bandH - 1.6) / 2)}" fill="${frameColor}"/>`,
        );
        if (frame.label_ === 'bubble') {
          const tipY = labelTop ? py + bandH - 1.6 : py;
          const dir = labelTop ? 1 : -1;
          chrome.push(
            `<path d="M ${n(totalW / 2 - 1.5)} ${n(tipY)} L ${n(totalW / 2)} ${n(tipY + dir * 1.6)} L ${n(totalW / 2 + 1.5)} ${n(tipY)} Z" fill="${frameColor}"/>`,
          );
        }
      } else if (frame.label_ === 'bottom-tag') {
        const pw = Math.min(totalW - 3, Math.max(16, ctaRaw.length * fontSize * 0.62 + 8));
        const px = (totalW - pw) / 2;
        const py = totalH - bandH + 0.4;
        const h = bandH - 1.6;
        chrome.push(
          `<path d="M ${n(px + 1.6)} ${n(py)} H ${n(px + pw)} V ${n(py + h)} H ${n(px + 1.6)} L ${n(px)} ${n(py + h / 2)} Z" fill="${frameColor}"/>`,
        );
      } else if (frame.label_ === 'ribbon') {
        const py = totalH - bandH;
        chrome.push(
          `<path d="M 0 ${n(py)} H ${n(totalW)} V ${n(totalH - 1.4)} L ${n(totalW - 2)} ${n(totalH)} H 2 L 0 ${n(totalH - 1.4)} Z" fill="${frameColor}"/>`,
        );
      } else {
        const r = frame.radius;
        chrome.push(
          labelTop
            ? `<path d="${topBandPath(border, border, totalW - border * 2, bandH, Math.max(0, r - border))}" fill="${frameColor}"/>`
            : `<path d="${bottomBandPath(border, totalH - bandH - border, totalW - border * 2, bandH, Math.max(0, r - border))}" fill="${frameColor}"/>`,
        );
      }
    }

    chrome.push(
      `<text x="${n(totalW / 2)}" y="${n(textY)}" text-anchor="middle" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="${n(fontSize)}" font-weight="700" letter-spacing="${n(fontSize * 0.04)}" fill="${solid ? frameTextColor : frameColor}">${esc(ctaRaw)}</text>`,
    );
  }

  // Credit line ------------------------------------------------------------------
  // Drawn below everything else — under the frame and its label, under a map pin's
  // point — so it is always outside the quiet zone and cannot affect scanning. The
  // font shrinks to fit narrow codes; the band grows with it.
  const brandText = cleanBrandingText(options.branding);
  let canvasH = totalH;
  if (brandText) {
    const below = frame.decoration === 'pin' ? 2.6 : 0;
    const fontSize = clamp((totalW * 0.9) / (brandText.length * 0.56), 1.15, 2.1);
    const band = fontSize * 2.2;
    const top = totalH + below;
    canvasH = top + band;
    if (!design.transparentBg) {
      const r = framed ? frame.radius : 0;
      // Overlap the main background by at least one unit: two shapes meeting edge to
      // edge leave an anti-aliased hairline between them.
      const stripTop = Math.max(0, totalH - Math.max(r, 1));
      chrome.unshift(`<path d="${roundedSquareRect(0, stripTop, totalW, canvasH - stripTop, r)}" fill="${bg}"/>`);
    }
    // The product name gets a heavier weight so it reads as a brand, not a footnote.
    const brandAt = brandText.indexOf('QR ALTRIX');
    const inner =
      brandAt >= 0
        ? `${esc(brandText.slice(0, brandAt))}<tspan font-weight="800">QR ALTRIX</tspan>${esc(brandText.slice(brandAt + 9))}`
        : esc(brandText);
    chrome.push(
      `<text x="${n(totalW / 2)}" y="${n(top + band / 2 + fontSize * 0.36)}" text-anchor="middle" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="${n(fontSize)}" font-weight="500" letter-spacing="${n(fontSize * 0.02)}" fill="${design.transparentBg ? '#475569' : fg}" fill-opacity="0.78">${inner}</text>`,
    );
  }

  const pxWidth = options.size ?? 512;
  const pxHeight = Math.round((pxWidth * canvasH) / totalW);

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${pxWidth}" height="${pxHeight}" viewBox="0 0 ${n(totalW)} ${n(canvasH)}" shape-rendering="geometricPrecision" role="img" aria-label="QR code">`,
    defs.length ? `<defs>${defs.join('')}</defs>` : '',
    chrome.join(''),
    body.join(''),
    `</svg>`,
  ].join('');

  return { svg, units: { width: totalW, height: canvasH }, moduleCount: matrix.size };
}

/** Rectangle (not necessarily square) with uniform corner radius. */
function roundedSquareRect(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  if (rr === 0) {
    return `M ${n(x)} ${n(y)} H ${n(x + w)} V ${n(y + h)} H ${n(x)} Z`;
  }
  return [
    `M ${n(x + rr)} ${n(y)}`,
    `H ${n(x + w - rr)}`,
    `A ${n(rr)} ${n(rr)} 0 0 1 ${n(x + w)} ${n(y + rr)}`,
    `V ${n(y + h - rr)}`,
    `A ${n(rr)} ${n(rr)} 0 0 1 ${n(x + w - rr)} ${n(y + h)}`,
    `H ${n(x + rr)}`,
    `A ${n(rr)} ${n(rr)} 0 0 1 ${n(x)} ${n(y + h - rr)}`,
    `V ${n(y + rr)}`,
    `A ${n(rr)} ${n(rr)} 0 0 1 ${n(x + rr)} ${n(y)}`,
    'Z',
  ].join(' ');
}

function topBandPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, h / 2, w / 2));
  return [
    `M ${n(x)} ${n(y + h)}`,
    `V ${n(y + rr)}`,
    `A ${n(rr)} ${n(rr)} 0 0 1 ${n(x + rr)} ${n(y)}`,
    `H ${n(x + w - rr)}`,
    `A ${n(rr)} ${n(rr)} 0 0 1 ${n(x + w)} ${n(y + rr)}`,
    `V ${n(y + h)}`,
    'Z',
  ].join(' ');
}

function bottomBandPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, h / 2, w / 2));
  return [
    `M ${n(x)} ${n(y)}`,
    `H ${n(x + w)}`,
    `V ${n(y + h - rr)}`,
    `A ${n(rr)} ${n(rr)} 0 0 1 ${n(x + w - rr)} ${n(y + h)}`,
    `H ${n(x + rr)}`,
    `A ${n(rr)} ${n(rr)} 0 0 1 ${n(x)} ${n(y + h - rr)}`,
    'Z',
  ].join(' ');
}

function cornerBrackets(
  inset: number,
  span: number,
  topOffset: number,
  width: number,
  color: string,
  innerW: number,
): string {
  const len = Math.max(4, innerW * 0.22);
  const x1 = inset;
  const y1 = inset + topOffset;
  const x2 = inset + span;
  const y2 = y1 + span;
  const p = [
    `M ${n(x1)} ${n(y1 + len)} V ${n(y1)} H ${n(x1 + len)}`,
    `M ${n(x2 - len)} ${n(y1)} H ${n(x2)} V ${n(y1 + len)}`,
    `M ${n(x2)} ${n(y2 - len)} V ${n(y2)} H ${n(x2 - len)}`,
    `M ${n(x1 + len)} ${n(y2)} H ${n(x1)} V ${n(y2 - len)}`,
  ].join(' ');
  return `<path d="${p}" fill="none" stroke="${color}" stroke-width="${n(width * 1.6)}" stroke-linecap="round"/>`;
}

function scallopEdge(w: number, h: number, color: string): string {
  const r = 1.1;
  const count = Math.max(6, Math.round(w / (r * 2)));
  const step = w / count;
  const dots: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const cx = step * i + step / 2;
    dots.push(circlePath(cx, 0, r * 0.7));
    dots.push(circlePath(cx, h, r * 0.7));
  }
  return `<path d="${dots.join(' ')}" fill="${color}" opacity="0.9"/>`;
}

/** Convenience wrapper used across the app when only the markup is needed. */
export function renderQrSvg(data: string, design: Partial<QrDesign>, options?: RenderOptions): string {
  return renderQr(data, design, options).svg;
}

/**
 * A small sample of one shape setting for the design editor's pickers — about 1 KB,
 * where a full QR code per swatch was ~22 KB and twenty-odd renders on every page load.
 * Body shapes are drawn on a fixed 7×7 pattern that shows how neighbouring modules join;
 * eye shapes on a single finder pattern. Same path builders as the real renderer, so a
 * swatch looks exactly like the result.
 */
const SWATCH_PATTERN = [
  '1101101',
  '1111001',
  '0011011',
  '1010111',
  '1110100',
  '0111101',
  '1101011',
];

export function renderShapeSwatch(
  kind: 'body' | 'eyeFrame' | 'eyeBall',
  shape: string,
  color: string,
  pixels = 44,
): string {
  const fill = sanitizeColor(color, '#334155');
  let d: string;
  if (kind === 'body') {
    const sample: QrMatrix = {
      size: 7,
      get: (x, y) => x >= 0 && y >= 0 && x < 7 && y < 7 && SWATCH_PATTERN[y][x] === '1',
      isEye: () => false,
    };
    const paths: string[] = [];
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        if (sample.get(x, y)) paths.push(bodyModulePath(sample, x, y, shape as QrDesign['bodyShape']));
      }
    }
    d = paths.join(' ');
  } else if (kind === 'eyeFrame') {
    d = `${eyeFramePath(0, 0, shape as QrDesign['eyeFrameShape'])} ${eyeBallPath(0, 0, DEFAULT_DESIGN.eyeBallShape)}`;
  } else {
    d = `${eyeFramePath(0, 0, DEFAULT_DESIGN.eyeFrameShape)} ${eyeBallPath(0, 0, shape as QrDesign['eyeBallShape'])}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pixels}" height="${pixels}" viewBox="-0.75 -0.75 8.5 8.5" shape-rendering="geometricPrecision" aria-hidden="true"><path fill="${fill}" fill-rule="evenodd" d="${d}"/></svg>`;
}
