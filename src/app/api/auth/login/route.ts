import { NextResponse } from 'next/server';
import { authenticate, ensureWorkspace, startSession } from '@/lib/auth';
import { readDraftSessionId } from '@/lib/auth/session';
import { claimDraft } from '@/lib/drafts';
import { logSecurity } from '@/lib/audit';
import { getSettings } from '@/lib/settings';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validation';
import { verifyTotp } from '@/lib/totp';
import { prisma } from '@/lib/db';
import { ok, fail, readJson, tooMany, withApi } from '@/lib/api/respond';
import { ipKey } from '@/lib/api/actor';

export const POST = withApi(async (request: Request) => {
  const settings = await getSettings();
  const limit = await rateLimit(ipKey(request, 'login'), settings.rateLimitAuthPerMin, 60);
  if (!limit.allowed) {
    return tooMany('Too many sign-in attempts. Wait a minute and try again.', rateLimitHeaders(limit));
  }

  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail('Enter your email and password', 400);
  }
  const { email, password, code } = parsed.data;

  // Per-account lockout, on top of the per-IP rate limit above: an attacker spreading
  // attempts across addresses still runs into this one.
  if (settings.lockoutAfterFailedAttempts > 0) {
    const since = new Date(Date.now() - 15 * 60_000);
    const recentFailures = await prisma.securityEvent.count({
      where: { type: 'LOGIN_FAILED', email, createdAt: { gte: since } },
    });

    if (recentFailures >= settings.lockoutAfterFailedAttempts) {
      // Logged once, as the threshold is crossed, so a sustained attack does not flood
      // the security history.
      if (recentFailures === settings.lockoutAfterFailedAttempts) {
        await logSecurity({
          type: 'ACCOUNT_LOCKED',
          email,
          headers: request.headers,
          meta: { failures: recentFailures, windowMinutes: 15 },
        });
      }
      return fail(
        'Too many failed attempts for this account. Wait 15 minutes, or reset your password to get back in.',
        429,
      );
    }
  }

  const result = await authenticate(email, password);

  if (!result.ok) {
    await logSecurity({
      type: 'LOGIN_FAILED',
      userId: result.user?.id ?? null,
      email,
      headers: request.headers,
      meta: { reason: result.reason },
    });

    if (result.reason === 'account_disabled') {
      return fail('This account has been disabled. Contact support if you think this is a mistake.', 403);
    }
    if (result.reason === 'password_not_set') {
      return fail('This account signs in with Google. Use the Google button above.', 400);
    }
    return fail('That email and password do not match.', 401, {
      fields: { password: 'Incorrect email or password' },
    });
  }

  if (result.requiresTwoFactor) {
    if (!code) {
      return NextResponse.json(
        { ok: false, error: 'Enter the 6-digit code from your authenticator app', requiresTwoFactor: true },
        { status: 401 },
      );
    }
    const user = await prisma.user.findUniqueOrThrow({ where: { id: result.user.id } });
    const valid = user.twoFactorSecret ? verifyTotp(user.twoFactorSecret, code) : false;
    const recoveryCodes = (user.twoFactorRecovery ?? '').split(',').filter(Boolean);
    const recoveryMatch = recoveryCodes.includes(code.trim().toUpperCase());

    if (!valid && !recoveryMatch) {
      await logSecurity({
        type: 'LOGIN_FAILED',
        userId: user.id,
        email,
        headers: request.headers,
        meta: { reason: 'bad_2fa_code' },
      });
      return fail('That code is not right. Check your authenticator app.', 401, {
        fields: { code: 'Incorrect code' },
      });
    }

    if (recoveryMatch) {
      // A recovery code is single-use.
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorRecovery: recoveryCodes.filter((value) => value !== code.trim().toUpperCase()).join(',') },
      });
    }
  }

  const workspace = result.workspaceId
    ? { id: result.workspaceId }
    : await ensureWorkspace(result.user.id);

  await startSession(result.user.id, workspace.id);

  const draftSessionId = await readDraftSessionId();
  const qrCodeId = await claimDraft({
    sessionId: draftSessionId,
    userId: result.user.id,
    workspaceId: workspace.id,
    headers: request.headers,
  });

  await logSecurity({
    type: 'LOGIN',
    userId: result.user.id,
    workspaceId: workspace.id,
    email,
    headers: request.headers,
    meta: { via: 'password', claimedDraft: Boolean(qrCodeId) },
  });

  return ok({ userId: result.user.id, workspaceId: workspace.id, claimedDraft: Boolean(qrCodeId), qrCodeId });
});

/** Returns the 2FA requirement as a structured flag the client can act on. */
export const dynamic = 'force-dynamic';
