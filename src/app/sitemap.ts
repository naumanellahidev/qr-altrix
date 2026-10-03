import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

// Generated per request: APP_URL is configured at runtime, not at build time.
export const dynamic = 'force-dynamic';

/** Only the public, stable pages. Everything behind sign-in is deliberately absent. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${env.appUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${env.appUrl}/developers`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${env.appUrl}/support`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${env.appUrl}/report-abuse`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${env.appUrl}/legal/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${env.appUrl}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${env.appUrl}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${env.appUrl}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
