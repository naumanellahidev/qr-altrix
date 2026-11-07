import { adsenseClient } from '@/components/ads/ads';

export const dynamic = 'force-dynamic';

/** Authorized Digital Sellers line for AdSense, from ADSENSE_CLIENT. */
export function GET() {
  const client = adsenseClient();
  const body = client
    ? `google.com, ${client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`
    : '# Set ADSENSE_CLIENT to publish the AdSense line.\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
