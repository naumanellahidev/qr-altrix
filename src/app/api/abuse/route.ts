import { prisma } from '@/lib/db';
import { abuseReportSchema } from '@/lib/validation';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { created, fail, readJson, tooMany, withApi } from '@/lib/api/respond';
import { ipKey } from '@/lib/api/actor';
import { getAuthContext } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Public abuse reporting. A report never changes a code's state — a platform admin
 * reviews it, so a competitor cannot take someone's printed code offline.
 */
export const POST = withApi(async (request: Request) => {
  const limit = await rateLimit(ipKey(request, 'abuse'), 10, 300);
  if (!limit.allowed) return tooMany('Too many reports from this address.', rateLimitHeaders(limit));

  const parsed = abuseReportSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Check the report details', 400);
  }

  const code = parsed.data.shortCode.trim().replace(/^https?:\/\/[^/]+\/(q|r)?\/?/, '');
  const qr = await prisma.qRCode.findFirst({
    where: { OR: [{ shortCode: code }, { slug: code }] },
    select: { id: true, name: true },
  });

  const auth = await getAuthContext().catch(() => null);

  const report = await prisma.abuseReport.create({
    data: {
      qrCodeId: qr?.id ?? null,
      reporterId: auth?.user.id ?? null,
      reporterEmail: parsed.data.reporterEmail || null,
      reason: parsed.data.reason,
      details: [parsed.data.details, qr ? null : `Reported code: ${parsed.data.shortCode}`]
        .filter(Boolean)
        .join('\n\n')
        .slice(0, 2000),
    },
  });

  logger.info('abuse report received', { reportId: report.id, matchedCode: Boolean(qr), reason: report.reason });

  return created({ reportId: report.id, matched: Boolean(qr) });
});
