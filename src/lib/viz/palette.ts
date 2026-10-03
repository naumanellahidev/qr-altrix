'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

/**
 * Chart palette.
 *
 * Categorical hues are assigned in a fixed order and never cycled. Both columns were
 * validated as a set against the surfaces QR ALTRIX actually uses (light card #FFFFFF,
 * dark card #0E1526):
 *
 *   light  — lightness band PASS · chroma PASS · adjacent CVD ΔE 9.1 · normal-vision ΔE 19.6
 *            contrast WARN on aqua/yellow/magenta → relief rule applied: every breakdown
 *            ships visible value labels and a table reading of the same numbers.
 *   dark   — lightness band PASS · chroma PASS · adjacent CVD ΔE 8.4 · normal-vision ΔE 19.3
 *            contrast PASS (all ≥ 3:1).
 *
 * A ninth series is never generated: it folds into "Other".
 */

export const CATEGORICAL_LIGHT = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
] as const;

export const CATEGORICAL_DARK = [
  '#3987e5',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
  '#e66767',
] as const;

/** Single hue for magnitude (share bars, heat intensity), light → dark. */
export const SEQUENTIAL_LIGHT = ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2a78d6', '#1d4ed8'];
export const SEQUENTIAL_DARK = ['#1e3a5f', '#1e40af', '#1d4ed8', '#2563eb', '#3987e5', '#60a5fa', '#93c5fd'];

export interface VizPalette {
  mode: 'light' | 'dark';
  categorical: readonly string[];
  sequential: readonly string[];
  grid: string;
  axis: string;
  surface: string;
  text: string;
  textMuted: string;
}

const LIGHT: VizPalette = {
  mode: 'light',
  categorical: CATEGORICAL_LIGHT,
  sequential: SEQUENTIAL_LIGHT,
  grid: '#e2e8f0',
  axis: '#94a3b8',
  surface: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
};

const DARK: VizPalette = {
  mode: 'dark',
  categorical: CATEGORICAL_DARK,
  sequential: SEQUENTIAL_DARK,
  grid: '#1e293b',
  axis: '#64748b',
  surface: '#0e1526',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
};

/** Resolves the palette for the viewer's current theme. */
export function useVizPalette(): VizPalette {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  // Before hydration, light is the safe assumption: it is the default surface.
  return mounted && resolvedTheme === 'dark' ? DARK : LIGHT;
}

/** Picks a colour for a named entity so a filter never repaints the survivors. */
export function colorForEntity(entity: string, palette: readonly string[]): string {
  let hash = 0;
  for (let i = 0; i < entity.length; i += 1) {
    hash = (hash * 31 + entity.charCodeAt(i)) % 100003;
  }
  return palette[hash % palette.length];
}
