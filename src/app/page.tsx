import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Infinity as InfinityIcon, Star } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { HeroGenerator } from '@/components/marketing/hero-generator';
import { CtaBand, Features, TrustBar, TypesShowcase, UseCases } from '@/components/marketing/sections';
import { Faq } from '@/components/marketing/faq';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { env } from '@/lib/env';
import { getSettings } from '@/lib/settings';
import { getAuthContext } from '@/lib/auth';
import { BrandingProvider } from '@/components/qr/branding-context';
import { brandingFromSettings } from '@/lib/qr/branding';
import { homeMeta } from '@/lib/seo/meta';
import { homeFaqs } from '@/lib/seo/faq';
import { applicationSchema, faqSchema, graph, organizationSchema, websiteSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/json-ld';

// Title and description follow the live settings: with an expiry policy switched on, the
// page must not promise codes that never expire.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  return homeMeta(Boolean(settings?.expiryEnabled), settings?.allowGuestStaticDownload ?? env.allowGuestStaticDownload);
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // The landing page must render even before the database is migrated.
  const [settings, auth] = await Promise.all([
    getSettings().catch(() => null),
    getAuthContext().catch(() => null),
  ]);

  // The hero copy must describe this install: an operator can switch expiry on.
  const expiryEnabled = Boolean(settings?.expiryEnabled);
  const guestStaticDownload = settings?.allowGuestStaticDownload ?? env.allowGuestStaticDownload;
  const faqs = homeFaqs({ expiryEnabled, guestStaticDownload });
  const base = env.appUrl.replace(/\/+$/, '');

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader signedIn={Boolean(auth)} />

      <main className="flex-1">
        {/* ------------------------------------------------------------ hero */}
        <section className="qa-glow relative overflow-hidden">
          <div className="container relative z-10 pb-10 pt-10 sm:pt-14">
            <div className="mx-auto mb-8 max-w-3xl text-center">
              <Badge variant="success" className="mb-4">
                <InfinityIcon className="size-3" />
                {expiryEnabled ? 'Free QR codes with full analytics' : 'Dynamic QR codes that never expire'}
              </Badge>
              <h1 className="font-display text-[32px] font-bold leading-[1.1] tracking-[-0.035em] sm:text-[46px]">
                <span className="mb-3 block text-[13px] font-semibold uppercase tracking-[0.14em] text-primary-soft-foreground sm:text-[14px]">
                  Free QR code generator
                </span>
                QR codes that look designed{' '}
                <span className="block text-gradient">
                  {expiryEnabled ? 'and stay under your control' : 'and keep working forever'}
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground sm:text-[16px]">
                Design a code below, download it in seconds, and change where it points whenever you like.
                {expiryEnabled
                  ? ' Free to use, with every code’s expiry date shown in your dashboard.'
                  : ' Free, self-hostable, and no trial countdown anywhere in the product.'}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star className="size-3.5 fill-warning text-warning" />
                  31 QR types, 32 frames, 7 pattern styles
                </span>
                <span className="hidden h-3 w-px bg-border sm:block" />
                <span>{expiryEnabled ? 'No card. No subscription.' : 'No card. No subscription. No expiry.'}</span>
              </div>
            </div>

            <BrandingProvider value={brandingFromSettings(settings, env.appUrl)}>
              <HeroGenerator
                googleEnabled={env.google.enabled}
                allowGuestStaticDownload={settings?.allowGuestStaticDownload ?? env.allowGuestStaticDownload}
                shortUrlBase={env.shortUrlBase}
                signedIn={Boolean(auth)}
                expiryEnabled={expiryEnabled}
              />
            </BrandingProvider>
          </div>
        </section>

        <TrustBar expiryEnabled={expiryEnabled} />
        <Features />
        <UseCases />
        <TypesShowcase />

        {/* --------------------------------------------------- how it works */}
        <section className="border-y border-border bg-surface py-16 sm:py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] sm:text-[34px]">
                Six steps, start to print
              </h2>
            </div>
            <ol className="mx-auto mt-10 grid grid-cols-1 max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Choose a type', body: 'Website, menu, vCard, PDF, gallery, coupon — 31 to pick from.' },
                { title: 'Add your content', body: 'Type a link or upload a file. Validation catches mistakes as you go.' },
                { title: 'Set the behaviour', body: 'Optional password, schedule, scan limit, UTM tags and smart routing.' },
                { title: 'Make it yours', body: 'Frames, shapes, colours, gradients and your logo, with a scan-safety score.' },
                { title: 'Test it', body: 'Scan the live preview with your phone before you commit to print.' },
                { title: 'Download and track', body: 'PNG, SVG, PDF, JPEG, WebP or EPS — then watch the scans arrive.' },
              ].map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-border bg-card p-5">
                  <span className="mb-3 flex size-7 items-center justify-center rounded-lg bg-primary-soft text-[12.5px] font-bold text-primary-soft-foreground">
                    {index + 1}
                  </span>
                  <h3 className="text-[14.5px] font-semibold">{step.title}</h3>
                  <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 text-center">
              <Button asChild variant="subtle">
                <Link href="/dashboard/new">
                  Open the full builder <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <Faq items={faqs} />
        <CtaBand />
      </main>

      <SiteFooter />
      <JsonLd
        data={graph(
          organizationSchema(base),
          websiteSchema(base),
          applicationSchema(base, { expiryEnabled }),
          faqSchema(base, faqs),
        )}
      />
    </div>
  );
}
