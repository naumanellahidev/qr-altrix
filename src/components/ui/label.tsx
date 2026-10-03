'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean; hint?: string }
>(({ className, required, hint, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'flex items-center gap-1.5 text-[13px] font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
      className,
    )}
    {...props}
  >
    <span>{children}</span>
    {required ? (
      <span className="text-destructive" aria-hidden>
        *
      </span>
    ) : null}
    {hint ? <span className="font-normal text-muted-foreground">{hint}</span> : null}
  </LabelPrimitive.Root>
));
Label.displayName = 'Label';

export interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  help?: React.ReactNode;
  error?: string | null;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + help/error, so every form in the app looks the same. */
export function Field({ label, htmlFor, required, hint, help, error, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <Label htmlFor={htmlFor} required={required} hint={hint}>
          {label}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-[12.5px] font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : help ? (
        <p className="text-[12.5px] leading-5 text-muted-foreground">{help}</p>
      ) : null}
    </div>
  );
}

export { Label };
