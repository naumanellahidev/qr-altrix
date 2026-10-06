import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContent, PUBLISHED_LOCALES } from '@/content';
import { GUIDES, TYPE_KEYS, TYPE_SLUGS, USE_CASES } from '@/content/registry';
import type { GuideSlug, TypeKey, UseCaseSlug } from '@/content/schema';
import { getTypeDef } from '@/lib/qr/catalog';
import { localePath, type Locale } from '@/i18n/locales';
import { pageMeta } from '@/lib/seo/meta';
import { MaskIcon } from '@/components/ui/mask-icon';
import { Button } from '@/components/ui/button';
import { Breadcrumbs, FaqSection, MarketingShell } from '@/views/marketing-shell';
import { QrScanner } from '@/components/marketing/qr-scanner';
import { isDeveloperApiEnabled } from '@/lib/settings';

function meta(locale: Locale, path: string, title: string, description: string): Metadata {
  return pageMeta({ path, title, description, locale, languages: PUBLISHED_LOCALES });
}

function firstSentence(text: string): string {
  const match = text.match(/^.+?[.!?。！？](\s|$)/);
  return (match ? match[0] : text).trim();
}

function PageIntro({ h1, intro }: { h1: string; intro: string }) {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-[30px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[42px]">{h1}</h1>
      <p className="mt-4 text-[15.5px] leading-7 text-muted-foreground">{intro}</p>
    </div>
  );
}

function TypeLinkCard({ locale, typeKey }: { locale: Locale; typeKey: TypeKey }) {
  const def = getTypeDef(typeKey);
  const copy = getContent(locale).types[typeKey];
  return (
    <Link
      href={localePath(locale, `/qr-code-generator/${TYPE_SLUGS[typeKey]}`)}
      className="group flex gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-primary transition-colors group-hover:bg-primary-soft">
        <MaskIcon name={def?.icon ?? 'QrCode'} className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold">{copy.h1}</span>
        <span className="mt-0.5 block text-[12.5px] leading-5 text-muted-foreground">{firstSentence(copy.intro)}</span>
      </span>
    </Link>
  );
}

// ------------------------------------------------------------------ types hub

export function typesHubMeta(locale: Locale): Metadata {
  const { hubs } = getContent(locale).ui;
  return meta(locale, '/qr-code-generator', hubs.typesTitle, hubs.typesDescription);
}

