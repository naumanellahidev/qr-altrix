import type { BodyShape, EyeBallShape, EyeFrameShape } from './types';

export interface FramePreset {
  id: string;
  label: string;
  group: 'Minimal' | 'Banner' | 'Card' | 'Playful' | 'Print';
  /** Outer corner radius in module units. */
  radius: number;
  /** Border thickness in module units (0 = no border). */
  border: number;
  /** Padding between border and QR, in module units. */
  padding: number;
  /** Where the call-to-action label sits. */
  label_: 'none' | 'bottom' | 'top' | 'bottom-pill' | 'top-pill' | 'bottom-tag' | 'bubble' | 'ribbon';
  /** Decorative extras drawn by the renderer. */
  decoration?: 'none' | 'corners' | 'double' | 'scallop' | 'dashed' | 'pin' | 'phone' | 'ticket' | 'arrow';
  /** Label band filled with the frame colour (false = transparent band, coloured text). */
  solidLabel?: boolean;
  defaultCta?: string;
}

/**
 * 32 original frame presets. Each one is drawn procedurally by the renderer, so
 * nothing here is a copied graphic — they are parameters, not assets.
 */
export const FRAME_PRESETS: FramePreset[] = [
  { id: 'none', label: 'No frame', group: 'Minimal', radius: 0, border: 0, padding: 0, label_: 'none' },
  { id: 'hairline', label: 'Hairline', group: 'Minimal', radius: 1, border: 0.35, padding: 1.5, label_: 'none' },
  { id: 'soft', label: 'Soft edge', group: 'Minimal', radius: 3, border: 0.6, padding: 2, label_: 'none' },
  { id: 'pill-outline', label: 'Pill outline', group: 'Minimal', radius: 6, border: 0.8, padding: 2.5, label_: 'none' },
  { id: 'corners', label: 'Corner brackets', group: 'Minimal', radius: 2, border: 0.9, padding: 2, label_: 'none', decoration: 'corners' },
  { id: 'dashed', label: 'Dashed', group: 'Minimal', radius: 2, border: 0.6, padding: 2, label_: 'none', decoration: 'dashed' },
  { id: 'double-line', label: 'Double line', group: 'Minimal', radius: 2, border: 0.6, padding: 2.5, label_: 'none', decoration: 'double' },
  { id: 'shadowbox', label: 'Shadow box', group: 'Minimal', radius: 3, border: 0, padding: 2.5, label_: 'none' },

  { id: 'banner-bottom', label: 'Scan me banner', group: 'Banner', radius: 2, border: 0.8, padding: 2, label_: 'bottom', solidLabel: true, defaultCta: 'SCAN ME' },
  { id: 'banner-top', label: 'Banner on top', group: 'Banner', radius: 2, border: 0.8, padding: 2, label_: 'top', solidLabel: true, defaultCta: 'SCAN ME' },
  { id: 'banner-wide', label: 'Wide banner', group: 'Banner', radius: 4, border: 0, padding: 3, label_: 'bottom', solidLabel: true, defaultCta: 'SCAN FOR MENU' },
  { id: 'banner-quiet', label: 'Quiet caption', group: 'Banner', radius: 2, border: 0.5, padding: 2, label_: 'bottom', solidLabel: false, defaultCta: 'Scan with your camera' },
  { id: 'pill-bottom', label: 'Pill label', group: 'Banner', radius: 3, border: 0.8, padding: 2.2, label_: 'bottom-pill', solidLabel: true, defaultCta: 'SCAN ME' },
  { id: 'pill-top', label: 'Pill label on top', group: 'Banner', radius: 3, border: 0.8, padding: 2.2, label_: 'top-pill', solidLabel: true, defaultCta: 'TAP OR SCAN' },
  { id: 'tag', label: 'Price tag', group: 'Banner', radius: 2, border: 0.8, padding: 2, label_: 'bottom-tag', solidLabel: true, defaultCta: 'VIEW OFFER' },
  { id: 'ribbon', label: 'Ribbon', group: 'Banner', radius: 2, border: 0, padding: 2.4, label_: 'ribbon', solidLabel: true, defaultCta: 'SCAN ME' },

  { id: 'card', label: 'Clean card', group: 'Card', radius: 4, border: 0, padding: 3, label_: 'bottom', solidLabel: false, defaultCta: 'Scan to open' },
  { id: 'card-accent', label: 'Accent card', group: 'Card', radius: 4, border: 1.2, padding: 3, label_: 'bottom', solidLabel: true, defaultCta: 'SCAN ME' },
  { id: 'card-header', label: 'Header card', group: 'Card', radius: 4, border: 0, padding: 3, label_: 'top', solidLabel: true, defaultCta: 'OUR MENU' },
  { id: 'rounded-card', label: 'Rounded card', group: 'Card', radius: 7, border: 0.8, padding: 3.2, label_: 'bottom-pill', solidLabel: true, defaultCta: 'SCAN ME' },
  { id: 'business', label: 'Business plate', group: 'Card', radius: 1.5, border: 1.4, padding: 2.6, label_: 'bottom', solidLabel: true, defaultCta: 'CONTACT CARD' },
  { id: 'split', label: 'Split panel', group: 'Card', radius: 3, border: 0, padding: 2.8, label_: 'bottom', solidLabel: true, defaultCta: 'SCAN FOR DETAILS' },

  { id: 'bubble', label: 'Speech bubble', group: 'Playful', radius: 4, border: 0.8, padding: 2.4, label_: 'bubble', solidLabel: true, defaultCta: 'SCAN ME!' },
  { id: 'bubble-top', label: 'Bubble above', group: 'Playful', radius: 4, border: 0.8, padding: 2.4, label_: 'top-pill', solidLabel: true, defaultCta: 'HELLO 👋' },
  { id: 'pin', label: 'Map pin', group: 'Playful', radius: 5, border: 0.9, padding: 2.6, label_: 'bottom', solidLabel: true, decoration: 'pin', defaultCta: 'FIND US' },
  { id: 'phone', label: 'Phone screen', group: 'Playful', radius: 6, border: 1.2, padding: 3, label_: 'bottom', solidLabel: false, decoration: 'phone', defaultCta: 'Scan with your phone' },
  { id: 'scallop', label: 'Scalloped', group: 'Playful', radius: 3, border: 0.7, padding: 2.6, label_: 'bottom', solidLabel: true, decoration: 'scallop', defaultCta: 'SCAN ME' },
  { id: 'arrow', label: 'Pointer', group: 'Playful', radius: 3, border: 0.8, padding: 2.4, label_: 'bottom', solidLabel: true, decoration: 'arrow', defaultCta: 'SCAN HERE' },

  { id: 'ticket', label: 'Event ticket', group: 'Print', radius: 2.5, border: 0.8, padding: 2.6, label_: 'bottom', solidLabel: true, decoration: 'ticket', defaultCta: 'ADMIT ONE' },
  { id: 'table-tent', label: 'Table tent', group: 'Print', radius: 2, border: 1, padding: 3.4, label_: 'top', solidLabel: true, defaultCta: 'SCAN TO ORDER' },
  { id: 'label-strip', label: 'Label strip', group: 'Print', radius: 1, border: 0.6, padding: 2, label_: 'bottom', solidLabel: false, defaultCta: 'SKU / SCAN' },
  { id: 'poster', label: 'Poster block', group: 'Print', radius: 0, border: 1.6, padding: 3.6, label_: 'bottom', solidLabel: true, defaultCta: 'SCAN FOR MORE' },
];

