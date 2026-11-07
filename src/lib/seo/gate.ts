import { getSettings } from '@/lib/settings';
import { env } from '@/lib/env';
import type { SeoGate } from '@/content/seo';

/** The live settings the English search content must agree with. */
export async function seoGate(): Promise<SeoGate> {
  const settings = await getSettings().catch(() => null);
  return {
    expiryEnabled: Boolean(settings?.expiryEnabled),
    guestDownload: settings?.allowGuestStaticDownload ?? env.allowGuestStaticDownload,
  };
}
