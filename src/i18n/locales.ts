/**
 * The languages the public site is published in. English is served at the root with no
 * prefix; every other language lives under /<code>/ with the same English slugs
 * (/es/qr-code-generator/wifi). The dashboard, admin and legal pages stay English.
 *
 * Shared by middleware (edge), server components and client components: keep it free of
 * Node and React imports.
 */
export const LOCALES = [
  { code: 'en', name: 'English', native: 'English', dir: 'ltr', og: 'en_US' },
  { code: 'es', name: 'Spanish', native: 'Español', dir: 'ltr', og: 'es_ES' },
  { code: 'pt', name: 'Portuguese', native: 'Português', dir: 'ltr', og: 'pt_BR' },
  { code: 'fr', name: 'French', native: 'Français', dir: 'ltr', og: 'fr_FR' },
  { code: 'de', name: 'German', native: 'Deutsch', dir: 'ltr', og: 'de_DE' },
  { code: 'it', name: 'Italian', native: 'Italiano', dir: 'ltr', og: 'it_IT' },
  { code: 'ru', name: 'Russian', native: 'Русский', dir: 'ltr', og: 'ru_RU' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '简体中文', dir: 'ltr', og: 'zh_CN' },
  { code: 'ja', name: 'Japanese', native: '日本語', dir: 'ltr', og: 'ja_JP' },
  { code: 'ko', name: 'Korean', native: '한국어', dir: 'ltr', og: 'ko_KR' },
  { code: 'ar', name: 'Arabic', native: 'العربية', dir: 'rtl', og: 'ar_AR' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', dir: 'ltr', og: 'hi_IN' },
  { code: 'ur', name: 'Urdu', native: 'اردو', dir: 'rtl', og: 'ur_PK' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', dir: 'ltr', og: 'id_ID' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', dir: 'ltr', og: 'tr_TR' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', dir: 'ltr', og: 'vi_VN' },
] as const;

export type Locale = (typeof LOCALES)[number]['code'];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_CODES = LOCALES.map((locale) => locale.code) as Locale[];
/** Every language except English: the ones that get a /<code>/ prefix. */
export const PREFIXED_LOCALES = LOCALE_CODES.filter((code) => code !== DEFAULT_LOCALE);

/** Request header the middleware sets so the root layout can write <html lang dir>. */
export const LOCALE_HEADER = 'x-qa-locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALE_CODES as string[]).includes(value);
}

export function localeInfo(locale: Locale) {
  return LOCALES.find((entry) => entry.code === locale) ?? LOCALES[0];
}

export function dirOf(locale: Locale): 'ltr' | 'rtl' {
  return localeInfo(locale).dir;
}

/** The path of a page in a language: '/x' stays '/x' in English, becomes '/es/x' in Spanish. */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
}

/** Splits '/es/qr-code-generator' into { locale: 'es', path: '/qr-code-generator' }. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split('/');
  if (first && first !== DEFAULT_LOCALE && isLocale(first)) {
    return { locale: first, path: `/${rest.join('/')}`.replace(/\/+$/, '') || '/' };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || '/' };
}
