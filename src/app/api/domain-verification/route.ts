import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requestHost } from '@/lib/request';

export const dynamic = 'force-dynamic';

/**
 * Serves the ownership proof for a custom short domain.
 *
 * Reached at `/.well-known/qr-altrix-domain-verification` (rewritten in next.config).
 * Once DNS points at this server, fetching that path over the custom host returns the
 * token for that host — which is the HTTP half of domain verification.
 */
export async function GET(request: Request) {
  const host = requestHost(request.headers);
  if (!host) {
    return new NextResponse('no host', { status: 400, headers: { 'content-type': 'text/plain' } });
  }

  const domain = await prisma.customDomain
    .findUnique({ where: { host }, select: { verifyToken: true, status: true } })
    .catch(() => null);

  if (!domain) {
    return new NextResponse('unknown host', { status: 404, headers: { 'content-type': 'text/plain' } });
  }

  return new NextResponse(`qr-altrix-verify=${domain.verifyToken}\n`, {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}
