import { prisma } from '@/lib/db';
import { createAccount, startSession } from '@/lib/auth';
import { readDraftSessionId } from '@/lib/auth/session';
import { claimDraft } from '@/lib/drafts';
import { logSecurity } from '@/lib/audit';
import { sendMail, verificationEmail, welcomeEmail } from '@/lib/mailer';
import { getSettings } from '@/lib/settings';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { signupSchema } from '@/lib/validation';
import { created, fail, readJson, tooMany, withApi } from '@/lib/api/respond';
import { ipKey } from '@/lib/api/actor';

export const POST = withApi(async (request: Request) => {
  const settings = await getSettings();
  const limit = await rateLimit(ipKey(request, 'signup'), settings.rateLimitAuthPerMin, 60);
  if (!limit.allowed) return tooMany('Too many sign-up attempts. Try again in a minute.', rateLimitHeaders(limit));

  if (!settings.allowSignups) {
    return fail('New sign-ups are currently closed on this server.', 403);
  }

  const body = await readJson(request);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || 'form';
      if (!fields[key]) fields[key] = issue.message;
    }
    return fail(Object.values(fields)[0] ?? 'Please check the form', 400, { fields });
  }

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return fail('An account with this email already exists. Log in instead.', 409, {
      fields: { email: 'This email is already registered' },
    });
  }

  const { user, workspace, verificationToken } = await createAccount({ email, password, name });
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
    email,
    headers: request.headers,
    meta: { via: 'signup', claimedDraft: Boolean(qrCodeId) },
  });

  // Email delivery is best-effort: a missing SMTP server must not fail signup.
  if (verificationToken) {
    void sendMail(verificationEmail(email, verificationToken));
  }
  void sendMail(welcomeEmail(email));

  return created({
    userId: user.id,
    workspaceId: workspace.id,
    claimedDraft: Boolean(qrCodeId),
    qrCodeId,
    emailVerificationSent: Boolean(verificationToken),
  });
});
