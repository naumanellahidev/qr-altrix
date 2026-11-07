import Script from 'next/script';
import { AdSlot } from '@/components/ads/ad-slot';

/**
 * AdSense, configured at runtime from the environment:
 *   ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 *   ADSENSE_SLOT_TOP / ADSENSE_SLOT_MID / ADSENSE_SLOT_END = numeric ad-unit ids
 * With no client id nothing is rendered: no script, no empty boxes. Without slot ids
 * only the script loads (Auto ads, if switched on in AdSense, can then place units).
 * Ads appear only on public content pages, never in the app, dashboard, sign-in or on
 * the hosted pages people create for their own QR codes.
 */
export type AdPosition = 'top' | 'mid' | 'end';

export function adsenseClient(): string {
  const v = (process.env.ADSENSE_CLIENT ?? '').trim();
  return /^ca-pub-\d{10,20}$/.test(v) ? v : '';
}

function slotId(position: AdPosition): string {
  const v = (process.env[`ADSENSE_SLOT_${position.toUpperCase()}`] ?? '').trim();
  return /^\d{6,20}$/.test(v) ? v : '';
}

export function AdsenseScript() {
  const client = adsenseClient();
  if (!client) return null;
  return (
    <Script
      id="adsense"
      async
      strategy="lazyOnload"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}

export function Ad({ position }: { position: AdPosition }) {
  const client = adsenseClient();
  const slot = slotId(position);
  if (!client || !slot) return null;
  return <AdSlot client={client} slot={slot} />;
}
