import Link from 'next/link';
import { MaskIcon } from '@/components/ui/mask-icon';
import { BrandLogo } from '@/components/brand';
import { getSettings } from '@/lib/settings';
import { getContent, PUBLISHED_LOCALES } from '@/content';
import { DEFAULT_LOCALE, localeInfo, localePath, type Locale } from '@/i18n/locales';

/**
 * Site footer, in the page's language. Links to translated pages keep the language
 * prefix; English-only pages (developers, legal, dashboard) link without it. The
 * language list links to the same page in every published language.
 */
export async function SiteFooter({ locale = DEFAULT_LOCALE, path = '/' }: { locale?: Locale; path?: string }) {
  // Read the live policy so the footer never advertises something this install has
  // switched off. Settings are cached, so this costs nothing.
  const settings = await getSettings().catch(() => null);
  const expiryEnabled = Boolean(settings?.expiryEnabled);
  const developerApiEnabled = Boolean(settings?.developerApiEnabled);
  const { ui } = getContent(locale);
  const f = ui.footer;
  const lp = (href: string) => localePath(locale, href);

  const columns: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: f.product,
      links: [
        { href: `${lp('/')}#generator`, label: f.createQr },
        { href: lp('/qr-code-generator'), label: f.allTypes },
        { href: lp('/use-cases'), label: ui.nav.useCases },
        { href: lp('/tools/bulk-qr-code-generator'), label: f.bulk },
        { href: lp('/tools/qr-code-scanner'), label: f.scanner },
      ],
    },
    {
      title: f.resources,
      links: [
        { href: lp('/guides'), label: ui.nav.guides },
        { href: lp('/best-free-qr-code-generator'), label: f.compare },
        { href: `${lp('/')}#faq`, label: ui.nav.faq },
        ...(developerApiEnabled ? [{ href: '/developers', label: f.developers }] : []),
        { href: '/support', label: f.support },
      ],
    },
    {
      title: f.trust,
      links: [
        { href: '/legal/terms', label: f.terms },
        { href: '/legal/privacy', label: f.privacy },
        { href: '/report-abuse', label: f.report },
      ],
    },
  ];

  return (
    <footer className="cv-auto border-t border-border bg-surface">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-3">
            <BrandLogo href={lp('/')} />
            <p className="max-w-xs text-[13px] leading-6 text-muted-foreground">{f.tagline}</p>
            {expiryEnabled ? (
              <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
                <MaskIcon name="CalendarClock" className="size-3.5" />
                {f.expiryShown}
              </p>
            ) : (
              <p className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-[12px] font-medium text-success-text">
                <MaskIcon name="Infinity" className="size-3.5" />
                {f.neverExpire}
              </p>
            )}
          </div>

          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-block py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {PUBLISHED_LOCALES.length > 1 ? (
          <nav aria-label={ui.nav.language} className="mt-10 border-t border-border pt-6">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
              {PUBLISHED_LOCALES.map((code) => (
                <li key={code}>
                  <Link
                    href={localePath(code, path)}
                    hrefLang={code}
                    lang={code}
                    aria-current={code === locale ? 'page' : undefined}
                    className={
                      code === locale
                        ? 'inline-block py-2 font-semibold text-foreground'
                        : 'inline-block py-2 text-muted-foreground transition-colors hover:text-foreground'
                    }
                  >
                    {localeInfo(code).native}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div className="mt-6 border-t border-border pt-6 text-[12.5px] text-muted-foreground">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-start">
            <p>
              © {new Date().getFullYear()} QR ALTRIX. {f.copyright}
            </p>

            {/* Designer and developer credit */}
            <a
              href="https://naumanellahi.com"
              target="_blank"
              rel="noopener"
              className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/25 bg-gradient-to-r from-primary/[0.07] to-accent/[0.07] py-1.5 pe-1.5 ps-4 shadow-soft transition-all hover:-translate-y-px hover:border-primary/45 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="text-[11.5px] text-muted-foreground">{f.credit}</span>
              <span className="text-gradient text-[12.5px] font-bold tracking-[0.08em]" dir="ltr">
                NAUMAN ELLAHI
              </span>
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white transition-transform group-hover:rotate-12">
                <MaskIcon name="ArrowUpRight" className="size-3.5" />
              </span>
              <span className="sr-only">(naumanellahi.com)</span>
            </a>
          </div>
          <p className="mt-4 text-center text-[11.5px] leading-5 text-muted-foreground sm:text-start">{f.trademark}</p>
        </div>
      </div>
    </footer>
  );
}
