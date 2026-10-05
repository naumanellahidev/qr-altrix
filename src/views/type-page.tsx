import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContent, PUBLISHED_LOCALES } from '@/content';
import { RELATED_TYPES, TYPE_KEYS, TYPE_SLUGS, typeKeyFromSlug } from '@/content/registry';
import { getTypeDef } from '@/lib/qr/catalog';
import { localePath, type Locale } from '@/i18n/locales';
import { pageMeta } from '@/lib/seo/meta';
import { MaskIcon } from '@/components/ui/mask-icon';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs, FaqSection, MarketingShell } from '@/views/marketing-shell';
import { GeneratorSection } from '@/views/generator-section';

export function typePageParams() {
  return TYPE_KEYS.map((key) => ({ type: TYPE_SLUGS[key] }));
}

export function typePageMeta(locale: Locale, slug: string): Metadata {
  const key = typeKeyFromSlug(slug);
  if (!key) return {};
  const copy = getContent(locale).types[key];
  return pageMeta({
    path: `/qr-code-generator/${slug}`,
    title: copy.title,
    description: copy.description,
    locale,
    languages: PUBLISHED_LOCALES,
  });
}

/** /qr-code-generator/<slug>: one QR type, explained, with the generator open on it. */
export async function TypePage({ locale, slug }: { locale: Locale; slug: string }) {
  const key = typeKeyFromSlug(slug);
  const def = key ? getTypeDef(key) : undefined;
  if (!key || !def) notFound();
  const content = getContent(locale);
  const { ui } = content;
  const copy = content.types[key];
  const path = `/qr-code-generator/${slug}`;
  const isDynamic = def.kind === 'DYNAMIC';

  return (
    <MarketingShell locale={locale} path={path}>
      <section className="qa-glow relative overflow-hidden">
        <div className="container relative z-10 pb-8 pt-8 sm:pt-12">
          <Breadcrumbs
            locale={locale}
            home={ui.common.home}
            trail={[
              { name: ui.typePage.breadcrumb, path: '/qr-code-generator' },
              { name: copy.h1, path },
            ]}
          />
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant={isDynamic ? 'primary' : 'outline'}>{isDynamic ? ui.common.dynamic : ui.common.static}</Badge>
              <Badge variant="success">{ui.common.free}</Badge>
            </div>
            <h1 className="flex items-center gap-3 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[42px]">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground sm:size-12">
                <MaskIcon name={def.icon} className="size-5 sm:size-6" />
              </span>
              {copy.h1}
            </h1>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-7 text-muted-foreground">{copy.intro}</p>
            <p className="mt-3 text-[13px] text-muted-foreground">{isDynamic ? ui.common.dynamicNote : ui.common.staticNote}</p>
          </div>
        </div>
        <div className="container relative z-10 pb-12">
          <GeneratorSection initialType={key} locale={locale} />
        </div>
      </section>

      <div className="cv-auto container grid grid-cols-1 gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-12">
          <section>
            <h2 className="mb-4 font-display text-[22px] font-bold tracking-[-0.02em] sm:text-[26px]">{ui.typePage.usesHeading}</h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {copy.uses.map((use) => (
                <li key={use} className="rounded-2xl border border-border bg-card p-4 text-[14px] leading-6">
                  {use}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[22px] font-bold tracking-[-0.02em] sm:text-[26px]">{ui.typePage.stepsHeading}</h2>
            <ol className="space-y-3">
              {copy.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-[14.5px] leading-7">
                  <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[13px] font-semibold text-primary-soft-foreground">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[22px] font-bold tracking-[-0.02em] sm:text-[26px]">{ui.typePage.tipsHeading}</h2>
            <ul className="space-y-2.5">
              {copy.tips.map((tip) => (
                <li key={tip} className="flex gap-2.5 text-[14.5px] leading-7 text-muted-foreground">
                  <MaskIcon name="Sparkles" className="mt-1.5 size-4 text-primary" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          <FaqSection heading={ui.common.faqHeading} faqs={copy.faqs} />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-[15px] font-semibold">{ui.typePage.whyHeading}</h2>
            <ul className="space-y-2">
              {ui.typePage.why.map((line) => (
                <li key={line} className="flex gap-2 text-[13.5px] leading-6 text-muted-foreground">
                  <MaskIcon name="ShieldCheck" className="mt-1 size-3.5 text-success-text" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-[15px] font-semibold">{ui.common.related}</h2>
            <ul className="space-y-1">
              {RELATED_TYPES[key].map((related) => {
                const relatedDef = getTypeDef(related);
                return (
                  <li key={related}>
                    <Link
                      href={localePath(locale, `/qr-code-generator/${TYPE_SLUGS[related]}`)}
                      className="flex min-h-10 items-center gap-2.5 rounded-lg px-2 text-[13.5px] transition-colors hover:bg-surface-muted"
                    >
                      <MaskIcon name={relatedDef?.icon ?? 'QrCode'} className="size-4 text-muted-foreground" />
                      {content.types[related].h1}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </MarketingShell>
  );
}
