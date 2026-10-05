import Link from 'next/link';
import { getAuthContext } from '@/lib/auth';
import { getContent, PUBLISHED_LOCALES } from '@/content';
import { localeInfo, localePath, type Locale } from '@/i18n/locales';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbSchema, graph } from '@/lib/seo/schema';
import { env } from '@/lib/env';
import type { Faq } from '@/content/schema';

/** Header + footer for a translated marketing page, with the language switcher wired to `path`. */
export async function MarketingShell({
  locale,
  path,
  children,
}: {
  locale: Locale;
  /** Language-neutral path of this page, e.g. "/qr-code-generator/wifi". */
  path: string;
  children: React.ReactNode;
}) {
  const auth = await getAuthContext().catch(() => null);
  const { ui } = getContent(locale);
  const languages = PUBLISHED_LOCALES.map((code) => ({
    code,
    native: localeInfo(code).native,
    href: localePath(code, path),
    current: code === locale,
  }));
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader signedIn={Boolean(auth)} nav={ui.nav} home={localePath(locale, '/')} languages={languages} />
      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale} path={path} />
    </div>
  );
}

export interface Crumb {
  name: string;
  path: string;
}

/** Visible breadcrumb trail plus its BreadcrumbList structured data. */
export function Breadcrumbs({ locale, home, trail }: { locale: Locale; home: string; trail: Crumb[] }) {
  const base = env.appUrl.replace(/\/+$/, '');
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-5 text-[12.5px] text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href={localePath(locale, '/')} className="-my-2.5 inline-block py-2.5 hover:text-foreground">
              {home}
            </Link>
          </li>
          {trail.map((crumb, index) => (
            <li key={crumb.path} className="flex items-center gap-1.5">
              <span aria-hidden>/</span>
              {index === trail.length - 1 ? (
                <span aria-current="page" className="text-foreground">
                  {crumb.name}
                </span>
              ) : (
                <Link href={localePath(locale, crumb.path)} className="-my-2.5 inline-block py-2.5 hover:text-foreground">
                  {crumb.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={graph(
          breadcrumbSchema(
            base,
            trail.map((crumb) => ({ name: crumb.name, path: localePath(locale, crumb.path) })),
            home,
            localePath(locale, '/'),
          ),
        )}
      />
    </>
  );
}

/** FAQ list as native <details> (answers in the HTML), with FAQPage structured data. */
export function FaqSection({ heading, faqs, id = 'faq' }: { heading: string; faqs: Faq[]; id?: string }) {
  if (faqs.length === 0) return null;
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 font-display text-[22px] font-bold tracking-[-0.02em] sm:text-[26px]">{heading}</h2>
      <div className="divide-y divide-border border-y border-border">
        {faqs.map((faq, index) => (
          <details key={faq.q} className="group" open={index === 0}>
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-4 text-start text-[15px] font-medium transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
              <h3 className="font-medium">{faq.q}</h3>
              <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-180">
                ⌄
              </span>
            </summary>
            <p className="pb-5 pe-8 text-[14px] leading-7 text-muted-foreground">{faq.a}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={graph({
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
        })}
      />
    </section>
  );
}
