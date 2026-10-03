'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  invalid?: boolean;
  /** Rendered inside the field on the left, e.g. a small icon or "https://". */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const baseField =
  'flex h-10 w-full rounded-xl border bg-surface px-3 py-2 text-sm shadow-soft transition-shadow placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', invalid, prefix, suffix, ...props }, ref) => {
    const field = (
      <input
        type={type}
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          baseField,
          invalid ? 'border-destructive focus-visible:ring-destructive' : 'border-input',
          prefix && 'rounded-l-none border-l-0 pl-2 shadow-none',
          suffix && 'rounded-r-none border-r-0 shadow-none',
          className,
        )}
        {...props}
      />
    );

    if (!prefix && !suffix) return field;

    return (
      <div
        className={cn(
          'flex w-full items-stretch rounded-xl border shadow-soft',
          invalid ? 'border-destructive' : 'border-input',
        )}
      >
        {prefix ? (
          <span className="flex select-none items-center gap-1.5 rounded-l-xl bg-surface-muted px-3 text-[13px] text-muted-foreground">
            {prefix}
          </span>
        ) : null}
        {field}
        {suffix ? (
          <span className="flex select-none items-center gap-1.5 rounded-r-xl bg-surface-muted px-3 text-[13px] text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    aria-invalid={invalid || undefined}
    className={cn(
      baseField,
      'min-h-[80px] resize-y leading-6',
      invalid ? 'border-destructive focus-visible:ring-destructive' : 'border-input',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { Input, Textarea };
