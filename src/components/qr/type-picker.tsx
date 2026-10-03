'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { CATEGORIES, QR_TYPES, type QrTypeDef } from '@/lib/qr/catalog';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TypeIcon } from '@/components/ui/icon';

export interface TypePickerProps {
  value: string;
  onChange: (type: string, def: QrTypeDef) => void;
  /** Limit the list, e.g. to featured types on the homepage. */
  types?: QrTypeDef[];
  variant?: 'grid' | 'strip';
  showSearch?: boolean;
  className?: string;
}

export function TypePicker({
  value,
  onChange,
  types = QR_TYPES,
  variant = 'grid',
  showSearch = true,
  className,
}: TypePickerProps) {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<'All' | QrTypeDef['category']>('All');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return types.filter((type) => {
      if (category !== 'All' && type.category !== category) return false;
      if (!q) return true;
      return (
        type.label.toLowerCase().includes(q) ||
        type.tagline.toLowerCase().includes(q) ||
        type.description.toLowerCase().includes(q)
      );
    });
  }, [types, query, category]);

  if (variant === 'strip') {
    return (
      <div className={cn('flex gap-2 overflow-x-auto pb-1', className)} role="radiogroup" aria-label="QR code type">
        {types.map((type) => {
          const selected = type.type === value;
          return (
            <button
              key={type.type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(type.type, type)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-medium transition-all',
                selected
                  ? 'border-primary bg-primary-soft text-primary shadow-soft'
                  : 'border-border bg-surface text-foreground hover:border-primary/40 hover:bg-surface-muted',
              )}
            >
              <TypeIcon name={type.icon} className={selected ? 'text-primary' : 'text-muted-foreground'} />
              {type.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {showSearch ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search QR code types…"
            prefix={<Search className="size-3.5" />}
            className="sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-1.5">
            {(['All', ...CATEGORIES] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[12px] transition-colors',
                  category === item
                    ? 'border-primary bg-primary-soft font-medium text-primary'
                    : 'border-border bg-surface text-muted-foreground hover:text-foreground',
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface-muted/50 px-4 py-8 text-center text-[13px] text-muted-foreground">
          No QR type matches “{query}”.
        </p>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((type) => {
            const selected = type.type === value;
            return (
              <button
                key={type.type}
                type="button"
                onClick={() => onChange(type.type, type)}
                aria-pressed={selected}
                className={cn(
                  'group flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all',
                  selected
                    ? 'border-primary bg-primary-soft/70 shadow-soft ring-1 ring-primary/20'
                    : 'border-border bg-surface hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card',
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                    selected
                      ? 'border-primary/30 bg-card text-primary'
                      : 'border-border bg-surface-muted text-muted-foreground group-hover:text-primary',
                  )}
                >
                  <TypeIcon name={type.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[13.5px] font-semibold">{type.label}</span>
                    <Badge variant={type.kind === 'DYNAMIC' ? 'primary' : 'outline'} className="shrink-0">
                      {type.kind === 'DYNAMIC' ? 'Dynamic' : 'Static'}
                    </Badge>
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-5 text-muted-foreground">{type.tagline}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="text-[12.5px] leading-5 text-muted-foreground">
        <strong className="font-medium text-foreground">Static</strong> codes hold the content inside the pattern — they
        work offline and forever, but cannot be edited or tracked.{' '}
        <strong className="font-medium text-foreground">Dynamic</strong> codes point at a short link you can change any
        time, with full scan analytics. They never expire on QR ALTRIX.
      </p>
    </div>
  );
}
