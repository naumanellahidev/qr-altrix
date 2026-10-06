import type { Metadata } from 'next';
import Link from 'next/link';
import { MaskIcon } from '@/components/ui/mask-icon';
import { CtaBand, Features, TrustBar, TypesShowcase, UseCases } from '@/components/marketing/sections';
import { Faq } from '@/components/marketing/faq';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { env } from '@/lib/env';
import { getSettings } from '@/lib/settings';
import { homeMeta } from '@/lib/seo/meta';
import { homeFaqs } from '@/lib/seo/faq';
import { applicationSchema, faqSchema, graph, organizationSchema, websiteSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/json-ld';
import { getContent, PUBLISHED_LOCALES } from '@/content';
import type { Locale } from '@/i18n/locales';
import { MarketingShell } from '@/views/marketing-shell';
import { GeneratorSection } from '@/views/generator-section';

/** Title and description follow the live settings: with an expiry policy on, no "never expire". */
export async function homePageMeta(locale: Locale): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  const { home } = getContent(locale);
  const expiry = Boolean(settings?.expiryEnabled);
  return homeMeta(expiry, settings?.allowGuestStaticDownload ?? env.allowGuestStaticDownload, {
    locale,
    languages: PUBLISHED_LOCALES,
    title: expiry ? home.titleExpiry : home.title,
    description: expiry ? home.descriptionExpiry : home.description,
  });
}

export async function HomePage({ locale }: { locale: Locale }) {
  // The landing page must render even before the database is migrated.
  const settings = await getSettings().catch(() => null);
  const content = getContent(locale);
  const { home, ui } = content;

  // The hero copy must describe this install: an operator can switch expiry on.
  const expiryEnabled = Boolean(settings?.expiryEnabled);
  const guestStaticDownload = settings?.allowGuestStaticDownload ?? env.allowGuestStaticDownload;
  const showApi = Boolean(settings?.developerApiEnabled);
  const faqs = homeFaqs({ expiryEnabled, guestStaticDownload }, home);
  const base = env.appUrl.replace(/\/+$/, '');

  return (
    <MarketingShell locale={locale} path="/">
      {/* ------------------------------------------------------------ hero */}
      <section className="qa-glow relative overflow-hidden">
        <div className="container relative z-10 pb-10 pt-10 sm:pt-14">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <Badge variant="success" className="mb-4">
              <MaskIcon name="Infinity" className="size-3" />
              {expiryEnabled ? home.badgeExpiry : home.badge}
            </Badge>
            <h1 className="font-display text-[32px] font-bold leading-[1.1] tracking-[-0.035em] sm:text-[46px]">
              <span className="mb-3 block text-[13px] font-semibold uppercase tracking-[0.14em] text-primary-soft-foreground sm:text-[14px]">
                {home.eyebrow}
              </span>{' '}
              {home.h1}{' '}
              <span className="block text-gradient">{expiryEnabled ? home.h1AccentExpiry : home.h1Accent}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground sm:text-[16px]">
              {home.lead} {expiryEnabled ? home.leadTailExpiry : home.leadTail}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="text-[14px] leading-none text-warning" aria-hidden>
                  ★
                </span>
                {home.stats}
              </span>
              <span className="hidden h-3 w-px bg-border sm:block" />
              <span>{expiryEnabled ? home.noCardExpiry : home.noCard}</span>
            </div>
          </div>

          <GeneratorSection locale={locale} />
        </div>
      </section>

      <TrustBar copy={home} expiryEnabled={expiryEnabled} showApi={showApi} />
      <Features copy={home} showApi={showApi} />
      <UseCases copy={home} locale={locale} />
      <TypesShowcase
        copy={home}
        catalog={content.catalog}
        locale={locale}
        staticLabel={ui.common.static}
        dynamicLabel={ui.common.dynamic}
      />

      {/* --------------------------------------------------- how it works */}
      <section className="cv-auto border-y border-border bg-surface py-16 sm:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] sm:text-[34px]">{home.stepsTitle}</h2>
          </div>
          <ol className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {home.steps.map((step, index) => (
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
                {home.openBuilder} <MaskIcon name="ArrowRight" className="rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Faq items={faqs} title={home.faqTitle} lead={home.faqLead} />
      <CtaBand copy={home} showApi={showApi} />

      <JsonLd
        data={graph(organizationSchema(base), websiteSchema(base), applicationSchema(base, { expiryEnabled }), faqSchema(base, faqs))}
      />
    </MarketingShell>
  );
}
