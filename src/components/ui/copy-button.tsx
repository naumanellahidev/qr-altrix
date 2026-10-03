'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  value: string;
  label?: string;
  /** Shown as a toast; set to null to stay silent. */
  successMessage?: string | null;
  children?: React.ReactNode;
}

export function CopyButton({
  value,
  label = 'Copy',
  successMessage = 'Copied to clipboard',
  variant = 'outline',
  size = 'sm',
  className,
  children,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Older browsers and non-secure contexts need the legacy path.
      const area = document.createElement('textarea');
      area.value = value;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    setCopied(true);
    if (successMessage) toast.success(successMessage);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={copy}
      className={cn(className)}
      aria-label={label}
      {...props}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
      {children ?? (size === 'icon' || size === 'icon-sm' ? null : copied ? 'Copied' : label)}
    </Button>
  );
}

/** Read-only field with a copy affordance — used for short links, API keys and tokens. */
export function CopyField({
  value,
  label,
  mono = true,
  className,
}: {
  value: string;
  label?: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? <p className="text-[13px] font-medium">{label}</p> : null}
      <div className="flex items-stretch overflow-hidden rounded-xl border border-input bg-surface shadow-soft">
        <span
          className={cn(
            'min-w-0 flex-1 truncate px-3 py-2.5 text-[13px] leading-5',
            mono && 'font-mono text-[12.5px]',
          )}
          title={value}
        >
          {value}
        </span>
        <CopyButton value={value} variant="ghost" size="sm" className="rounded-none border-l border-border px-3" />
      </div>
    </div>
  );
}
