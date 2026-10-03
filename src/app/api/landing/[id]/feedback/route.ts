import { prisma } from '@/lib/db';
import { feedbackSubmissionSchema } from '@/lib/validation';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { created, fail, readJson, tooMany, withApi } from '@/lib/api/respond';
import { ipKey } from '@/lib/api/actor';
import { hashIp } from '@/lib/hash';
import { clientIp, parseClient } from '@/lib/request';
import { deliverWebhookEvent } from '@/lib/jobs/webhook';

/**
 * Receives a feedback form submission from a hosted FEEDBACK page. Submissions are
 * stored as scan events with a meta payload, keeping one timeline per code.
 */
export const POST = withApi(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;

  const limit = await rateLimit(ipKey(request, `feedback:${id}`), 10, 300);
  if (!limit.allowed) return tooMany('Thanks — you have already sent feedback recently.', rateLimitHeaders(limit));

  const parsed = feedbackSubmissionSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail('Choose a rating before sending', 400);

  const qr = await prisma.qRCode.findUnique({
    where: { id },
    select: { id: true, workspaceId: true, type: true, status: true, name: true },
  });
  if (!qr || qr.type !== 'FEEDBACK') return fail('Not found', 404);
  if (qr.status !== 'ACTIVE') return fail('This form is closed', 410);

  const client = parseClient(request.headers);

  await prisma.scanEvent.create({
    data: {
      qrCodeId: qr.id,
      workspaceId: qr.workspaceId,
      kind: 'SCAN',
      ipHash: hashIp(clientIp(request.headers)),
      country: client.country,
      deviceType: client.deviceType,
      browser: client.browser,
      os: client.os,
      language: client.language,
      hourOfDay: new Date().getUTCHours(),
      meta: {
        feedback: {
          rating: parsed.data.rating,
          comment: parsed.data.comment ?? null,
          email: parsed.data.email || null,
        },
      } as object,
    },
  });

  await deliverWebhookEvent(qr.workspaceId, 'feedback.received', {
    qrCodeId: qr.id,
    qrName: qr.name,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
    email: parsed.data.email || null,
  }).catch(() => undefined);

  return created({ received: true });
});
