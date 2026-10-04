'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarClock, Infinity as InfinityIcon, ShieldAlert, X } from 'lucide-react';
import type { Role } from '@prisma/client';
import { can } from '@/lib/rbac';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/brand';
import { NAV_SECTIONS } from '@/components/dashboard/nav';
import { NavIcon } from '@/components/dashboard/nav-icon';

export interface SidebarProps {
  role: Role;
  isPlatformAdmin: boolean;
  open: boolean;
  onClose: () => void;
  codeCount: number;
  /** True when an administrator has switched the expiry policy on. */
  expiryEnabled?: boolean;
}

export function Sidebar({ role, isPlatformAdmin, open, onClose, codeCount, expiryEnabled }: SidebarProps) {
  const pathname = usePathname();

  // Close the drawer whenever navigation happens on mobile.
  React.useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const content = (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-3 py-4">
      <div className="flex items-center justify-between px-1.5 lg:hidden">
        <BrandLogo />
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted"
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="hidden px-1.5 lg:block">
        <BrandLogo />
      </div>

      <nav className="flex-1 space-y-5" aria-label="Dashboard">
        {NAV_SECTIONS.map((section, index) => {
          const items = section.items.filter((item) => !item.permission || can(role, item.permission));
          if (items.length === 0) return null;

          return (
            <div key={section.title ?? index} className="space-y-1">
              {section.title ? (
                <p className="px-2.5 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {section.title}
                </p>
              ) : null}
              {items.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-medium transition-colors',
                      active
                        ? 'bg-primary-soft text-primary'
                        : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                    )}
                  >
                    <NavIcon
                      name={item.icon}
                      className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.href === '/dashboard/codes' && codeCount > 0 ? (
                      <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                        {codeCount > 999 ? '999+' : codeCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          );
        })}

        {isPlatformAdmin ? (
          <div className="space-y-1 border-t border-border pt-4">
            <p className="px-2.5 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Platform
            </p>
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-medium transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-destructive/10 text-destructive'
                  : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
              )}
            >
              <ShieldAlert className="size-[17px]" />
              Admin panel
            </Link>
          </div>
        ) : null}
      </nav>

      {expiryEnabled ? (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-3">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-warning">
            <CalendarClock className="size-3.5" />
            Expiry policy is on
          </p>
          <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground">
            This server gives codes a lifetime. Each code shows its expiry date on its own page.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-success/25 bg-success/8 p-3">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-success">
            <InfinityIcon className="size-3.5" />
            Nothing expires here
          </p>
          <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground">
            Your dynamic codes keep resolving until you pause or delete them. No trial, no subscription.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-[248px] shrink-0 border-r border-border bg-surface lg:block">
        <div className="sticky top-0 h-dvh">{content}</div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={onClose}
            aria-label="Close menu"
          />
          <aside className="relative h-full w-[274px] border-r border-border bg-surface shadow-lifted">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}
