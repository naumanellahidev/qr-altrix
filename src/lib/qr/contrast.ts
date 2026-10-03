import type { QrDesign } from './types';

/**
 * Scan-safety checker. Runs in the editor (live) and before export, so a user never
 * ships a beautiful QR code that no phone can read.
 */

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface ScanIssue {
  severity: IssueSeverity;
  title: string;
  fix: string;
}

export interface ScanSafetyReport {
  score: number;
  level: 'excellent' | 'good' | 'risky' | 'fail';
  contrastRatio: number;
  issues: ScanIssue[];
}

function hexToRgb(color: string): [number, number, number] | null {
  const value = color.trim();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value);
  if (short) {
    return [
      parseInt(short[1] + short[1], 16),
      parseInt(short[2] + short[2], 16),
      parseInt(short[3] + short[3], 16),
    ];
  }
  const long = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(value);
  if (long) {
    return [parseInt(long[1], 16), parseInt(long[2], 16), parseInt(long[3], 16)];
  }
  const rgb = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(value);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  const named: Record<string, [number, number, number]> = {
    black: [0, 0, 0],
    white: [255, 255, 255],
    red: [255, 0, 0],
    blue: [0, 0, 255],
    green: [0, 128, 0],
  };
  return named[value.toLowerCase()] ?? null;
}

export function relativeLuminance(color: string): number {
  const rgb = hexToRgb(color) ?? [0, 0, 0];
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function checkScanSafety(design: Partial<QrDesign>, moduleCount = 33): ScanSafetyReport {
  const issues: ScanIssue[] = [];
  const fg = design.invert ? design.bgColor ?? '#FFFFFF' : design.fgColor ?? '#0B1120';
  const bg = design.invert ? design.fgColor ?? '#0B1120' : design.bgColor ?? '#FFFFFF';

  const gradientEnabled = Boolean(design.gradientEnabled);
  const effectiveFgs = gradientEnabled
    ? [design.gradientFrom ?? fg, design.gradientTo ?? fg]
    : [fg];

  const ratios = effectiveFgs.map((c) => contrastRatio(c, bg));
  const ratio = Math.min(...ratios);

  let score = 100;

  if (ratio < 2.2) {
    // A code this low in contrast will not scan at all, so it must not read as
    // merely "risky" once other small deductions are applied.
    score -= 62;
    issues.push({
      severity: 'error',
      title: `Contrast is too low (${ratio}:1) — most cameras will fail`,
      fix: 'Use a dark foreground on a light background. Aim for at least 4.5:1.',
    });
  } else if (ratio < 3.5) {
    score -= 30;
    issues.push({
      severity: 'warning',
      title: `Contrast is tight (${ratio}:1)`,
      fix: 'Darken the QR colour or lighten the background for reliable scanning in low light.',
    });
  } else if (ratio < 4.5) {
    score -= 12;
    issues.push({
      severity: 'info',
      title: `Contrast is acceptable (${ratio}:1) but not ideal`,
      fix: 'A slightly darker foreground gives you margin on worn prints and cheap cameras.',
    });
  }

  const fgLum = relativeLuminance(effectiveFgs[0]);
  const bgLum = relativeLuminance(bg);
  if (fgLum > bgLum) {
    score -= 10;
    issues.push({
      severity: 'warning',
      title: 'Light pattern on a dark background',
      fix: 'Inverted QR codes scan on modern phones but fail on some older scanners. Test before printing a large run.',
    });
  }

  const logoSize = design.logoSize ?? 0;
  const hasLogo = Boolean(design.logoUrl || design.logoPreset);
  const ec = design.errorCorrection ?? 'M';
  if (hasLogo) {
    if (logoSize > 30) {
      score -= 35;
      issues.push({
        severity: 'error',
        title: `Logo covers ${logoSize}% of the code`,
        fix: 'Keep the logo at 25% or less, or the data underneath cannot be recovered.',
      });
    } else if (logoSize > 24 && (ec === 'L' || ec === 'M')) {
      score -= 18;
      issues.push({
        severity: 'warning',
        title: 'Large logo with low error correction',
        fix: 'Switch error correction to Q or H when the logo is larger than 24%.',
      });
    } else if (ec === 'L') {
      score -= 8;
      issues.push({
        severity: 'info',
        title: 'Error correction L with a logo',
        fix: 'Level M or Q recovers better if the print is scratched or the logo grows later.',
      });
    }
  }

  const margin = design.margin ?? 4;
  if (margin < 1) {
    score -= 20;
    issues.push({
      severity: 'error',
      title: 'No quiet zone around the code',
      fix: 'Scanners need clear space. Set the margin to at least 2 modules (4 is standard).',
    });
  } else if (margin < 2) {
    score -= 10;
    issues.push({
      severity: 'warning',
      title: 'Quiet zone is very small',
      fix: 'Increase the margin to 2–4 modules so the code separates from the background.',
    });
  }

  if (design.transparentBg) {
    score -= 8;
    issues.push({
      severity: 'info',
      title: 'Transparent background',
      fix: 'Place the code only on plain, light surfaces — busy photos behind it break scanning.',
    });
  }

  if (moduleCount >= 61) {
    score -= 12;
    issues.push({
      severity: 'warning',
      title: 'The content is long, so the pattern is very dense',
      fix: 'Use a dynamic QR code: the printed code stays small and you can change the link later.',
    });
  } else if (moduleCount >= 49) {
    score -= 5;
    issues.push({
      severity: 'info',
      title: 'Dense pattern',
      fix: 'Print at 3 cm or larger, or shorten the content.',
    });
  }

  if (design.bodyShape === 'dots' && (ec === 'L' || ec === 'M')) {
    score -= 5;
    issues.push({
      severity: 'info',
      title: 'Dot style with lower error correction',
      fix: 'Dots have thinner ink coverage. Level Q keeps them reliable on small prints.',
    });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const level: ScanSafetyReport['level'] =
    score >= 90 ? 'excellent' : score >= 72 ? 'good' : score >= 45 ? 'risky' : 'fail';

  return { score, level, contrastRatio: ratio, issues };
}
