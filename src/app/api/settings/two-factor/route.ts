import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { verifyPassword } from '@/lib/hash';
import { env } from '@/lib/env';
import { generateRecoveryCodes, generateTotpSecret, totpUri, verifyTotp } from '@/lib/totp';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { logSecurity } from '@/lib/audit';
import { renderQrSvg } from '@/lib/qr/render';

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('begin') }),
  z.object({ action: z.literal('enable'), secret: z.string().min(16).max(64), code: z.string().min(6).max(6) }),
  z.object({ action: z.literal('disable'), password: z.string().max(200).optional(), code: z.string().max(12).optional() }),
]);

/**
 * Two-factor setup. The secret is only stored once a valid code proves the authenticator
 * app is working, so nobody can lock themselves out mid-setup.
 */
export const POST = withApi(async (request: Request) => {
  const auth = await requireAuth();
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail('That two-factor request is not valid', 400);

  if (parsed.data.action === 'begin') {
    if (auth.user.twoFactorEnabled) return fail('Two-factor authentication is already on', 400);
    const secret = generateTotpSecret();
    const uri = totpUri({ secret, email: auth.user.email, issuer: env.appName });
    // The QR for the authenticator app is drawn by our own renderer.
    const svg = renderQrSvg(uri, { margin: 2, bodyShape: 'square', errorCorrection: 'M' }, { size: 220, bare: true });
    return ok({ data: { secret, uri, svg } });
  }

  if (parsed.data.action === 'enable') {
    if (!verifyTotp(parsed.data.secret, parsed.data.code)) {
      return fail('That code is not right. Check your authenticator app and try again.', 400, {
        fields: { code: 'Incorrect code' },
      });
    }
    const recovery = generateRecoveryCodes();
    await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: parsed.data.secret,
        twoFactorRecovery: recovery.join(','),
      },
    });
    await logSecurity({
      type: 'TWO_FACTOR_ENABLED',
      userId: auth.user.id,
      workspaceId: auth.workspace.id,
      headers: request.headers,
    });
    return ok({ data: { enabled: true, recoveryCodes: recovery } });
  }

  // disable
  if (!auth.user.twoFactorEnabled) return ok({ data: { enabled: false } });

  const passwordOk = auth.user.passwordHash
    ? await verifyPassword(parsed.data.password ?? '', auth.user.passwordHash)
    : true;
  const codeOk = parsed.data.code
    ? verifyTotp(auth.user.twoFactorSecret ?? '', parsed.data.code)
    : false;

  if (!passwordOk && !codeOk) {
    return fail('Confirm with your password or a current authenticator code', 400, {
      fields: { password: 'Required to turn off two-factor' },
    });
  }

  await prisma.user.update({
    where: { id: auth.user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorRecovery: null },
  });
  await logSecurity({
    type: 'TWO_FACTOR_DISABLED',
    userId: auth.user.id,
    workspaceId: auth.workspace.id,
    headers: request.headers,
  });

  return ok({ data: { enabled: false } });
});
