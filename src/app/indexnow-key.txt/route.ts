/**
 * IndexNow ownership file. Submissions name this URL as their keyLocation, and the
 * search engines fetch it to check the key. The key lives in INDEXNOW_KEY.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key || !/^[a-zA-Z0-9-]{8,128}$/.test(key)) return new Response('Not found', { status: 404 });
  return new Response(key, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' } });
}
