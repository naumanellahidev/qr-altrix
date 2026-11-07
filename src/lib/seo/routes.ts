import { SEO_KINDS, SEO_UPDATED, allSeoDocs, seoPath } from '@/content/seo';
import { CONTENT_UPDATED, GUIDES, TYPE_KEYS, TYPE_SLUGS, USE_CASES } from '@/content/registry';

/**
 * Every public page search engines should index — the single list the sitemap,
 * canonical URLs and hreflang alternates are built from.
 *
 * Two kinds:
 * - ENGLISH_ROUTES: pages that exist only in English (developer docs, legal, sign-up).
 * - localizedRoutes(): marketing pages published in every language with complete
 *   content, at /<path> in English and /<code>/<path> elsewhere.
 *
 * `updated` is the date the words last changed (YYYY-MM-DD), not the deploy date.
 * Google trusts <lastmod> only while it stays accurate.
 */
export interface PublicRoute {
  path: string;
  updated: string;
}

export const ENGLISH_ROUTES: PublicRoute[] = [
  { path: '/developers', updated: '2026-10-04' },
  { path: '/support', updated: '2026-10-04' },
  { path: '/signup', updated: '2026-10-03' },
  { path: '/report-abuse', updated: '2026-10-03' },
  { path: '/legal/terms', updated: '2026-10-03' },
  { path: '/legal/privacy', updated: '2026-10-03' },
  // English-only search content: hubs and every answer, long guide and QR-code-for page.
  { path: SEO_KINDS.answers.path, updated: SEO_UPDATED },
  { path: SEO_KINDS.for.path, updated: SEO_UPDATED },
  ...allSeoDocs().map((doc) => ({ path: seoPath(doc.kind, doc.slug), updated: SEO_UPDATED })),
];

export function localizedRoutes(): PublicRoute[] {
  return [
    { path: '/', updated: '2026-10-05' },
    { path: '/qr-code-generator', updated: CONTENT_UPDATED.hubs },
    ...TYPE_KEYS.map((key) => ({ path: `/qr-code-generator/${TYPE_SLUGS[key]}`, updated: CONTENT_UPDATED.types })),
    { path: '/use-cases', updated: CONTENT_UPDATED.hubs },
    ...USE_CASES.map((useCase) => ({ path: `/use-cases/${useCase.slug}`, updated: CONTENT_UPDATED.useCases })),
    { path: '/guides', updated: CONTENT_UPDATED.hubs },
    ...GUIDES.map((guide) => ({ path: `/guides/${guide.slug}`, updated: CONTENT_UPDATED.guides })),
    { path: '/best-free-qr-code-generator', updated: CONTENT_UPDATED.compare },
    { path: '/tools/qr-code-scanner', updated: CONTENT_UPDATED.tools },
    { path: '/tools/bulk-qr-code-generator', updated: CONTENT_UPDATED.tools },
  ];
}

/** Every indexable path in English, localized ones included. */
export function allEnglishPaths(): string[] {
  return [...localizedRoutes(), ...ENGLISH_ROUTES].map((route) => route.path);
}

/** Paths that are translated (have /<code>/ versions). */
export function isLocalizedPath(path: string): boolean {
  return localizedRoutes().some((route) => route.path === path);
}
