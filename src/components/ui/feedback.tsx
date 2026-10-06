'use client';

import * as React from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

// ------------------------------------------------------------------------ alert

const alertStyles = {
  info: 'border-primary/25 bg-primary-soft/60 text-foreground [&_[data-icon]]:text-primary-soft-foreground',
  success: 'border-success/25 bg-success/10 text-foreground [&_[data-icon]]:text-success',
  warning: 'border-warning/30 bg-warning/10 text-foreground [&_[data-icon]]:text-warning',
  error: 'border-destructive/25 bg-destructive/10 text-foreground [&_[data-icon]]:text-destructive',
} as const;

const alertIcons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
} as const;

export function Alert({
  tone = 'info',
  title,
  children,
  className,
  action,
}: {
  tone?: keyof typeof alertStyles;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  const Icon = alertIcons[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex flex-wrap gap-x-3 gap-y-2.5 rounded-xl border p-3.5 text-[13.5px] leading-6', alertStyles[tone], className)}
    >
      <Icon data-icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold leading-5">{title}</p> : null}
        {children ? <div className={cn(title && 'mt-0.5', 'text-muted-foreground')}>{children}</div> : null}
      </div>
      {/* On a phone the action sits under the text instead of squeezing it into a sliver. */}
      {action ? <div className="w-full pl-7 sm:w-auto sm:shrink-0 sm:self-center sm:pl-0">{action}</div> : null}
    </div>
  );
}

// --------------------------------------------------------------------- skeleton

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-lg bg-surface-muted', className)}
      aria-hidden
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-background/60 to-transparent" />
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2.5 p-4" aria-busy>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4">
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          {Array.from({ length: columns - 1 }).map((__, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-4 flex-1"
              style={{ maxWidth: `${[40, 18, 14, 12, 10][colIndex] ?? 12}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3 rounded-2xl border border-border bg-card p-5', className)} aria-busy>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// ------------------------------------------------------------------ empty state

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'qa-glow relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center',
        className,
      )}
    >
      <div className="relative z-10 flex flex-col items-center">
        {icon ? (
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-soft [&_svg]:size-5">
            {icon}
          </div>
        ) : null}
        <h3 className="font-display text-[17px] font-semibold tracking-[-0.01em]">{title}</h3>
        {description ? (
          <p className="mt-1.5 max-w-sm text-[13.5px] leading-6 text-muted-foreground">{description}</p>
        ) : null}
        {action || secondaryAction ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {action}
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------- inline load

export function InlineLoader({ label = 'Loading', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-2 py-10 text-[13.5px] text-muted-foreground', className)}>
      <Loader2 className="size-4 animate-spin" />
      {label}…
    </div>
  );
}
