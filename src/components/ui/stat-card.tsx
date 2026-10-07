import * as React from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, ChevronRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export function StatCard({
  label,
  value,
  hint,
  icon,
  change,
  changeLabel,
  className,
  tone = 'default',
  href,
  onClick,
  active = false,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  /** Percentage change versus the previous period. null = no comparison available. */
  change?: number | null;
  changeLabel?: string;
  className?: string;
  tone?: 'default' | 'primary' | 'accent';
  /** Makes the whole card a link to the page behind the number. */
  href?: string;
  /** Makes the whole card a button (for cards that filter the page they are on). */
  onClick?: () => void;
  /** Marks a filter card as the one currently applied. */
  active?: boolean;
}) {
  const direction = change === null || change === undefined ? null : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';

  const interactive = Boolean(href || onClick);
  const card = (
    <Card
      className={cn(
        'relative h-full overflow-hidden p-5',
        interactive &&
          'transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-card group-focus-visible:border-primary',
        active && 'border-primary ring-2 ring-primary/25',
        className,
      )}
    >
      {tone !== 'default' ? (
        <div
          className={cn(
            'pointer-events-none absolute -right-8 -top-10 size-32 rounded-full blur-2xl',
            tone === 'primary' ? 'bg-primary/12' : 'bg-accent/12',
          )}
          aria-hidden
        />
      ) : null}
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[12.5px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon ? (
          <span className="flex size-8 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="relative mt-2 flex items-end gap-2">
        <span className="font-display text-[28px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
          {value}
        </span>
        {direction ? (
          <span
            className={cn(
              'mb-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11.5px] font-medium',
              direction === 'up' && 'bg-success/12 text-success-text',
              direction === 'down' && 'bg-destructive/12 text-destructive',
              direction === 'flat' && 'bg-secondary text-muted-foreground',
            )}
          >
            {direction === 'up' ? (
              <ArrowUpRight className="size-3" />
            ) : direction === 'down' ? (
              <ArrowDownRight className="size-3" />
            ) : (
              <Minus className="size-3" />
            )}
            {Math.abs(change ?? 0)}%
          </span>
        ) : null}
      </div>
      {hint || changeLabel ? (
        <p className="relative mt-1.5 text-[12.5px] leading-5 text-muted-foreground">{hint ?? changeLabel}</p>
      ) : null}
      {interactive ? (
        <ChevronRight
          className="absolute bottom-4 right-4 size-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      ) : null}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="group block rounded-2xl outline-none" prefetch={false}>
        {card}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="group block w-full rounded-2xl text-left outline-none"
      >
        {card}
      </button>
    );
  }
  return card;
}
