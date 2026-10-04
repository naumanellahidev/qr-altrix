import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

// APP_URL is a runtime value, so robots.txt is generated per request rather than baked
// into the build output.
export const dynamic = 'force-dynamic';

/**
 * Everything is crawlable except what belongs to a specific user or does nothing useful
 * for a searcher: the API, dashboard, admin, scan redirects and hosted landing pages,
 * and one-time account links.
 *
 * Not blocked on purpose:
 * - /_next/ (scripts, styles, fonts): Google renders pages and needs them.
 * - /login and /forgot-password: they carry `noindex`, and a crawler can only read that
 *   tag on a page it is allowed to fetch.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/admin',
          '/q/',
          '/r/',
          '/l/',
          '/p/',
          '/inactive/',
          '/invite/',
          '/verify-email',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${env.appUrl.replace(/\/+$/, '')}/sitemap.xml`,
  };
}
