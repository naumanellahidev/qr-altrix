import { getAuthContext } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { env } from '@/lib/env';
import { brandingFromSettings } from '@/lib/qr/branding';
import { BrandingProvider } from '@/components/qr/branding-context';
import { GeneratorCopyProvider } from '@/components/qr/generator-copy';
import { LazyHeroGenerator } from '@/components/marketing/hero-generator-lazy';
import { getContent } from '@/content';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/locales';

/**
 * The QR generator with the live settings it needs (guest downloads, expiry, branding,
 * Google sign-in). Used on the homepage and on every type landing page, where it opens
 * on that page's type. In another language the generator's words come from that
 * locale's content; English needs no provider (the components default to it).
 */
export async function GeneratorSection({ initialType, locale = DEFAULT_LOCALE }: { initialType?: string; locale?: Locale }) {
  const [settings, auth] = await Promise.all([
    getSettings().catch(() => null),
    getAuthContext().catch(() => null),
  ]);
  const generator = (
    <LazyHeroGenerator
      googleEnabled={env.google.enabled}
      allowGuestStaticDownload={settings?.allowGuestStaticDownload ?? env.allowGuestStaticDownload}
      shortUrlBase={env.shortUrlBase}
      signedIn={Boolean(auth)}
      expiryEnabled={Boolean(settings?.expiryEnabled)}
      initialType={initialType}
    />
  );
  const content = locale === DEFAULT_LOCALE ? null : getContent(locale);
  return (
    <div id="generator" className="scroll-mt-24">
      <BrandingProvider value={brandingFromSettings(settings, env.appUrl)}>
        {content ? (
          <GeneratorCopyProvider copy={content.generator} phrases={content.phrases} locale={locale}>
            {generator}
          </GeneratorCopyProvider>
        ) : (
          generator
        )}
      </BrandingProvider>
    </div>
  );
}