export function getFramePreset(id: string | null | undefined): FramePreset {
  return FRAME_PRESETS.find((f) => f.id === id) ?? FRAME_PRESETS[0];
}

export const BODY_SHAPES: { value: BodyShape; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'classy', label: 'Classy' },
  { value: 'mosaic', label: 'Mosaic' },
  { value: 'diamond', label: 'Diamond' },
];

export const EYE_FRAME_SHAPES: { value: EyeFrameShape; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'leaf', label: 'Leaf' },
  { value: 'leaf-flipped', label: 'Leaf flipped' },
  { value: 'shield', label: 'Shield' },
  { value: 'cut', label: 'Cut corner' },
  { value: 'frame-dots', label: 'Dotted' },
];

export const EYE_BALL_SHAPES: { value: EyeBallShape; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'leaf', label: 'Leaf' },
  { value: 'flower', label: 'Flower' },
  { value: 'dot-grid', label: 'Dot grid' },
];

/**
 * Built-in icon library. Every glyph is an original, hand-written SVG path drawn on
 * a 24×24 grid — no third-party icon assets are bundled.
 */
export interface LogoPreset {
  id: string;
  label: string;
  group: string;
  /** Path data on a 0 0 24 24 viewBox. */
  path: string;
  color: string;
}

export const LOGO_PRESETS: LogoPreset[] = [
  {
    id: 'wifi',
    label: 'Wi-Fi',
    group: 'Utility',
    color: '#0EA5E9',
    path: 'M12 18.5a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2zm-3.6-3.9a5.1 5.1 0 017.2 0l-1.5 1.5a3 3 0 00-4.2 0l-1.5-1.5zm-2.8-2.8a9.1 9.1 0 0112.8 0l-1.5 1.5a7 7 0 00-9.8 0l-1.5-1.5zm-2.8-2.9a13.1 13.1 0 0118.4 0l-1.5 1.5a11 11 0 00-15.4 0L2.8 8.9z',
  },
  {
    id: 'link',
    label: 'Link',
    group: 'Utility',
    color: '#4F46E5',
    path: 'M10.6 13.4a1 1 0 010-1.4l1.4-1.4a1 1 0 011.4 1.4l-1.4 1.4a1 1 0 01-1.4 0zM7 17a4 4 0 010-5.6l2.1-2.1 1.4 1.4L8.4 12.8a2 2 0 002.8 2.8l2.1-2.1 1.4 1.4L12.6 17A4 4 0 017 17zm10-10a4 4 0 010 5.6l-2.1 2.1-1.4-1.4 2.1-2.1a2 2 0 00-2.8-2.8l-2.1 2.1L9.3 9.1 11.4 7A4 4 0 0117 7z',
  },
  {
    id: 'cart',
    label: 'Shopping',
    group: 'Commerce',
    color: '#16A34A',
    path: 'M3 4h2.3l.8 2H20a1 1 0 01.96 1.28l-1.8 6A2 2 0 0117.24 15H9.1l-.3 1.2H19v2H7.4a1 1 0 01-.97-1.24l.7-2.8L4.4 6H3V4zm4.4 4l1.3 5h8.3l1.5-5H7.4zM9 19.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm7 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z',
  },
  {
    id: 'menu',
    label: 'Restaurant',
    group: 'Hospitality',
    color: '#EA580C',
    path: 'M7 3v7.2a2.8 2.8 0 01-2 2.7V21H3V3h2v6h1V3h2zm4 0h2a4 4 0 014 4v4a4 4 0 01-3 3.87V21h-2v-6.13A4 4 0 019 11V7a4 4 0 012-3.46V3zm0 4v4a2 2 0 004 0V7a2 2 0 00-4 0zm8-4h2v18h-2V3z',
  },
  {
    id: 'play',
    label: 'Video',
    group: 'Media',
    color: '#DC2626',
    path: 'M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v13A2.5 2.5 0 0117.5 21h-11A2.5 2.5 0 014 18.5v-13zm6 3.1v6.8l5.4-3.4L10 8.6z',
  },
  {
    id: 'music',
    label: 'Audio',
    group: 'Media',
    color: '#9333EA',
    path: 'M18 3v11.3a3.2 3.2 0 11-2-2.96V7.6l-6 1.3v7.4a3.2 3.2 0 11-2-2.96V6.6L18 4.2V3z',
  },
  {
    id: 'camera',
    label: 'Photos',
    group: 'Media',
    color: '#0891B2',
    path: 'M9.2 3h5.6l1.2 2H20a2 2 0 012 2v11a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2h4l1.2-2zm2.8 5.5A4.5 4.5 0 1012 17.5a4.5 4.5 0 000-9zm0 2a2.5 2.5 0 110 5 2.5 2.5 0 010-5z',
  },
  {
    id: 'pin',
    label: 'Location',
    group: 'Utility',
    color: '#E11D48',
    path: 'M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 4.2A2.8 2.8 0 1012 11.8 2.8 2.8 0 0012 6.2z',
  },
  {
    id: 'card',
    label: 'Contact card',
    group: 'Business',
    color: '#1D4ED8',
    path: 'M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm1 2v10h16V7H4zm2 2h5v2H6V9zm0 4h5v2H6v-2zm7-4h5v2h-5V9zm0 4h5v2h-5v-2z',
  },
  {
    id: 'calendar',
    label: 'Event',
    group: 'Business',
    color: '#7C3AED',
    path: 'M7 2v2h10V2h2v2h2a1 1 0 011 1v15a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h2V2h2zM4 9v11h16V9H4zm3 2h4v4H7v-4z',
  },
  {
    id: 'tag',
    label: 'Coupon',
    group: 'Commerce',
    color: '#F59E0B',
    path: 'M11.3 2.3a1 1 0 01.7-.3h8a1 1 0 011 1v8a1 1 0 01-.3.7l-9.6 9.6a1 1 0 01-1.42 0L2.3 14.6a1 1 0 010-1.42l9-9zM17 5.5a1.6 1.6 0 100 3.2 1.6 1.6 0 000-3.2z',
  },
  {
    id: 'app',
    label: 'App store',
    group: 'Business',
    color: '#0F172A',
    path: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z',
  },
  {
    id: 'chat',
    label: 'Feedback',
    group: 'Business',
    color: '#0D9488',
    path: 'M3 5a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H9l-5 4v-4H5a2 2 0 01-2-2V5zm4 3h10v2H7V8zm0 4h7v2H7v-2z',
  },
  {
    id: 'home',
    label: 'Real estate',
    group: 'Business',
    color: '#B45309',
    path: 'M12 2.6l10 8.2-1.3 1.6-1.7-1.4V21H5V11l-1.7 1.4L2 10.8 12 2.6zM7 10.3V19h4v-5h2v5h4v-8.7l-5-4.1-5 4.1z',
  },
  {
    id: 'spark',
    label: 'Promo',
    group: 'Utility',
    color: '#DB2777',
    path: 'M12 2l2.1 5.6L20 9.5l-4.6 3.7L16.6 19 12 16.1 7.4 19l1.2-5.8L4 9.5l5.9-1.9L12 2z',
  },
  {
    id: 'qr',
    label: 'QR mark',
    group: 'Utility',
    color: '#0B1120',
    path: 'M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm10-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v4h-6v-2h4v-2z',
  },
];

