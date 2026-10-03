'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-[22px] w-[38px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block size-[18px] rounded-full bg-white shadow-soft ring-0 transition-transform data-[state=checked]:translate-x-[16px] data-[state=unchecked]:translate-x-0',
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';

export interface SwitchRowProps {
  id?: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/** Label + description + switch, the pattern used across Settings and the builder. */
function SwitchRow({ id, label, description, checked, onCheckedChange, disabled, className }: SwitchRowProps) {
  const fieldId = id ?? React.useId();
  return (
    <div className={cn('flex items-start justify-between gap-4 py-0.5', className)}>
      <div className="min-w-0 space-y-0.5">
        <label htmlFor={fieldId} className="block text-[13.5px] font-medium leading-5">
          {label}
        </label>
        {description ? (
          <p className="text-[12.5px] leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Switch id={fieldId} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

export { Switch, SwitchRow };
