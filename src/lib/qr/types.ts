/** Shared QR engine types. Used by the server renderer and the live browser preview. */

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type BodyShape =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'classy'
  | 'extra-rounded'
  | 'mosaic'
  | 'diamond';

export type EyeFrameShape =
  | 'square'
  | 'rounded'
  | 'circle'
  | 'leaf'
  | 'leaf-flipped'
  | 'shield'
  | 'cut'
  | 'frame-dots';

export type EyeBallShape =
  | 'square'
  | 'rounded'
  | 'circle'
  | 'diamond'
  | 'leaf'
  | 'flower'
  | 'dot-grid';

export type LogoShape = 'none' | 'circle' | 'square' | 'rounded' | 'ribbon';

export type GradientType = 'linear' | 'radial';

export type CtaPosition = 'bottom' | 'top';

export interface QrDesign {
  bodyShape: BodyShape;
  eyeFrameShape: EyeFrameShape;
  eyeBallShape: EyeBallShape;

  fgColor: string;
  bgColor: string;
  transparentBg: boolean;
  invert: boolean;

  gradientEnabled: boolean;
  gradientType: GradientType;
  gradientFrom: string;
  gradientTo: string;
  gradientRotation: number;
  eyeColor?: string | null;
  eyeBallColor?: string | null;

  margin: number;
  errorCorrection: ErrorCorrectionLevel;

  logoUrl?: string | null;
  logoPreset?: string | null;
  /** Percentage of the QR width covered by the logo (10–32 is scan-safe). */
  logoSize: number;
  logoPadding: number;
  logoShape: LogoShape;

  frame: string;
  frameColor: string;
  frameTextColor: string;
  ctaText?: string | null;
  ctaPosition: CtaPosition;
}

export const DEFAULT_DESIGN: QrDesign = {
  bodyShape: 'rounded',
  eyeFrameShape: 'rounded',
  eyeBallShape: 'rounded',
  fgColor: '#0B1120',
  bgColor: '#FFFFFF',
  transparentBg: false,
  invert: false,
  gradientEnabled: false,
  gradientType: 'linear',
  gradientFrom: '#4F46E5',
  gradientTo: '#0EA5E9',
  gradientRotation: 45,
  eyeColor: null,
  eyeBallColor: null,
  margin: 4,
  errorCorrection: 'M',
  logoUrl: null,
  logoPreset: null,
  logoSize: 22,
  logoPadding: 6,
  logoShape: 'none',
  frame: 'none',
  frameColor: '#4F46E5',
  frameTextColor: '#FFFFFF',
  ctaText: null,
  ctaPosition: 'bottom',
};

export interface RenderOptions {
  /** Pixel width of the rendered SVG (height is derived from the frame). */
  size?: number;
  /** Inlined logo so server-side rasterisation does not need network access. */
  logoDataUri?: string | null;
  /** Rendered without the surrounding frame (used for small table thumbnails). */
  bare?: boolean;
  /** Deterministic ids make rendered output diffable and test-friendly. */
  idPrefix?: string;
  /** Credit line drawn under the code, outside the quiet zone. Null or empty: none. */
  branding?: string | null;
}

export type ExportFormat = 'svg' | 'png' | 'jpeg' | 'webp' | 'pdf' | 'eps';

export const EXPORT_FORMATS: { value: ExportFormat; label: string; hint: string }[] = [
  { value: 'png', label: 'PNG', hint: 'Best for web, social and digital use' },
  { value: 'svg', label: 'SVG', hint: 'Vector — scales to any size without loss' },
  { value: 'pdf', label: 'PDF', hint: 'Print-ready vector for signage and menus' },
  { value: 'jpeg', label: 'JPEG', hint: 'Smaller file, white background' },
  { value: 'webp', label: 'WebP', hint: 'Modern web format, small and sharp' },
  { value: 'eps', label: 'EPS', hint: 'Legacy print workflows (Illustrator)' },
];

/**
 * Narrows a stored design row (whose enum-like columns are plain strings in the
 * database) to the renderer's design type. Values are validated on the way in by
 * `designSchema`, so this is a safe read-side cast in one place rather than many.
 */
export function designFromRow(row: unknown): Partial<QrDesign> {
  if (!row || typeof row !== 'object') return {};
  return row as Partial<QrDesign>;
}
