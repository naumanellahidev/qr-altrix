import type { Metadata } from 'next';
import type { PublicPath } from '@/lib/seo/routes';

/**
 * Title, description, canonical, Open Graph and Twitter tags for one public page, kept
 * consistent with each other. Next replaces (not merges) a parent's openGraph object, so
 * every page sets all of it here rather than relying on the root layout.
 *
 * Length targets: title <= 60 characters before the " · QR ALTRIX" suffix, description
 * 120-155 characters — what search results show without truncating.
 */
export function pageMeta({
  path,
  title,
  description,
  absoluteTitle = false,
}: {
  path: PublicPath;
  title: string;
  description: string;
  /** Use the title as-is, without the " · QR ALTRIX" template suffix. */
  absoluteTitle?: boolean;
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} · QR ALTRIX`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: 'QR ALTRIX',
      locale: 'en_US',
      url: path,
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
export function homeMeta(expiryEnabled: boolean, guestStaticDownload: boolean): Metadata {
  const signup = guestStaticDownload ? 'No sign-up for static codes.' : 'Free account, no card.';
  return pageMeta({
    path: '/',
    absoluteTitle: true,
    title: expiryEnabled
      ? 'Free QR Code Generator – Dynamic QR Codes & Analytics | QR ALTRIX'
      : 'Free QR Code Generator – Dynamic QR Codes, No Expiry | QR ALTRIX',
    description: expiryEnabled
      ? 'Free QR codes with your logo, colours and frames. Unlimited dynamic QR codes you can edit after printing, live scan analytics, bulk and an API.'
      : `Free QR codes with your logo and frames. Unlimited dynamic QR codes that never expire, live scan analytics, bulk and API. ${signup}`,
  });
}
