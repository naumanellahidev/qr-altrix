import { prisma } from '@/lib/db';
import { hashPassword, hashToken } from '@/lib/hash';
import { logSecurity } from '@/lib/audit';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { resetPasswordSchema } from '@/lib/validation';
import { fail, ok, readJson, tooMany, withApi } from '@/lib/api/respond';
import { ipKey } from '@/lib/api/actor';

export const POST = withApi(async (request: Request) => {
  const limit = await rateLimit(ipKey(request, 'reset'), 12, 60);
  if (!limit.allowed) return tooMany('Too many attempts. Try again in a minute.', rateLimitHeaders(limit));

  const parsed = resetPasswordSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    const message = parsed.error.issues.find((issue) => issue.path[0] === 'password')?.message;
    return fail(message ?? 'That reset link is not valid', 400, {
      fields: message ? { password: message } : undefined,
    });
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
    include: { user: true },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return fail('This reset link has expired. Request a new one.', 400);
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        // Bumping the session version signs out every other device.
        sessionVersion: { increment: 1 },
        emailVerifiedAt: record.user.emailVerifiedAt ?? new Date(),
      },
    }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId, usedAt: null, id: { not: record.id } },
    }),
  ]);

  await logSecurity({
    type: 'PASSWORD_RESET_COMPLETED',
    userId: record.userId,
    email: record.user.email,
    headers: request.headers,
  });

  return ok({ reset: true, email: record.user.email });
});
