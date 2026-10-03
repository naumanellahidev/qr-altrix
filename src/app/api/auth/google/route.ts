import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';
import { randomToken } from '@/lib/utils';
import { OAUTH_STATE_COOKIE, OAUTH_STATE_MAX_AGE_SECONDS } from '@/lib/auth/oauth';

/** Starts the Google sign-in flow. */
export async function GET(request: Request) {
  if (!env.google.enabled) {
    return NextResponse.redirect(`${env.appUrl}/login?error=google_disabled`);
  }

  const url = new URL(request.url);
  const next = url.searchParams.get('next') ?? '/dashboard';
  const state = randomToken(16);

  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, `${state}|${next}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.appUrl.startsWith('https://'),
    path: '/',
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  });

  const authorize = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorize.searchParams.set('client_id', env.google.clientId);
  authorize.searchParams.set('redirect_uri', `${env.appUrl}/api/auth/google/callback`);
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('scope', 'openid email profile');
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('access_type', 'online');
  authorize.searchParams.set('prompt', 'select_account');

  return NextResponse.redirect(authorize.toString());
}
