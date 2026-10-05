import type { Metadata } from 'next';
import { DEFAULT_LOCALE, localeInfo, localePath, type Locale } from '@/i18n/locales';

/**
 * Title, description, canonical, hreflang alternates, Open Graph and Twitter tags for one
 * public page, kept consistent with each other. Next replaces (not merges) a parent's
 * openGraph object, so every page sets all of it here.
 *
 * Length targets: title <= 60 characters before the " · QR ALTRIX" suffix, description
 * 120-155 characters — what search results show without truncating.
 *
 * `languages` is the list of languages this page is published in; for translated pages
 * it produces reciprocal hreflang links plus x-default (English).
 */
export function pageMeta({
  path,
  title,
  description,
  absoluteTitle = false,
  locale = DEFAULT_LOCALE,
  languages = [],
}: {
  path: string;
  title: string;
  description: string;
  /** Use the title as-is, without the " · QR ALTRIX" template suffix. */
  absoluteTitle?: boolean;
  locale?: Locale;
  /** Published languages of a translated page (empty for English-only pages). */
  languages?: Locale[];
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} · QR ALTRIX`;
  const url = localePath(locale, path);
  const alternates: Metadata['alternates'] = { canonical: url };
  if (languages.length > 1) {
    alternates.languages = {
      ...Object.fromEntries(languages.map((code) => [code, localePath(code, path)])),
      'x-default': localePath(DEFAULT_LOCALE, path),
    };
  }
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates,
    openGraph: {
      type: 'website',
      siteName: 'QR ALTRIX',
      locale: localeInfo(locale).og,
      alternateLocale: languages.filter((code) => code !== locale).map((code) => localeInfo(code).og),
      url,
      title: fullTitle,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}

/** Homepage copy depends on whether the operator has switched an expiry policy on. */
export function homeMeta(
  expiryEnabled: boolean,
  guestStaticDownload: boolean,
  opts: { locale?: Locale; languages?: Locale[]; title?: string; description?: string } = {},
): Metadata {
  const signup = guestStaticDownload ? 'No sign-up for static codes.' : 'Free account, no card.';
  return pageMeta({
    path: '/',
    absoluteTitle: true,
    locale: opts.locale,
    languages: opts.languages,
    title:
      opts.title ??
      (expiryEnabled
        ? 'Free QR Code Generator – Dynamic QR Codes & Analytics | QR ALTRIX'
        : 'Free QR Code Generator – Dynamic QR Codes, No Expiry | QR ALTRIX'),
    description:
      opts.description ??
      (expiryEnabled
        ? 'Free QR codes with your logo, colours and frames. Unlimited dynamic QR codes you can edit after printing, live scan analytics, bulk and an API.'
        : `Free QR codes with your logo and frames. Unlimited dynamic QR codes that never expire, live scan analytics, bulk and API. ${signup}`),
  });
}
