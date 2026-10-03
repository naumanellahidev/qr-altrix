import { NextResponse, type NextRequest } from 'next/server';

/**
 * Custom-domain routing.
 *
 * A request to `links.yourbrand.com/spring-sale` has to reach the scan handler, while
 * requests to the platform host keep working as normal. The domain itself is verified in
 * the scan handler against the database — middleware only reshapes the path, because it
 * runs on the edge runtime with no database access.
 */

const PLATFORM_PREFIXES = [
  'api', 'dashboard', 'admin', 'login', 'signup', 'logout', 'q', 'r', 'l', 'p', 'inactive',
  'verify-email', 'reset-password', 'forgot-password', 'invite', 'legal', 'developers',
  'support', 'report-abuse', '_next', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'icon.svg',
  '.well-known',
];

function hostnameOf(value: string | null | undefined): string {
  if (!value) return '';
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return value.toLowerCase();
  }
}

export function middleware(request: NextRequest) {
  const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '')
    .split(':')[0]
    .toLowerCase();

  const appHost = hostnameOf(process.env.APP_URL);
  const shortHost = hostnameOf(process.env.SHORT_URL_BASE) || appHost;
  const isPlatformHost =
    !host || host === appHost || host === shortHost || host === 'localhost' || host.endsWith('.localhost');

  if (isPlatformHost) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);

  // The root of a custom domain shows a neutral page rather than the marketing site.
  if (segments.length === 0) {
    return NextResponse.rewrite(new URL('/inactive/root?reason=domain_root', request.url));
  }

  const first = segments[0].toLowerCase();
  if (PLATFORM_PREFIXES.includes(first)) return NextResponse.next();

  // Everything else on a custom domain is treated as a short link slug.
  if (segments.length === 1) {
    const target = new URL(`/q/${encodeURIComponent(segments[0])}`, request.url);
    target.search = request.nextUrl.search;
    return NextResponse.rewrite(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next internals and files with an extension; everything else is considered.
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.[a-zA-Z0-9]{2,5}$).*)',
  ],
};
