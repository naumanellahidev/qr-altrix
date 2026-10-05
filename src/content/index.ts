import 'server-only';
import type { LocaleContent } from '@/content/schema';
import { DEFAULT_LOCALE, LOCALE_CODES, type Locale } from '@/i18n/locales';
import en from './locales/en';
import es from './locales/es';
import pt from './locales/pt';
import fr from './locales/fr';
import de from './locales/de';

/**
 * Translated content, by language. A language is published (routes, sitemap, hreflang,
 * switcher) only once it has a complete LocaleContent here — so a half-translated
 * language can never go live. Server-only: client components receive just the strings
 * they render, never a whole dictionary.
 */
const CONTENT: Partial<Record<Locale, LocaleContent>> = {
  en,
  es,
  pt,
  fr,
  de,
};

/** Languages with complete content, in LOCALES order. */
export const PUBLISHED_LOCALES: Locale[] = LOCALE_CODES.filter((code) => CONTENT[code]);

export function isPublished(locale: Locale): boolean {
  return Boolean(CONTENT[locale]);
}

export function getContent(locale: Locale): LocaleContent {
  return CONTENT[locale] ?? CONTENT[DEFAULT_LOCALE]!;
}
