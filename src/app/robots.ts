import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

// APP_URL is a runtime value, so robots.txt is generated per request rather than baked
// into the build output.
export const dynamic = 'force-dynamic';

/**
 * Search engines are welcome on the marketing and documentation pages. Everything that
 * belongs to a specific user — the dashboard, admin, hosted landing pages and the scan
 * endpoints themselves — stays out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/developers', '/support', '/report-abuse', '/legal/'],
        disallow: [
          '/api/',
          '/dashboard',
          '/dashboard/',
          '/admin',
          '/admin/',
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
    sitemap: `${env.appUrl}/sitemap.xml`,
    host: env.appUrl,
  };
}
