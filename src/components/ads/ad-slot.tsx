'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * One responsive AdSense unit. The box has a fixed minimum height so a late ad never
 * shifts the text below it (no layout shift). Renders nothing until the server passes a
 * publisher id and slot (ADSENSE_CLIENT / ADSENSE_SLOT_* in the environment).
 */
export function AdSlot({ client, slot }: { client: string; slot: string }) {
  const ref = useRef<HTMLModElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* blocked by an ad blocker: leave the reserved space empty */
    }
  }, []);
  return (
    <div className="ad-slot my-8 min-h-[280px] w-full overflow-hidden" aria-label="Advertisement">
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: 'block', minHeight: 280 }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
