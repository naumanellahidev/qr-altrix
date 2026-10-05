'use client';

import * as React from 'react';
import type { GeneratorCopy } from '@/content/schema';
import { generator as english } from '@/content/locales/en/generator';

interface GeneratorCopyValue {
  copy: GeneratorCopy;
  /** Translates an English catalogue or preset string; unknown strings stay English. */
  t: (text: string | undefined) => string;
  locale: string;
}

const identity = (text: string | undefined) => text ?? '';

const GeneratorCopyContext = React.createContext<GeneratorCopyValue>({ copy: english, t: identity, locale: 'en' });

/**
 * The words of the generator in one language. Public pages in another language wrap the
 * generator in this; everywhere else (dashboard builder, English pages) the English
 * default applies, so those screens need no provider.
 */
export function GeneratorCopyProvider({
  copy,
  phrases,
  locale,
  children,
}: {
  copy: GeneratorCopy;
  phrases: Record<string, string>;
  locale: string;
  children: React.ReactNode;
}) {
  const value = React.useMemo<GeneratorCopyValue>(
    () => ({ copy, locale, t: (text) => (text ? (phrases[text] ?? text) : '') }),
    [copy, phrases, locale],
  );
  return <GeneratorCopyContext.Provider value={value}>{children}</GeneratorCopyContext.Provider>;
}

export function useGeneratorCopy(): GeneratorCopyValue {
  return React.useContext(GeneratorCopyContext);
}

/** Fills `{name}` placeholders: fill('{type} code', { type: 'Wi-Fi' }). */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
