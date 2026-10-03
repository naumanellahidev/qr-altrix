import { z } from 'zod';
import { verifyPassword } from '@/lib/hash';
import { hashIp, visitorFingerprint } from '@/lib/hash';
import { parseClient, requestHost } from '@/lib/request';
import { resolveQr } from '@/lib/routing/resolve';
import { isPasswordVerified, markPasswordVerified } from '@/lib/routing/password';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { enqueue } from '@/lib/queue';
import { fail, ok, readJson, tooMany, withApi } from '@/lib/api/respond';
import { ipKey } from '@/lib/api/actor';

const schema = z.object({
  code: z.string().min(1).max(80),
  password: z.string().min(1).max(200),
});

/** Checks the password on a protected code and remembers it for 12 hours. */
export const POST = withApi(async (request: Request) => {
  const limit = await rateLimit(ipKey(request, 'unlock'), 20, 300);
  if (!limit.allowed) {
    return tooMany('Too many attempts. Wait a few minutes and try again.', rateLimitHeaders(limit));
  }

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail('Enter the password', 400);

  const qr = await resolveQr({ host: requestHost(request.headers), code: parsed.data.code });
  if (!qr || !qr.passwordHash) return fail('This code is not password protected', 400);

  if (await isPasswordVerified(qr.id, qr.passwordHash)) {
    return ok({ unlocked: true });
  }

  const valid = await verifyPassword(parsed.data.password, qr.passwordHash);
  if (!valid) {
    const client = parseClient(request.headers);
    void enqueue('scan.record', {
      qrCodeId: qr.id,
      workspaceId: qr.workspaceId,
      kind: 'PASSWORD_FAILED',
      ipHash: hashIp(client.ip),
      visitorHash: visitorFingerprint([hashIp(client.ip), client.userAgent, qr.id]),
      country: client.country,
      deviceType: client.deviceType,
      browser: client.browser,
      os: client.os,
      language: client.language,
      referrer: client.referrer,
      scannedAt: new Date().toISOString(),
    });
    return fail('That password is not right.', 401, { fields: { password: 'Incorrect password' } });
  }

  await markPasswordVerified(qr.id, qr.passwordHash);
  return ok({ unlocked: true });
});
