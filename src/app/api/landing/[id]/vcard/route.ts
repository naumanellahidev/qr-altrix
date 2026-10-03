import { prisma } from '@/lib/db';
import { buildVcardPayload } from '@/lib/qr/payload';
import { fail, fileResponse, withApi } from '@/lib/api/respond';

/** Serves a .vcf file so a vCard Plus page can save straight into the phonebook. */
export const GET = withApi(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;

  const qr = await prisma.qRCode.findUnique({
    where: { id },
    select: { id: true, name: true, type: true, status: true, content: true },
  });
  if (!qr || (qr.type !== 'VCARD_PLUS' && qr.type !== 'VCARD')) return fail('Not found', 404);
  if (qr.status !== 'ACTIVE') return fail('This contact card is not active', 410);

  const content = (qr.content ?? {}) as Record<string, unknown>;
  const vcard = buildVcardPayload({
    firstName: content.firstName,
    lastName: content.lastName,
    company: content.company,
    jobTitle: content.jobTitle,
    phone: content.phone,
    phoneWork: content.phoneWork,
    email: content.email,
    website: content.website,
    street: content.address,
    note: content.about,
  });

  const base = `${String(content.firstName ?? '')}-${String(content.lastName ?? '')}`.replace(/^-|-$/g, '') || 'contact';

  return fileResponse(Buffer.from(vcard, 'utf8'), {
    contentType: 'text/vcard; charset=utf-8',
    filename: `${base.toLowerCase().replace(/[^a-z0-9-]/g, '')}.vcf`,
  });
});
