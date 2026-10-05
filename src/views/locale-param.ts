import { notFound } from 'next/navigation';
import { isPublished } from '@/content';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/i18n/locales';

/**
 * The language of a /[locale]/… route. English lives at the root, so /en/… is not a
 * page; neither is a language whose translation is not complete yet.
 */
export function validLocale(value: string): Locale | null {
  return isLocale(value) && value !== DEFAULT_LOCALE && isPublished(value) ? value : null;
}

export async function localeFromParams(params: Promise<{ locale: string }>): Promise<Locale> {
  const locale = validLocale((await params).locale);
  if (!locale) notFound();
  return locale;
}
