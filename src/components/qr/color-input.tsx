'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

function normalizeHex(value: string): string | null {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (/^#([0-9a-fA-F]{3})$/.test(withHash)) {
    const [, r, g, b] = /^#(.)(.)(.)$/.exec(withHash)!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  if (/^#([0-9a-fA-F]{6})$/.test(withHash)) return withHash.toUpperCase();
  return null;
}

export interface ColorInputProps {
  label?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

/** Swatch + hex field. Typing is free-form; the value commits only when it is valid. */
export function ColorInput({ label, value, onChange, disabled, className }: ColorInputProps) {
  const [draft, setDraft] = React.useState(value);
  const inputId = React.useId();

  React.useEffect(() => setDraft(value), [value]);

  function commit(next: string) {
    const normalized = normalizeHex(next);
    if (normalized) onChange(normalized);
    else setDraft(value);
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={inputId} className="block text-[13px] font-medium">
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl border border-input bg-surface p-1.5 pl-2 shadow-soft',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        <span className="relative size-7 shrink-0 overflow-hidden rounded-lg border border-border">
          <input
            type="color"
            value={normalizeHex(draft) ?? '#000000'}
            onChange={(event) => {
              setDraft(event.target.value.toUpperCase());
              onChange(event.target.value.toUpperCase());
            }}
            className="absolute inset-[-25%] size-[150%] cursor-pointer"
            aria-label={typeof label === 'string' ? `${label} colour picker` : 'Colour picker'}
            tabIndex={-1}
          />
        </span>
        <input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commit(draft);
            }
          }}
          spellCheck={false}
          className="w-full min-w-0 bg-transparent font-mono text-[12.5px] uppercase outline-none"
          maxLength={7}
        />
      </div>
    </div>
  );
}
