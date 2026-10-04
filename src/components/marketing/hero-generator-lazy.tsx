'use client';

import * as React from 'react';
import type { HeroGeneratorProps } from '@/components/marketing/hero-generator';

/**
 * The homepage generator, server-rendered in full but hydrated on the visitor's first
 * sign of activity.
 *
 * On the server the generator renders as usual, so its HTML (and everything a search
 * engine or the first paint needs) is in the page. In the browser its JavaScript is a
 * separate chunk that is not downloaded at load: React keeps the server HTML of this
 * Suspense boundary as it is ("dehydrated") until the chunk arrives. The first scroll,
 * touch, pointer movement, key press or focus starts the download and React hydrates
 * the boundary; a click that lands before that is held and replayed by React once the
 * generator is live, so it is not lost.
 *
 * Why: on a phone the generator was most of the page's main-thread work and of the
 * JavaScript fetched before first paint, which is what mobile performance scores and
 * slow devices pay for. Visitors who only read the page never pay for it at all.
 */

let release: (() => void) | null = null;

// The server must render the generator straight away; only the browser waits.
const gate: Promise<void> =
  typeof window === 'undefined' ? Promise.resolve() : new Promise<void>((resolve) => (release = resolve));

const Generator = React.lazy(() =>
  gate
    .then(() => import('@/components/marketing/hero-generator'))
    .then((module) => ({ default: module.HeroGenerator })),
);

const WAKE_EVENTS = ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'focusin', 'scroll', 'wheel'] as const;

/**
 * Text typed into the generator before it hydrates. React resets a controlled input to
 * its state when it takes over, so the keystrokes are recorded here by field id and
 * handed to the generator, which applies them once it is live.
 */
const early: Record<string, string> = {};

function recordEarlyInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
  if (target.id.startsWith('content-') || target.id === 'draft-name') early[target.id] = target.value;
}

function takeEarlyInput(): Record<string, string> {
  const values = { ...early };
  for (const key of Object.keys(early)) delete early[key];
  window.removeEventListener('input', recordEarlyInput, true);
  return values;
}

export function LazyHeroGenerator(props: HeroGeneratorProps) {
  React.useEffect(() => {
    window.addEventListener('input', recordEarlyInput, true);
    if (!release) return;
    const wake = () => {
      release?.();
      release = null;
      stop();
    };
    const stop = () => {
      for (const name of WAKE_EVENTS) window.removeEventListener(name, wake, { capture: true });
    };
    for (const name of WAKE_EVENTS) window.addEventListener(name, wake, { capture: true, passive: true });
    // Arriving on #generator or with the generator already in focus means intent.
    if (document.activeElement && document.activeElement !== document.body) wake();
    return stop;
  }, []);

  return (
    <React.Suspense fallback={null}>
      <Generator {...props} earlyInput={takeEarlyInput} />
    </React.Suspense>
  );
}
