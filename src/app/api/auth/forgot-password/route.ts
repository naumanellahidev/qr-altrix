import { prisma } from '@/lib/db';
import { createPasswordResetToken } from '@/lib/auth';
import { logSecurity } from '@/lib/audit';
import { passwordResetEmail, sendMail } from '@/lib/mailer';
import { getSettings } from '@/lib/settings';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { forgotPasswordSchema } from '@/lib/validation';
import { fail, ok, readJson, tooMany, withApi } from '@/lib/api/respond';
import { ipKey } from '@/lib/api/actor';

export const POST = withApi(async (request: Request) => {
  const settings = await getSettings();
  const limit = await rateLimit(ipKey(request, 'forgot'), settings.rateLimitAuthPerMin, 60);
  if (!limit.allowed) return tooMany('Too many requests. Try again in a minute.', rateLimitHeaders(limit));

  const parsed = forgotPasswordSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail('Enter the email address on your account', 400);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Always answer the same way so the endpoint cannot be used to discover accounts.
  if (user && !user.isDisabled) {
    const token = await createPasswordResetToken(user.id);
    await logSecurity({
      type: 'PASSWORD_RESET_REQUESTED',
      userId: user.id,
      email: user.email,
      headers: request.headers,
    });
    void sendMail(passwordResetEmail(user.email, token));
  }

  return ok({ sent: true });
});
