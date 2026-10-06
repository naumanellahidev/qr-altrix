import type { ErrorCorrectionLevel, QrDesign } from './types';

/**
 * Guard rails that keep every rendered code scannable, whatever the design asks for.
 * The renderer and every export path go through these, so a preview, a PNG and a
 * printed PDF always agree, and no combination of settings can produce a dead code.
 */

const EC_ORDER: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];

function atLeast(level: ErrorCorrectionLevel, floor: ErrorCorrectionLevel): ErrorCorrectionLevel {
  return EC_ORDER.indexOf(level) >= EC_ORDER.indexOf(floor) ? level : floor;
}

/**
 * Largest logo plate (logo plus its clear space), as a fraction of the symbol's width,
 * that phones still read once error correction has done its work.
 */
export const MAX_LOGO_PLATE = 0.3;

/** A plate up to this width is covered by level Q; anything larger needs H. */
const Q_PLATE_LIMIT = 0.22;

export interface LogoPlate {
  /** Logo width as a fraction of the symbol width. */
  logo: number;
  /** Clear space on each side of the logo, as a fraction of the symbol width. */
  padding: number;
  /** Logo plus clear space, as a fraction of the symbol width. */
  plate: number;
}

/** The logo geometry the design asks for, scaled down where needed to stay scannable. */
export function logoPlate(design: Pick<QrDesign, 'logoSize' | 'logoPadding'>): LogoPlate {
  const logo = Math.min(34, Math.max(8, design.logoSize)) / 100;
  const padding = (Math.min(24, Math.max(0, design.logoPadding)) / 100) * 0.5;
  const requested = logo + padding * 2;
  const scale = requested > MAX_LOGO_PLATE ? MAX_LOGO_PLATE / requested : 1;
  return { logo: logo * scale, padding: padding * scale, plate: requested * scale };
}

/** Error correction actually used: a logo always gets enough redundancy to cover it. */
export function effectiveErrorCorrection(
  design: Pick<QrDesign, 'errorCorrection' | 'logoSize' | 'logoPadding'>,
  hasLogo: boolean,
): ErrorCorrectionLevel {
  const chosen = design.errorCorrection ?? 'M';
  if (!hasLogo) return chosen;
  return atLeast(chosen, logoPlate(design).plate > Q_PLATE_LIMIT ? 'H' : 'Q');
}

/** True when the design carries a logo (uploaded, preset or inlined). */
export function designHasLogo(design: Pick<QrDesign, 'logoUrl' | 'logoPreset'>, logoDataUri?: string | null): boolean {
  return Boolean(logoDataUri || design.logoUrl || design.logoPreset);
}
