'use client';

import dynamic from 'next/dynamic';

/**
 * The toast container loads in its own chunk after the page hydrates. Nothing toasts
 * before someone interacts, so it no longer adds to the first load of every page.
 */
export const LazyToaster = dynamic(() => import('@/components/ui/toaster').then((m) => m.Toaster), { ssr: false });
