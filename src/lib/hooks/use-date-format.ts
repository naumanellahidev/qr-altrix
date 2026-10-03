'use client';

import * as React from 'react';

/**
 * Dates rendered by client components are also rendered on the server, where the locale
 * is Node's and the time zone is UTC. Formatting with the browser's locale on both sides
 * produces different text, and React aborts hydration (minified error #418).
 *
 * So the server and the hydrating render agree on a fixed format (en-GB, UTC), and the
 * very next render switches to the viewer's own locale and time zone.
 */
const subscribe = () => () => {};

export function useHydrated(): boolean {
  return React.useSyncExternalStore(subscribe, () => true, () => false);
}

export type DateValue = string | number | Date | null | undefined;

export function formatDateValue(
  value: DateValue,
  options: Intl.DateTimeFormatOptions,
  hydrated: boolean,
  fallback = '—',
): string {
  if (value === null || value === undefined || value === '') return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return hydrated
    ? date.toLocaleString(undefined, options)
    : date.toLocaleString('en-GB', { ...options, timeZone: 'UTC' });
}

export const DATE: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
export const DATE_TIME: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };
export const TIME: Intl.DateTimeFormatOptions = { timeStyle: 'short' };

/** Returns a formatter that is hydration-safe; defaults to a date with no time. */
export function useDateFormat() {
  const hydrated = useHydrated();
  return React.useCallback(
    (value: DateValue, options: Intl.DateTimeFormatOptions = DATE, fallback = '—') =>
      formatDateValue(value, options, hydrated, fallback),
    [hydrated],
  );
}
