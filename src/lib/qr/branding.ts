/**
 * The credit line printed under every QR code this install renders.
 *
 * QR ALTRIX is free, so each printed code doubles as a small, honest pointer back to
 * where it was made. The line sits below the code, outside its quiet zone, so it can
 * never change how the code scans. Operators control it in Admin → Platform settings.
 *
 * Isomorphic: the live preview and the server exports draw the same line.
 */

export const BRANDING_MAX_LENGTH = 60;

/**
 * "Free QR codes by QR ALTRIX · qr.altrixcore.com": what it costs, who made it and where
 * to get one, in one short line. The host follows APP_URL.
 */
export function defaultBrandingText(appUrl?: string | null): string {
  let host = 'qr.altrixcore.com';
  if (appUrl) {
    try {
      host = new URL(appUrl).host.replace(/^www\./, '') || host;
    } catch {
      /* keep the default host */
    }
  }
  return `Free QR codes by QR ALTRIX · ${host}`;
}

/** Collapses whitespace and clamps the length; an empty line means "no line". */
export function cleanBrandingText(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = value.replace(/\s+/g, ' ').trim().slice(0, BRANDING_MAX_LENGTH);
  return text.length > 0 ? text : null;
}

/** The line to draw for a set of platform settings, or null when it is switched off. */
export function brandingFromSettings(
  settings: { brandingEnabled?: boolean; brandingText?: string | null } | null | undefined,
  appUrl?: string | null,
): string | null {
  if (settings && settings.brandingEnabled === false) return null;
  return cleanBrandingText(settings?.brandingText) ?? defaultBrandingText(appUrl);
}
