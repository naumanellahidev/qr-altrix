import { prisma } from '@/lib/db';
import { hashToken } from '@/lib/hash';
import { getAuthContext, createEmailVerificationToken } from '@/lib/auth';
import { logSecurity } from '@/lib/audit';
import { sendMail, verificationEmail } from '@/lib/mailer';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';

/** Confirms an email address from the link in the verification message. */
export const POST = withApi(async (request: Request) => {
  const body = await readJson<{ token?: string; resend?: boolean }>(request);

  if (body.resend) {
    const context = await getAuthContext();
    if (!context) return fail('Sign in to resend the verification email', 401);
    if (context.user.emailVerifiedAt) return ok({ alreadyVerified: true });

    const token = await createEmailVerificationToken(context.user.id);
    void sendMail(verificationEmail(context.user.email, token));
    return ok({ sent: true });
  }

  const token = (body.token ?? '').trim();
  if (!token) return fail('This verification link is incomplete', 400);

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return fail('This verification link has expired. Request a new one from Settings.', 400);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: record.user.emailVerifiedAt ?? new Date() },
    }),
    prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  await logSecurity({
    type: 'EMAIL_VERIFIED',
    userId: record.userId,
    email: record.user.email,
    headers: request.headers,
  });

  return ok({ verified: true, email: record.user.email });
});
