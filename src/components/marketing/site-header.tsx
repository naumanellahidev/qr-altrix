'use client';

import * as React from 'react';
import Link from 'next/link';
import { Globe, LayoutDashboard, Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '@/components/theme-switch';
import { cn } from '@/lib/utils';
import type { UiCopy } from '@/content/schema';

/** English navigation labels: the default for pages that are not translated. */
const EN_NAV: UiCopy['nav'] = {
  features: 'Features',
  types: 'QR types',
  useCases: 'Use cases',
  guides: 'Guides',
  faq: 'FAQ',
  api: 'API',
  login: 'Log in',
  startFree: 'Start free',
  dashboard: 'Dashboard',
  menu: 'Open menu',
  closeMenu: 'Close menu',
  language: 'Language',
};

export interface LanguageLink {
  code: string;
  native: string;
  href: string;
  current: boolean;
}

export function SiteHeader({
  signedIn,
  nav = EN_NAV,
  home = '/',
  languages = [],
}: {
  signedIn: boolean;
  /** Labels in the page's language. */
  nav?: UiCopy['nav'];
  /** Home path in the page's language ("/" or "/es"). */
  home?: string;
  /** The current page in every published language, for the switcher. */
  languages?: LanguageLink[];
}) {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const prefix = home === '/' ? '' : home;
  const links = [
    { href: `${prefix}/qr-code-generator`, label: nav.types },
    { href: `${prefix}/use-cases`, label: nav.useCases },
    { href: `${prefix}/guides`, label: nav.guides },
    { href: `${home}#faq`, label: nav.faq },
    { href: '/developers', label: nav.api },
  ];
  const current = languages.find((language) => language.current);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b transition-colors duration-200',
        scrolled
          ? 'border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-7">
          <BrandLogo href={home} />
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          {languages.length > 1 ? <LanguageMenu label={nav.language} current={current} languages={languages} /> : null}
          <ThemeSwitch className="hidden sm:inline-flex" />
          {signedIn ? (
            <Button asChild size="sm" variant="brand">
              <Link href="/dashboard">
                <LayoutDashboard /> {nav.dashboard}
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">{nav.login}</Link>
              </Button>
              <Button asChild size="sm" variant="brand">
                <Link href="/signup">{nav.startFree}</Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? nav.closeMenu : nav.menu}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container flex flex-col py-2" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-1 py-2.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {!signedIn ? (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-1 py-2.5 text-[14px] font-medium text-muted-foreground"
              >
                {nav.login}
              </Link>
            ) : null}
            <div className="py-2">
              <ThemeSwitch />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

/**
 * Language picker as native <details>: no positioning library, works before hydration,
 * and every option is a real link crawlers can follow.
 */
function LanguageMenu({ label, current, languages }: { label: string; current?: LanguageLink; languages: LanguageLink[] }) {
  const ref = React.useRef<HTMLDetailsElement>(null);

  React.useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current?.open && !ref.current.contains(event.target as Node)) ref.current.open = false;
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  return (
    <details ref={ref} className="group relative">
      <summary
        className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground [&::-webkit-details-marker]:hidden"
        aria-label={label}
      >
        <Globe className="size-4" aria-hidden />
        <span className="hidden sm:inline">{current?.native}</span>
        <span className="sm:hidden" aria-hidden>
          {current?.code.toUpperCase()}
        </span>
      </summary>
      <ul className="absolute end-0 top-11 z-50 grid max-h-[70vh] w-56 grid-cols-1 gap-0.5 overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-lifted">
        {languages.map((language) => (
          <li key={language.code}>
            <Link
              href={language.href}
              hrefLang={language.code}
              lang={language.code}
              aria-current={language.current ? 'page' : undefined}
              className={cn(
                'flex min-h-10 items-center justify-between rounded-lg px-3 text-[13.5px] transition-colors hover:bg-surface-muted',
                language.current ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {language.native}
              <span className="text-[11px] uppercase text-muted-foreground">{language.code}</span>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
