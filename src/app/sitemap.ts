import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { ENGLISH_ROUTES, localizedRoutes } from '@/lib/seo/routes';
import { PUBLISHED_LOCALES } from '@/content';
import { DEFAULT_LOCALE, localePath } from '@/i18n/locales';
import { isDeveloperApiEnabled } from '@/lib/settings';

// Generated per request: APP_URL is configured at runtime, not at build time.
export const dynamic = 'force-dynamic';

/**
 * The indexable public pages, from the registry in lib/seo/routes.ts.
 *
 * - Translated pages appear once per published language, each listing every language
 *   version (and x-default) as xhtml:link alternates, matching the page's hreflang tags.
 * - URLs are the exact canonical URLs; <lastmod> is the real content date.
 * - No <changefreq> or <priority>: Google ignores both.
 * - Sign-in, password and account pages are left out on purpose; they are noindex.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The API guide is listed only while a platform admin has the developer API switched on.
  const developerApiEnabled = await isDeveloperApiEnabled();
  const base = env.appUrl.replace(/\/+$/, '');
  const abs = (path: string) => (path === '/' ? `${base}/` : `${base}${path}`);
  const date = (updated: string) => new Date(`${updated}T00:00:00Z`);

  const translated = localizedRoutes().flatMap((route) =>
    PUBLISHED_LOCALES.map((locale) => ({
      url: abs(localePath(locale, route.path)),
      lastModified: date(route.updated),
      ...(PUBLISHED_LOCALES.length > 1
        ? {
            alternates: {
              languages: {
                ...Object.fromEntries(PUBLISHED_LOCALES.map((code) => [code, abs(localePath(code, route.path))])),
                'x-default': abs(localePath(DEFAULT_LOCALE, route.path)),
              },
            },
          }
        : {}),
    })),
  );

  const english = ENGLISH_ROUTES.filter((route) => developerApiEnabled || route.path !== '/developers').map((route) => ({
    url: abs(route.path),
    lastModified: date(route.updated),
  }));
  return [...translated, ...english];
}
