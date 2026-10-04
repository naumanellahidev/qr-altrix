import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/brand';

function safeHex(value: unknown, fallback = '#4F46E5'): string {
  return typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())
    ? value.trim()
    : fallback;
}

export interface LandingShellProps {
  accent?: unknown;
  children: ReactNode;
  className?: string;
  /** Narrow column for cards and forms; wide for galleries and menus. */
  width?: 'narrow' | 'wide';
  footerNote?: string;
}

/**
 * Wrapper for every hosted landing page. It keeps the visual language consistent,
 * applies the owner's accent colour, and always makes clear the page is a QR code
 * destination (with a quiet, non-intrusive credit).
 */
export function LandingShell({ accent, children, className, width = 'narrow', footerNote }: LandingShellProps) {
  const accentColor = safeHex(accent);

  return (
    <div
      className="min-h-dvh bg-background"
      style={{ ['--landing-accent' as string]: accentColor }}
    >
      <div
        className={cn(
          'mx-auto w-full px-4 pb-16 pt-8 sm:px-6',
          width === 'narrow' ? 'max-w-lg' : 'max-w-4xl',
          className,
        )}
      >
        {children}

        <footer className="mt-10 flex flex-col items-center gap-2 border-t border-border pt-6 text-center">
          {footerNote ? <p className="text-[12px] text-muted-foreground">{footerNote}</p> : null}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <BrandMark size={14} />
            Free QR codes by <span className="font-semibold">QR ALTRIX</span>
          </Link>
        </footer>
      </div>
    </div>
  );
}

/** Primary action button styled with the page's accent colour. */
export function AccentButton({
  href,
  children,
  className,
  download,
  onClick,
  type = 'button',
}: {
  href?: string;
  children: ReactNode;
  className?: string;
  download?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  const classes = cn(
    'inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-[14.5px] font-semibold text-white shadow-soft transition-transform hover:brightness-105 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    className,
  );
  const style = { background: 'var(--landing-accent)' } as const;

  if (href) {
    return (
      <a href={href} className={classes} style={style} download={download} rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes} style={style}>
      {children}
    </button>
  );
}

export function LandingHeader({
  title,
  subtitle,
  logoUrl,
  align = 'center',
}: {
  title: string;
  subtitle?: string | null;
  logoUrl?: string | null;
  align?: 'center' | 'left';
}) {
  return (
    <header className={cn('mb-6', align === 'center' ? 'text-center' : 'text-left')}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          className={cn(
            'mb-4 h-16 w-16 rounded-2xl border border-border bg-card object-contain p-1.5 shadow-soft',
            align === 'center' && 'mx-auto',
          )}
        />
      ) : null}
      <h1 className="font-display text-[24px] font-bold leading-tight tracking-[-0.025em] sm:text-[28px]">{title}</h1>
      {subtitle ? <p className="mt-2 text-[14px] leading-6 text-muted-foreground">{subtitle}</p> : null}
    </header>
  );
}

export { safeHex };
