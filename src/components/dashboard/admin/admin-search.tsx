'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

/** Debounced search box that drives admin list pages through the URL. */
export function AdminSearch({ basePath, placeholder }: { basePath: string; placeholder: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = React.useState(params.get('q') ?? '');

  React.useEffect(() => {
    const current = params.get('q') ?? '';
    if (value === current) return;
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value.trim()) next.set('q', value.trim());
      else next.delete('q');
      next.delete('page');
      router.push(`${basePath}${next.toString() ? `?${next.toString()}` : ''}`);
    }, 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      prefix={<Search className="size-3.5" />}
      className="max-w-sm"
      aria-label={placeholder}
    />
  );
}
