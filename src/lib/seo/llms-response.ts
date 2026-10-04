import 'server-only';
import { env } from '@/lib/env';
import { getSettings } from '@/lib/settings';
import { brandingFromSettings } from '@/lib/qr/branding';
import type { LlmsFacts } from '@/lib/seo/llms';

/** Live facts for the llms files, read from the platform settings on each request. */
export async function llmsFacts(): Promise<LlmsFacts> {
  const settings = await getSettings().catch(() => null);
  return {
    baseUrl: env.appUrl.replace(/\/+$/, ''),
    expiryEnabled: Boolean(settings?.expiryEnabled),
    brandingEnabled: brandingFromSettings(settings, env.appUrl) !== null,
    bulkMaxRows: settings?.bulkMaxRows ?? env.bulkMaxRows,
    apiRateLimitPerMin: settings?.rateLimitApiPerMin ?? env.rateLimits.apiPerMin,
    maxUploadMb: settings?.maxUploadMb ?? env.storage.maxUploadMb,
  };
}

export function textResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      // Cached at the edge for an hour; settings changes show up within that.
      'cache-control': 'public, max-age=3600, s-maxage=3600',
      'x-robots-tag': 'noindex',
    },
  });
}