export function getLogoPreset(id: string | null | undefined): LogoPreset | null {
  if (!id) return null;
  return LOGO_PRESETS.find((l) => l.id === id) ?? null;
}

export function logoPresetDataUri(preset: LogoPreset): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="256" height="256"><path d="${preset.path}" fill="${preset.color}"/></svg>`;
  return `data:image/svg+xml;base64,${typeof window === 'undefined' ? Buffer.from(svg).toString('base64') : btoa(svg)}`;
}

/** Curated, original colour pairings offered as one-click looks in the editor. */
export const COLOR_PRESETS: { id: string; label: string; fg: string; bg: string; gradientTo?: string }[] = [
  { id: 'midnight', label: 'Midnight', fg: '#0B1120', bg: '#FFFFFF' },
  { id: 'indigo', label: 'Indigo rise', fg: '#4F46E5', bg: '#FFFFFF', gradientTo: '#0EA5E9' },
  { id: 'ocean', label: 'Deep ocean', fg: '#0C4A6E', bg: '#F0F9FF', gradientTo: '#0EA5E9' },
  { id: 'forest', label: 'Forest', fg: '#14532D', bg: '#F0FDF4', gradientTo: '#16A34A' },
  { id: 'sunset', label: 'Sunset', fg: '#9A3412', bg: '#FFF7ED', gradientTo: '#F59E0B' },
  { id: 'berry', label: 'Berry', fg: '#86198F', bg: '#FDF4FF', gradientTo: '#DB2777' },
  { id: 'graphite', label: 'Graphite', fg: '#1F2937', bg: '#F9FAFB' },
  { id: 'inverse', label: 'Inverse', fg: '#FFFFFF', bg: '#0B1120' },
];
