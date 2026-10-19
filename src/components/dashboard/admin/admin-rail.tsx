'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type CSSProperties } from 'react';
import {
  Activity, ArrowLeft, Building2, Flag, Gauge, Pin, PinOff, QrCode, Server, SlidersHorizontal, Users,
  type LucideIcon,
} from '@/components/admin-icons';
import { ADMIN_NAV } from '@/components/dashboard/nav';
import { cn } from '@/lib/utils';

/** The admin's icons: Solar Linear, as in AltRix (owner, 19 Oct 2026). The user dashboard keeps its own. */
const ICONS: Record<string, LucideIcon> = { Activity, Building2, Flag, Gauge, QrCode, Server, SlidersHorizontal, Users };
export function AdminIcon({ name, className }: { name: string; className?: string }) {
  const Component = ICONS[name] ?? QrCode;
  return <Component className={cn('size-[18px] shrink-0', className)} aria-hidden />;
}

const CLOSED = 64;
const OPEN = 232;

/**
 * Desktop navigation for the platform admin: a rail on the left, icons only, that opens on hover and pushes the
 * page (pin it with the button or "["). Phones keep the horizontal pills under the header (AdminNav).
 */
export function AdminRail({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hover || pinned;

  const togglePin = () =>
    setPinned((v) => {
      try { localStorage.setItem('qr-admin-rail-pinned', v ? '0' : '1'); } catch { /* private window */ }
      return !v;
    });
  useEffect(() => {
    try { setPinned(localStorage.getItem('qr-admin-rail-pinned') === '1'); } catch { /* private window */ }
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key !== '[' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      togglePin();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{ '--admin-rail': `${(open ? OPEN : CLOSED) + 20}px` } as CSSProperties}>
      <nav
        aria-label="Admin sections"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ width: open ? OPEN : CLOSED }}
        className="fixed bottom-2.5 left-2.5 top-[66px] z-30 hidden flex-col gap-0.5 overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-soft transition-[width] duration-200 lg:flex"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
          {ADMIN_NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-10 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-[13px] text-[13px] font-medium transition-colors',
                  active ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                )}
              >
                <AdminIcon name={item.icon} />
                <span className={cn('transition-opacity duration-150', open ? 'opacity-100' : 'opacity-0')}>{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="shrink-0 border-t border-border pt-1">
          <Link href="/dashboard" title="Back to dashboard"
            className="flex h-10 items-center gap-3 whitespace-nowrap rounded-xl px-[13px] text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground">
            <ArrowLeft className="size-[18px] shrink-0" aria-hidden />
            <span className={cn('transition-opacity duration-150', open ? 'opacity-100' : 'opacity-0')}>Back to dashboard</span>
          </Link>
          <button type="button" onClick={togglePin} aria-pressed={pinned} title={pinned ? 'Unpin the menu ([)' : 'Keep the menu open ([)'}
            className="flex h-10 w-full items-center gap-3 whitespace-nowrap rounded-xl px-[13px] text-left text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground">
            {pinned ? <PinOff className="size-[18px] shrink-0" aria-hidden /> : <Pin className="size-[18px] shrink-0" aria-hidden />}
            <span className={cn('transition-opacity duration-150', open ? 'opacity-100' : 'opacity-0')}>{pinned ? 'Unpin menu' : 'Pin menu'}</span>
          </button>
        </div>
      </nav>
      <div className="transition-[padding] duration-200 lg:pl-[var(--admin-rail)]">{children}</div>
    </div>
  );
}
