import { handleScan, headScan } from '@/lib/routing/scan-handler';

/**
 * `/q/:code` — the scan endpoint. The logic lives in `lib/routing/scan-handler` so that
 * `/r/:code` can share it without one route module importing another.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  return handleScan(request, code);
}

export async function HEAD(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  return headScan(request, code);
}
