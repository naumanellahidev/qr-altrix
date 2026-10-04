import type * as React from 'react';
import { MASK_ICONS } from '@/lib/icons/mask-icons';
import { cn } from '@/lib/utils';

/**
 * A lucide icon as a single element: the icon's outline is a CSS mask and its colour is
 * the current text colour, so it matches the inline <svg> version but costs one DOM node
 * and no JavaScript. Server-rendered marketing pages use it; interactive UI keeps
 * lucide-react. Add new names in scripts/build-mask-icons.mjs and re-run it.
 */
export function MaskIcon({ name, className, label }: { name: string; className?: string; label?: string }) {
  const url = MASK_ICONS[name] ?? MASK_ICONS.QrCode;
  return (
    <span
      className={cn('mask-icon size-4', className)}
      style={{ '--mask-icon': url } as React.CSSProperties}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    />
  );
}
