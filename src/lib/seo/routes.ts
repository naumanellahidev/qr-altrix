/**
 * Every public page that search engines should index — the single list the sitemap and
 * each page's canonical URL are built from. A page that is not here is not in the
 * sitemap; add new marketing pages (QR type pages, guides) here and they are picked up.
 *
 * `updated` is the date the page's *content* last changed, not the deploy date. Google
 * trusts <lastmod> only while it stays accurate, so bump it when the words on the page
 * change, and leave it alone for refactors.
 */
export interface PublicRoute {
  path: string;
  /** YYYY-MM-DD of the last real content change. */
  updated: string;
}

export const PUBLIC_ROUTES = [
  { path: '/', updated: '2026-10-04' },
  { path: '/developers', updated: '2026-10-04' },
  { path: '/support', updated: '2026-10-04' },
  { path: '/signup', updated: '2026-10-03' },
  { path: '/report-abuse', updated: '2026-10-03' },
  { path: '/legal/terms', updated: '2026-10-03' },
  { path: '/legal/privacy', updated: '2026-10-03' },
] as const satisfies readonly PublicRoute[];

export type PublicPath = (typeof PUBLIC_ROUTES)[number]['path'];

/** The canonical URL of a public page, relative to metadataBase (APP_URL). */
export function canonical(path: PublicPath): { canonical: string } {
  return { canonical: path };
}
