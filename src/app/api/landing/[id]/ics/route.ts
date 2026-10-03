import { prisma } from '@/lib/db';
import { buildEventPayload } from '@/lib/qr/payload';
import { fail, fileResponse, withApi } from '@/lib/api/respond';

/** Serves an .ics invite for event pages, so "add to calendar" works on every phone. */
export const GET = withApi(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;

  const qr = await prisma.qRCode.findUnique({
    where: { id },
    select: { id: true, name: true, type: true, status: true, content: true },
  });
  if (!qr || (qr.type !== 'EVENT_PAGE' && qr.type !== 'EVENT' && qr.type !== 'CALENDAR')) {
    return fail('Not found', 404);
  }
  if (qr.status !== 'ACTIVE') return fail('This event is not active', 410);

  const content = (qr.content ?? {}) as Record<string, unknown>;
  const ics = buildEventPayload({
    title: content.title ?? qr.name,
    start: content.start,
    end: content.end,
    location: [content.venue, content.address].filter(Boolean).join(', '),
    description: content.description,
    url: content.ticketUrl,
  });

  return fileResponse(Buffer.from(ics, 'utf8'), {
    contentType: 'text/calendar; charset=utf-8',
    filename: `${String(content.title ?? qr.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) || 'event'}.ics`,
  });
});
