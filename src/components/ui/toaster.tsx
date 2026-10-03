'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';
import { useTheme } from 'next-themes';

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={(resolvedTheme as 'light' | 'dark' | undefined) ?? 'system'}
      position="bottom-right"
      closeButton
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            'group rounded-xl border border-border bg-card text-card-foreground shadow-lifted text-[13.5px] gap-3',
          title: 'font-medium',
          description: 'text-muted-foreground text-[12.5px] leading-5',
          actionButton: 'rounded-lg bg-primary text-primary-foreground text-[12.5px] px-2.5 py-1',
          cancelButton: 'rounded-lg bg-secondary text-secondary-foreground text-[12.5px] px-2.5 py-1',
          closeButton: 'bg-card border-border text-muted-foreground hover:text-foreground',
          error: 'border-destructive/30 [&_[data-icon]]:text-destructive',
          success: 'border-success/30 [&_[data-icon]]:text-success',
          warning: 'border-warning/30 [&_[data-icon]]:text-warning',
        },
      }}
    />
  );
}

export { toast };
