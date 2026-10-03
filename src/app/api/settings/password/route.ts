import { prisma } from '@/lib/db';
import { requireAuth, startSession } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/hash';
import { changePasswordSchema } from '@/lib/validation';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { logSecurity } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';

/** Changing the password signs out every other device. */
export const POST = withApi(async (request: Request) => {
  const auth = await requireAuth();

  const limit = await rateLimit(`password:${auth.user.id}`, 10, 300);
  if (!limit.allowed) return fail('Too many attempts. Try again in a few minutes.', 429);

  const parsed = changePasswordSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    const message = parsed.error.issues.find((issue) => issue.path[0] === 'newPassword')?.message;
    return fail(message ?? 'Check the passwords you entered', 400, {
      fields: message ? { newPassword: message } : undefined,
    });
  }

  if (!auth.user.passwordHash) {
    // Google-only accounts set a password for the first time.
    const passwordHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({ where: { id: auth.user.id }, data: { passwordHash } });
    await logSecurity({
      type: 'PASSWORD_CHANGED',
      userId: auth.user.id,
      workspaceId: auth.workspace.id,
      headers: request.headers,
      meta: { firstTime: true },
    });
    return ok({ changed: true, firstTime: true });
  }

  const valid = await verifyPassword(parsed.data.currentPassword, auth.user.passwordHash);
  if (!valid) {
    return fail('Your current password is not right', 400, { fields: { currentPassword: 'Incorrect password' } });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  const updated = await prisma.user.update({
    where: { id: auth.user.id },
    data: { passwordHash, sessionVersion: { increment: 1 } },
  });

  // Re-issue this session so the user stays signed in here.
  await startSession(updated.id, auth.workspace.id);

  await logSecurity({
    type: 'PASSWORD_CHANGED',
    userId: auth.user.id,
    workspaceId: auth.workspace.id,
    headers: request.headers,
  });

  return ok({ changed: true, otherSessionsSignedOut: true });
});
