import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContent } from '@/content';
import { TYPE_SLUGS } from '@/content/registry';
import type { SeoDoc, SeoKind, SeoSection } from '@/content/seo/types';
import { MIN_AD_WORDS, SEO_CATS, SEO_UPDATED, SEO_KINDS, docWords, findSeoDoc, relatedDocs, seoDocs, seoPath } from '@/content/seo';
import { pageMeta } from '@/lib/seo/meta';
import { env } from '@/lib/env';
import { JsonLd } from '@/components/seo/json-ld';
import { graph } from '@/lib/seo/schema';
import { Button } from '@/components/ui/button';
import { Ad } from '@/components/ads/ads';
import { Breadcrumbs, FaqSection, MarketingShell } from '@/views/marketing-shell';
import { GeneratorSection } from '@/views/generator-section';
import { PageIntro, TypeLinkCard } from '@/views/content-pages';
import { seoGate } from '@/lib/seo/gate';

// ------------------------------------------------------------------ rich text

const LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

/** Paragraph text with [words](/path) internal links. */
function Rich({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    parts.push(
      <Link key={index} href={match[2]} className="font-medium text-primary underline-offset-4 hover:underline">
        {match[1]}
      </Link>,
    );
    last = index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/** Plain text (links reduced to their words) for meta tags, schema and llms.txt. */
export function plain(text: string): string {
  return text.replace(LINK, '$1');
}

function Section({ section }: { section: SeoSection }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-[21px] font-bold tracking-[-0.02em] sm:text-[24px]">{section.h}</h2>
      <div className="space-y-3 text-[15px] leading-7 text-muted-foreground">
        {section.p?.map((paragraph) => (
          <p key={paragraph}>
            <Rich text={paragraph} />
          </p>
        ))}
        {section.list && (
          <ul className="list-disc space-y-1.5 ps-5 marker:text-primary">
            {section.list.map((item) => (
              <li key={item}>
                <Rich text={item} />
              </li>
            ))}
          </ul>
        )}
        {section.steps && (
          <ol className="list-decimal space-y-1.5 ps-5 marker:font-semibold marker:text-foreground">
            {section.steps.map((item) => (
              <li key={item}>
                <Rich text={item} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function QuickAnswer({ text }: { text: string }) {
  return (
    <div className="quick-answer mt-6 max-w-3xl rounded-2xl border border-primary/25 bg-primary-soft/40 p-5">
      <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-primary">Quick answer</p>
      <p className="text-[15.5px] leading-7 text-foreground">
        <Rich text={text} />
      </p>
    </div>
  );
}

function DocLink({ doc }: { doc: SeoDoc & { kind: SeoKind } }) {
  return (
    <Link
      href={seoPath(doc.kind, doc.slug)}
      className="flex min-h-11 items-center rounded-xl border border-border bg-card px-4 py-2.5 text-[14px] font-medium transition-colors hover:border-primary/40 hover:text-primary"
    >
      {doc.name}
    </Link>
  );
}

// ------------------------------------------------------------------ doc page

export async function seoDocMeta(kind: SeoKind, slug: string): Promise<Metadata> {
  const doc = findSeoDoc(kind, slug, await seoGate());
  if (!doc) return {};
  return { ...pageMeta({ path: seoPath(kind, slug), title: doc.title, description: doc.description }), openGraph: { type: 'article', siteName: 'QR ALTRIX', url: seoPath(kind, slug), title: `${doc.title} · QR ALTRIX`, description: doc.description, locale: 'en_US' } };
}

export async function SeoDocPage({ kind, slug }: { kind: SeoKind; slug: string }) {
  const gate = await seoGate();
  const doc = findSeoDoc(kind, slug, gate);
  if (!doc) notFound();
  const { ui } = getContent('en');
  const path = seoPath(kind, slug);
  const base = env.appUrl.replace(/\/+$/, '');
  const related = relatedDocs(kind, doc, gate);
  const mid = Math.min(2, doc.sections.length - 1);
  const ads = docWords(doc) >= MIN_AD_WORDS;
  const article = {
    '@type': 'Article',
    '@id': `${base}${path}#article`,
    headline: doc.h1,
    description: doc.description,
    abstract: plain(doc.answer),
    inLanguage: 'en',
    datePublished: SEO_UPDATED,
    dateModified: SEO_UPDATED,
    mainEntityOfPage: `${base}${path}`,
    image: `${base}/opengraph-image`,
    author: { '@id': `${base}/#organization` },
    publisher: { '@id': `${base}/#organization` },
    isPartOf: { '@id': `${base}/#website` },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.quick-answer'] },
  };

  return (
    <MarketingShell locale="en" path={path}>
      <article className="container py-10 sm:py-14">
        <Breadcrumbs
          locale="en"
          home={ui.common.home}
          trail={[
            { name: SEO_KINDS[kind].name, path: SEO_KINDS[kind].path },
            { name: doc.name, path },
          ]}
        />
        <div className="max-w-3xl">
          <h1 className="font-display text-[30px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[42px]">{doc.h1}</h1>
          <p className="mt-3 text-[12.5px] text-muted-foreground">
            Updated <time dateTime={SEO_UPDATED}>{new Date(`${SEO_UPDATED}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time> · By{' '}
            <Link href="/about#how-we-write" className="font-medium text-foreground underline-offset-4 hover:underline">
              QR ALTRIX
            </Link>
          </p>
        </div>
        <QuickAnswer text={doc.answer} />

        {kind === 'for' && doc.type && (
          <div className="mt-8">
            <GeneratorSection initialType={doc.type} locale="en" />
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 max-w-[68ch] space-y-10">
            {ads && <Ad position="top" />}
            {doc.sections.map((section, index) => (
              <div key={section.h} className="space-y-10">
                <Section section={section} />
                {ads && index === mid && doc.sections.length > 3 && <Ad position="mid" />}
              </div>
            ))}
            <FaqSection heading={ui.common.faqHeading} faqs={doc.faqs.map((f) => ({ q: f.q, a: plain(f.a) }))} />
            {ads && <Ad position="end" />}
            {related.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-[20px] font-bold tracking-[-0.02em]">Related</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {related.map((item) => (
                    <DocLink key={`${item.kind}-${item.slug}`} doc={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Button asChild variant="brand" size="lg" className="w-full">
              <Link href={doc.type ? `/qr-code-generator/${TYPE_SLUGS[doc.type]}` : '/#generator'}>{ui.common.createFree}</Link>
            </Button>
            {doc.type && <TypeLinkCard locale="en" typeKey={doc.type} />}
            <nav aria-label="Sections" className="hidden lg:block">
              <h2 className="pb-2 pt-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">On this page</h2>
              <ul className="space-y-1 text-[13.5px]">
                {doc.sections.map((s) => (
                  <li key={s.h} className="leading-5 text-muted-foreground">
                    {s.h}
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </article>
      <JsonLd data={graph(article)} />
    </MarketingShell>
  );
}

// ------------------------------------------------------------------ hubs

export function seoHubMeta(kind: SeoKind): Metadata {
  const k = SEO_KINDS[kind];
  return pageMeta({ path: k.path, title: k.title, description: k.description });
}

/** Grouped list of every doc of one kind. */
export async function SeoDocGroups({ kind }: { kind: SeoKind }) {
  const docs = seoDocs(kind, await seoGate());
  const cats = [...new Set(docs.map((d) => d.cat))];
  return (
    <div className="space-y-10">
      {cats.map((cat) => (
        <section key={cat}>
          <h2 className="mb-4 font-display text-[20px] font-bold tracking-[-0.02em] sm:text-[22px]">{SEO_CATS[cat] ?? cat}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {docs
              .filter((d) => d.cat === cat)
              .map((d) => (
                <DocLink key={d.slug} doc={{ ...d, kind }} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function SeoHub({ kind }: { kind: SeoKind }) {
  const { ui } = getContent('en');
  const k = SEO_KINDS[kind];
  return (
    <MarketingShell locale="en" path={k.path}>
      <div className="container py-10 sm:py-14">
        <Breadcrumbs locale="en" home={ui.common.home} trail={[{ name: k.name, path: k.path }]} />
        <PageIntro h1={k.h1} intro={k.intro} />
        <div className="mt-10">
          <SeoDocGroups kind={kind} />
        </div>
      </div>
    </MarketingShell>
  );
}
