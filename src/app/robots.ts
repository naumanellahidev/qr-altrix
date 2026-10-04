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
const PRIVATE = [
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
];

/**
 * AI assistants and answer engines, named so the welcome is explicit (some sites block
 * them by name, and some assistants check for their own group). A named group replaces
 * the `*` group for that bot, so each repeats the private paths. /llms.txt is public.
 */
export const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended', 'Applebot',
  'Bingbot', 'DuckAssistBot', 'Amazonbot', 'meta-externalagent',
  'MistralAI-User', 'cohere-ai', 'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_CRAWLERS, allow: ['/', '/llms.txt', '/llms-full.txt'], disallow: PRIVATE },
    ],
    sitemap: `${env.appUrl.replace(/\/+$/, '')}/sitemap.xml`,
  };
}
