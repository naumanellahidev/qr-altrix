/**
 * Display labels shared by the server aggregation layer and the client charts.
 * Kept free of server-only imports so both can use it.
 */

export const COUNTRY_NAMES: Record<string, string> = {
  PK: 'Pakistan', IN: 'India', US: 'United States', GB: 'United Kingdom', AE: 'United Arab Emirates',
  SA: 'Saudi Arabia', CA: 'Canada', AU: 'Australia', DE: 'Germany', FR: 'France', ES: 'Spain',
  IT: 'Italy', NL: 'Netherlands', SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland',
  PL: 'Poland', TR: 'Türkiye', EG: 'Egypt', ZA: 'South Africa', NG: 'Nigeria', KE: 'Kenya',
  BR: 'Brazil', MX: 'Mexico', AR: 'Argentina', CL: 'Chile', CO: 'Colombia', JP: 'Japan',
  KR: 'South Korea', CN: 'China', HK: 'Hong Kong', SG: 'Singapore', MY: 'Malaysia', ID: 'Indonesia',
  TH: 'Thailand', VN: 'Vietnam', PH: 'Philippines', BD: 'Bangladesh', LK: 'Sri Lanka', NP: 'Nepal',
  IR: 'Iran', IQ: 'Iraq', QA: 'Qatar', KW: 'Kuwait', OM: 'Oman', BH: 'Bahrain', JO: 'Jordan',
  IE: 'Ireland', PT: 'Portugal', GR: 'Greece', CH: 'Switzerland', AT: 'Austria', BE: 'Belgium',
  CZ: 'Czechia', RO: 'Romania', UA: 'Ukraine', RU: 'Russia', NZ: 'New Zealand',
};

export function countryName(code: string): string {
  if (!code || code === 'Unknown') return 'Unknown';
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}

/** Regional-indicator flag for a two-letter country code. */
export function countryFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return '🌐';
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split('')
      .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  );
}

export const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Mobile phone',
  tablet: 'Tablet',
  desktop: 'Desktop',
  bot: 'Bot or crawler',
  other: 'Other device',
};

export function deviceLabel(value: string): string {
  return DEVICE_LABELS[value.toLowerCase()] ?? value;
}
