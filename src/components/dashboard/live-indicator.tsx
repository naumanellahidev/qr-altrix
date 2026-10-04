'use client';

import { cn } from '@/lib/utils';

/** Small "Live" pill: a breathing dot while scans are being followed in real time. */
export function LiveIndicator({ live, className }: { live: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] font-semibold',
        live ? 'border-success/30 bg-success/10 text-success' : 'border-border bg-surface-muted text-muted-foreground',
        className,
      )}
      title={live ? 'New scans appear here automatically' : 'Reconnecting…'}
      aria-live="polite"
    >
      <span className="relative flex size-2">
        {live ? <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" /> : null}
        <span className={cn('relative inline-flex size-2 rounded-full', live ? 'bg-success' : 'bg-muted-foreground/50')} />
      </span>
      {live ? 'Live' : 'Offline'}
    </span>
  );
}
