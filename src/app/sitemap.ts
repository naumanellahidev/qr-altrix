import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { PUBLIC_ROUTES } from '@/lib/seo/routes';

// Generated per request: APP_URL is configured at runtime, not at build time.
export const dynamic = 'force-dynamic';

/**
 * The indexable public pages, from the single list in lib/seo/routes.ts.
 *
 * - URLs are the exact canonical URLs (same host, same trailing-slash form), so each
 *   entry matches the <link rel="canonical"> of the page it lists.
 * - <lastmod> is the page's real content date. A timestamp that changes on every request
 *   teaches Google to ignore lastmod for the whole site.
 * - No <changefreq> or <priority>: Google ignores both.
 * - Sign-in, password and account pages are left out on purpose; they are noindex.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.appUrl.replace(/\/+$/, '');
  return PUBLIC_ROUTES.map((route) => ({
    url: route.path === '/' ? `${base}/` : `${base}${route.path}`,
    lastModified: new Date(`${route.updated}T00:00:00Z`),
  }));
}
