'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV } from '@/components/dashboard/nav';
import { NavIcon } from '@/components/dashboard/nav-icon';
import { cn } from '@/lib/utils';

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="overflow-x-auto">
      <ul className="flex min-w-max items-center gap-1 rounded-xl border border-border bg-surface p-1">
        {ADMIN_NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-card text-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                )}
              >
                <NavIcon name={item.icon} className="size-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
