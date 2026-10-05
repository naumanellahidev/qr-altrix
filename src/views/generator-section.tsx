import { getAuthContext } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { env } from '@/lib/env';
import { brandingFromSettings } from '@/lib/qr/branding';
import { BrandingProvider } from '@/components/qr/branding-context';
import { LazyHeroGenerator } from '@/components/marketing/hero-generator-lazy';

/**
 * The QR generator with the live settings it needs (guest downloads, expiry, branding,
 * Google sign-in). Used on the homepage and on every type landing page, where it opens
 * on that page's type.
 */
export async function GeneratorSection({ initialType }: { initialType?: string }) {
  const [settings, auth] = await Promise.all([
    getSettings().catch(() => null),
    getAuthContext().catch(() => null),
  ]);
  return (
    <div id="generator" className="scroll-mt-24">
      <BrandingProvider value={brandingFromSettings(settings, env.appUrl)}>
        <LazyHeroGenerator
          googleEnabled={env.google.enabled}
          allowGuestStaticDownload={settings?.allowGuestStaticDownload ?? env.allowGuestStaticDownload}
          shortUrlBase={env.shortUrlBase}
          signedIn={Boolean(auth)}
          expiryEnabled={Boolean(settings?.expiryEnabled)}
          initialType={initialType}
        />
      </BrandingProvider>
    </div>
  );
}
