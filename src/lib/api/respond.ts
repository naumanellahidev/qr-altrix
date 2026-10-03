import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { fieldErrors } from '../validation';
import { QrValidationError } from '../qr/service';
import { logger } from '../logger';

/** Uniform JSON envelope for every API route, including the public v1 API. */

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, ...(data as object) }, { status: 200, ...init });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json({ ok: true, ...(data as object) }, { status: 201 });
}

export function fail(
  message: string,
  status = 400,
  extra?: { fields?: Record<string, string>; code?: string; headers?: Record<string, string> },
): NextResponse {
  return NextResponse.json(
    { ok: false, error: message, ...(extra?.fields ? { fields: extra.fields } : {}), ...(extra?.code ? { code: extra.code } : {}) },
    { status, headers: extra?.headers },
  );
}

export const unauthorized = (message = 'Sign in to continue') => fail(message, 401);
export const forbidden = (message = 'You do not have permission to do that') => fail(message, 403);
export const notFound = (message = 'Not found') => fail(message, 404);
export const tooMany = (message = 'Too many requests — slow down a little', headers?: Record<string, string>) =>
  fail(message, 429, { headers });

/**
 * Wraps a route handler so validation problems become 400s with field errors and
 * unexpected failures are logged once and reported without leaking internals.
 */
export function withApi<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Routes share requireAuth()/requirePermission() with pages, and those call Next's
      // redirect(), which works by throwing. In an API route that must become a JSON
      // status, not a 500: a redirect to /login means "not signed in", anything else
      // means "signed in but not allowed".
      const digest = (error as { digest?: unknown } | null)?.digest;
      if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
        const target = digest.split(';')[2] ?? '';
        return target.startsWith('/login')
          ? fail('Sign in to continue', 401)
          : fail('You do not have permission to do that', 403);
      }
      if (error instanceof ZodError) {
        const fields = fieldErrors(error);
        return fail(Object.values(fields)[0] ?? 'Please check the highlighted fields', 400, { fields });
      }
      if (error instanceof QrValidationError) {
        const fields = error.errors;
        return fail(Object.values(fields)[0] ?? error.message, 400, { fields });
      }
      const err = error as Error & { code?: string };
      // Prisma unique-constraint violations are a user error, not a crash.
      if (err.code === 'P2002') {
        return fail('That value is already in use', 409);
      }
      if (err.code === 'P2025') {
        return notFound();
      }
      logger.error('api route failed', { error: err.message, stack: err.stack?.split('\n').slice(0, 4).join(' | ') });
      return fail('Something went wrong on our side. Please try again.', 500);
    }
  };
}

export async function readJson<T = unknown>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

/** Serves a generated file with caching and a download filename. */
export function fileResponse(
  body: Buffer,
  options: { contentType: string; filename?: string; download?: boolean; maxAge?: number },
): NextResponse {
  const headers = new Headers({
    'content-type': options.contentType,
    'content-length': String(body.byteLength),
    'cache-control': options.maxAge ? `public, max-age=${options.maxAge}` : 'no-store',
  });
  if (options.filename) {
    headers.set(
      'content-disposition',
      `${options.download === false ? 'inline' : 'attachment'}; filename="${options.filename.replace(/"/g, '')}"`,
    );
  }
  return new NextResponse(new Uint8Array(body), { status: 200, headers });
}
