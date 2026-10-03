import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { createAccount, ensureWorkspace, startSession } from '@/lib/auth';
import { readDraftSessionId } from '@/lib/auth/session';
import { claimDraft } from '@/lib/drafts';
import { logSecurity } from '@/lib/audit';
import { getSettings } from '@/lib/settings';
import { logger } from '@/lib/logger';
import { OAUTH_STATE_COOKIE } from '@/lib/auth/oauth';

interface GoogleTokenResponse {
  access_token?: string;
  id_token?: string;
  error?: string;
}

interface GoogleProfile {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

function redirectWithError(reason: string) {
  return NextResponse.redirect(`${env.appUrl}/login?error=${encodeURIComponent(reason)}`);
}

export async function GET(request: Request) {
  if (!env.google.enabled) return redirectWithError('google_disabled');

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (url.searchParams.get('error')) return redirectWithError('google_cancelled');
  if (!code || !state) return redirectWithError('google_invalid');

  const store = await cookies();
  const stored = store.get(OAUTH_STATE_COOKIE)?.value ?? '';
  store.set(OAUTH_STATE_COOKIE, '', { path: '/', maxAge: 0 });

  const [expectedState, next = '/dashboard'] = stored.split('|');
  if (!expectedState || expectedState !== state) return redirectWithError('google_state');

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.google.clientId,
        client_secret: env.google.clientSecret,
        redirect_uri: `${env.appUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const tokens = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenResponse.ok || !tokens.access_token) return redirectWithError('google_token');

    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { authorization: `Bearer ${tokens.access_token}` },
      signal: AbortSignal.timeout(10_000),
    });
    const profile = (await profileResponse.json()) as GoogleProfile;
    if (!profileResponse.ok || !profile.email) return redirectWithError('google_profile');

    const email = profile.email.toLowerCase();
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: profile.sub }, { email }] },
    });

    const settings = await getSettings();

    if (!user) {
      if (!settings.allowSignups) return redirectWithError('signups_closed');
      const account = await createAccount({
        email,
        name: profile.given_name ?? profile.name ?? null,
        surname: profile.family_name ?? null,
        googleId: profile.sub,
        emailVerified: Boolean(profile.email_verified),
      });
      user = account.user;
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId ?? profile.sub,
          emailVerifiedAt: user.emailVerifiedAt ?? (profile.email_verified ? new Date() : null),
          avatarUrl: user.avatarUrl ?? profile.picture ?? null,
          name: user.name ?? profile.given_name ?? null,
        },
      });
    }

    if (user.isDisabled) return redirectWithError('account_disabled');

    const workspace = await ensureWorkspace(user.id);
    await startSession(user.id, workspace.id);

    const draftSessionId = await readDraftSessionId();
    const qrCodeId = await claimDraft({
      sessionId: draftSessionId,
      userId: user.id,
      workspaceId: workspace.id,
      headers: request.headers,
    });

    await logSecurity({
      type: 'LOGIN',
      userId: user.id,
      workspaceId: workspace.id,
      email: user.email,
      headers: request.headers,
      meta: { via: 'google', claimedDraft: Boolean(qrCodeId) },
    });

    const destination = qrCodeId ? `/dashboard/codes/${qrCodeId}?download=1` : next;
    const safeDestination = destination.startsWith('/') ? destination : '/dashboard';
    return NextResponse.redirect(`${env.appUrl}${safeDestination}`);
  } catch (error) {
    logger.error('google oauth failed', { error: (error as Error).message });
    return redirectWithError('google_failed');
  }
}
