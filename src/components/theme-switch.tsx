'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

/**
 * One-tap light/dark switch for the public site. The dashboard keeps the full
 * Light/Dark/System menu; this avoids shipping a dropdown menu (and its positioning
 * library) to every marketing page for a two-state choice.
 */
export function ThemeSwitch({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === 'dark' ? 'light' : 'dark';
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={`Switch to ${next} theme`}
      onClick={() => setTheme(next)}
    >
      {/* Both icons render until the theme is known, so server and client agree. */}
      <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