export function TypesHub({ locale }: { locale: Locale }) {
  const { ui } = getContent(locale);
  const groups: { title: string; keys: TypeKey[] }[] = [
    { title: ui.hubs.staticGroup, keys: TYPE_KEYS.filter((key) => getTypeDef(key)?.kind === 'STATIC') },
    { title: ui.hubs.dynamicGroup, keys: TYPE_KEYS.filter((key) => getTypeDef(key)?.kind === 'DYNAMIC') },
  ];
  return (
    <MarketingShell locale={locale} path="/qr-code-generator">
      <div className="container py-10 sm:py-14">
        <Breadcrumbs locale={locale} home={ui.common.home} trail={[{ name: ui.typePage.breadcrumb, path: '/qr-code-generator' }]} />
        <PageIntro h1={ui.hubs.typesH1} intro={ui.hubs.typesIntro} />
        <div className="mt-10 space-y-10">
          {groups.map((group) => (
            <section key={group.title}>
              <h2 className="mb-4 font-display text-[22px] font-bold tracking-[-0.02em]">{group.title}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.keys.map((key) => (
                  <TypeLinkCard key={key} locale={locale} typeKey={key} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}

// ------------------------------------------------------------------ use cases

export function useCasesHubMeta(locale: Locale): Metadata {
  const { hubs } = getContent(locale).ui;
  return meta(locale, '/use-cases', hubs.useCasesTitle, hubs.useCasesDescription);
}

export function UseCasesHub({ locale }: { locale: Locale }) {
  const content = getContent(locale);
  const { ui } = content;
  return (
    <MarketingShell locale={locale} path="/use-cases">
      <div className="container py-10 sm:py-14">
        <Breadcrumbs locale={locale} home={ui.common.home} trail={[{ name: ui.nav.useCases, path: '/use-cases' }]} />
        <PageIntro h1={ui.hubs.useCasesH1} intro={ui.hubs.useCasesIntro} />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((useCase) => {
            const copy = content.useCases[useCase.slug];
            return (
              <Link
                key={useCase.slug}
                href={localePath(locale, `/use-cases/${useCase.slug}`)}
                className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <span className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-surface-muted text-primary transition-colors group-hover:bg-primary-soft">
                  <MaskIcon name={useCase.icon} className="size-[18px]" />
                </span>
                <h2 className="text-[15px] font-semibold">{copy.name}</h2>
                <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{firstSentence(copy.intro)}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </MarketingShell>
  );
}

export function useCasePageMeta(locale: Locale, slug: string): Metadata {
  const entry = USE_CASES.find((useCase) => useCase.slug === slug);
  if (!entry) return {};
  const copy = getContent(locale).useCases[entry.slug];
  return meta(locale, `/use-cases/${slug}`, copy.title, copy.description);
}

export function UseCasePage({ locale, slug }: { locale: Locale; slug: string }) {
  const entry = USE_CASES.find((useCase) => useCase.slug === slug);
  if (!entry) notFound();
  const content = getContent(locale);
  const { ui } = content;
  const copy = content.useCases[entry.slug as UseCaseSlug];
  const path = `/use-cases/${slug}`;
  return (
    <MarketingShell locale={locale} path={path}>
      <div className="container py-10 sm:py-14">
        <Breadcrumbs
          locale={locale}
          home={ui.common.home}
          trail={[
            { name: ui.nav.useCases, path: '/use-cases' },
            { name: copy.name, path },
          ]}
        />
        <PageIntro h1={copy.h1} intro={copy.intro} />

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-12">
            <section>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {copy.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-2.5 rounded-2xl border border-border bg-card p-4 text-[14px] leading-6">
                    <MaskIcon name="ShieldCheck" className="mt-1 size-4 text-success-text" />
                    <span>{benefit}</span>
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
            <FaqSection heading={ui.common.faqHeading} faqs={copy.faqs} />
          </div>
          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-[15px] font-semibold">{ui.hubs.recommended}</h2>
            {entry.types.map((key) => (
              <TypeLinkCard key={key} locale={locale} typeKey={key} />
            ))}
          </aside>
        </div>
      </div>
    </MarketingShell>
  );
}

// ------------------------------------------------------------------ guides

export function guidesHubMeta(locale: Locale): Metadata {
  const { hubs } = getContent(locale).ui;
  return meta(locale, '/guides', hubs.guidesTitle, hubs.guidesDescription);
}

export function GuidesHub({ locale }: { locale: Locale }) {
  const content = getContent(locale);
  const { ui } = content;
  return (
    <MarketingShell locale={locale} path="/guides">
      <div className="container py-10 sm:py-14">
        <Breadcrumbs locale={locale} home={ui.common.home} trail={[{ name: ui.nav.guides, path: '/guides' }]} />
        <PageIntro h1={ui.hubs.guidesH1} intro={ui.hubs.guidesIntro} />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {GUIDES.map((guide) => {
            const copy = content.guides[guide.slug];
            return (
              <Link
                key={guide.slug}
                href={localePath(locale, `/guides/${guide.slug}`)}
                className="group flex gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-primary transition-colors group-hover:bg-primary-soft">
                  <MaskIcon name={guide.icon} className="size-[18px]" />
                </span>
                <span className="min-w-0">
                  <h2 className="text-[15px] font-semibold">{copy.h1}</h2>
                  <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{firstSentence(copy.intro)}</p>
                  <span className="mt-2 inline-block text-[13px] font-medium text-primary-soft-foreground">{ui.common.readGuide} →</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </MarketingShell>
  );
}

export function guidePageMeta(locale: Locale, slug: string): Metadata {
  const entry = GUIDES.find((guide) => guide.slug === slug);
  if (!entry) return {};
  const copy = getContent(locale).guides[entry.slug];
  return meta(locale, `/guides/${slug}`, copy.title, copy.description);
}

export function GuidePage({ locale, slug }: { locale: Locale; slug: string }) {
  const entry = GUIDES.find((guide) => guide.slug === slug);
  if (!entry) notFound();
  const content = getContent(locale);
  const { ui } = content;
  const copy = content.guides[entry.slug as GuideSlug];
  const path = `/guides/${slug}`;
  const others = GUIDES.filter((guide) => guide.slug !== entry.slug);
  return (
    <MarketingShell locale={locale} path={path}>
      <article className="container py-10 sm:py-14">
        <Breadcrumbs
          locale={locale}
          home={ui.common.home}
          trail={[
            { name: ui.nav.guides, path: '/guides' },
            { name: copy.name, path },
          ]}
        />
        <PageIntro h1={copy.h1} intro={copy.intro} />
        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 max-w-[68ch] space-y-10">
            {copy.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-3 font-display text-[21px] font-bold tracking-[-0.02em] sm:text-[24px]">{section.heading}</h2>
                <div className="space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-[15px] leading-7 text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
            <FaqSection heading={ui.common.faqHeading} faqs={copy.faqs} />
          </div>
          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            <Button asChild variant="brand" size="lg" className="w-full">
              <Link href={`${localePath(locale, '/')}#generator`}>{ui.common.createFree}</Link>
            </Button>
            <h2 className="pt-3 text-[15px] font-semibold">{ui.nav.guides}</h2>
            <ul className="space-y-1">
              {others.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={localePath(locale, `/guides/${guide.slug}`)}
                    className="flex min-h-10 items-center gap-2.5 rounded-lg px-2 text-[13.5px] transition-colors hover:bg-surface-muted"
                  >
                    <MaskIcon name={guide.icon} className="size-4 text-muted-foreground" />
                    {content.guides[guide.slug].name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </article>
    </MarketingShell>
  );
}

// ------------------------------------------------------------------ compare

export function comparePageMeta(locale: Locale): Metadata {
  const { compare } = getContent(locale);
  return meta(locale, '/best-free-qr-code-generator', compare.title, compare.description);
}

/** Index of the "Bulk generation and API" row in CompareCopy.table, in every language. */
const BULK_API_ROW = 6;

export async function ComparePage({ locale }: { locale: Locale }) {
  const content = getContent(locale);
  const { ui } = content;
  // Without the developer API there is no API to promise: use the copy that leaves it out.
  const compare = (await isDeveloperApiEnabled())
    ? content.compare
    : {
        ...content.compare,
        checklist: content.compare.checklist.map((item, index, all) =>
          index === all.length - 1 ? { ...item, why: content.compare.noApi.lockInWhy } : item,
        ),
        table: content.compare.table.map((row, index) =>
          index === BULK_API_ROW ? { ...row, feature: content.compare.noApi.bulkFeature } : row,
        ),
      };
  const path = '/best-free-qr-code-generator';
  return (
    <MarketingShell locale={locale} path={path}>
      <article className="container py-10 sm:py-14">
        <Breadcrumbs locale={locale} home={ui.common.home} trail={[{ name: ui.footer.compare, path }]} />
        <PageIntro h1={compare.h1} intro={compare.intro} />

        <section className="mt-10">
          <h2 className="mb-4 font-display text-[22px] font-bold tracking-[-0.02em] sm:text-[26px]">{compare.checklistHeading}</h2>
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {compare.checklist.map((item, index) => (
              <li key={item.point} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[13px] font-semibold text-primary-soft-foreground">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-[14.5px] font-semibold">{item.point}</span>
                  <span className="mt-0.5 block text-[13px] leading-6 text-muted-foreground">{item.why}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 font-display text-[22px] font-bold tracking-[-0.02em] sm:text-[26px]">{compare.tableHeading}</h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[560px] border-collapse text-start text-[14px]">
              <thead className="bg-surface-muted">
                <tr>
                  {compare.tableColumns.map((column) => (
                    <th key={column} scope="col" className="px-4 py-3 text-start text-[12.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {compare.table.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row" className="px-4 py-3 text-start font-medium">
                      {row.feature}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">{row.typical}</td>
                    <td className="px-4 py-3 font-semibold text-success-text">{row.ours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 max-w-[68ch]">
          <h2 className="mb-3 font-display text-[22px] font-bold tracking-[-0.02em] sm:text-[26px]">{compare.verdictHeading}</h2>
          <div className="space-y-3">
            {compare.verdict.map((paragraph) => (
              <p key={paragraph} className="text-[15px] leading-7 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
          <Button asChild variant="brand" size="lg" className="mt-6">
            <Link href={`${localePath(locale, '/')}#generator`}>{ui.common.createFree}</Link>
          </Button>
        </section>

        <div className="mt-12 max-w-[68ch]">
          <FaqSection heading={ui.common.faqHeading} faqs={compare.faqs} />
        </div>
      </article>
    </MarketingShell>
  );
}

// ------------------------------------------------------------------ bulk tool

export function bulkPageMeta(locale: Locale): Metadata {
  const { bulk } = getContent(locale).tools;
  return meta(locale, '/tools/bulk-qr-code-generator', bulk.title, bulk.description);
}

export async function BulkToolPage({ locale }: { locale: Locale }) {
  const content = getContent(locale);
  const { ui } = content;
  const bulk = content.tools.bulk;
  // The last feature line is "Also available through the REST API" in every language.
  const features = (await isDeveloperApiEnabled()) ? bulk.features : bulk.features.slice(0, -1);
  const path = '/tools/bulk-qr-code-generator';
  return (
    <MarketingShell locale={locale} path={path}>
      <div className="container py-10 sm:py-14">
        <Breadcrumbs locale={locale} home={ui.common.home} trail={[{ name: ui.footer.bulk, path }]} />
        <PageIntro h1={bulk.h1} intro={bulk.intro} />
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="brand" size="lg">
            <Link href="/dashboard/bulk">{bulk.cta}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="/api/v1/bulk/template">{bulk.template}</a>
          </Button>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 font-display text-[22px] font-bold tracking-[-0.02em] sm:text-[26px]">{ui.typePage.stepsHeading}</h2>
            <ol className="space-y-3">
              {bulk.steps.map((step, index) => (
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
            <h2 className="mb-4 font-display text-[22px] font-bold tracking-[-0.02em] sm:text-[26px]">{ui.typePage.whyHeading}</h2>
            <ul className="space-y-2.5">
              {features.map((feature) => (
                <li key={feature} className="flex gap-2.5 text-[14.5px] leading-7 text-muted-foreground">
                  <MaskIcon name="ShieldCheck" className="mt-1.5 size-4 text-success-text" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="mt-12 max-w-[68ch]">
          <FaqSection heading={ui.common.faqHeading} faqs={bulk.faqs} />
        </div>
      </div>
    </MarketingShell>
  );
}

// ------------------------------------------------------------------ scanner tool

export function scannerPageMeta(locale: Locale): Metadata {
  const { scanner } = getContent(locale).tools;
  return meta(locale, '/tools/qr-code-scanner', scanner.title, scanner.description);
}

export function ScannerPage({ locale }: { locale: Locale }) {
  const content = getContent(locale);
  const { ui } = content;
  const scanner = content.tools.scanner;
  const path = '/tools/qr-code-scanner';
  return (
    <MarketingShell locale={locale} path={path}>
      <div className="container py-10 sm:py-14">
        <Breadcrumbs locale={locale} home={ui.common.home} trail={[{ name: ui.footer.scanner, path }]} />
        <PageIntro h1={scanner.h1} intro={scanner.intro} />
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <QrScanner
              copy={{
                drop: scanner.drop,
                choose: scanner.choose,
                reading: scanner.reading,
                found: scanner.found,
                notFound: scanner.notFound,
                openLink: scanner.openLink,
                copy: scanner.copy,
                copied: scanner.copied,
              }}
            />
            <p className="mt-4 flex gap-2 text-[13px] text-muted-foreground">
              <MaskIcon name="Lock" className="mt-0.5 size-4 text-success-text" />
              {scanner.privacy}
            </p>
          </div>
          <aside className="space-y-3">
            <Button asChild variant="brand" size="lg" className="w-full">
              <Link href={`${localePath(locale, '/')}#generator`}>{ui.common.createFree}</Link>
            </Button>
          </aside>
        </div>
        <div className="mt-12 max-w-[68ch]">
          <FaqSection heading={ui.common.faqHeading} faqs={scanner.faqs} />
        </div>
      </div>
    </MarketingShell>
  );
}
