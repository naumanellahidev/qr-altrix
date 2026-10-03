import { handleScan, headScan } from '@/lib/routing/scan-handler';

/**
 * `/r/:code` is an alias of `/q/:code`, so printed material using either prefix keeps
 * resolving. Both delegate to the same handler.
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
