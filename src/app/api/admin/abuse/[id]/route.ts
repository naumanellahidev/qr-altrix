import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdminApi } from '@/lib/api/admin';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { logActivity } from '@/lib/audit';

const schema = z.object({
  status: z.enum(['OPEN', 'REVIEWING', 'ACTIONED', 'DISMISSED']),
  resolution: z.string().trim().max(400).optional(),
});

export const PATCH = withApi(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const guard = await requireAdminApi();
  if (!guard.ok) return fail(guard.error, guard.status);

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail('Choose a status', 400);

  const report = await prisma.abuseReport.findUnique({ where: { id }, select: { id: true, qrCodeId: true } });
  if (!report) return fail('Report not found', 404);

  await prisma.abuseReport.update({
    where: { id },
    data: { status: parsed.data.status, resolution: parsed.data.resolution ?? null },
  });

  await logActivity({
    userId: guard.auth.user.id,
    action: 'admin.abuse.updated',
    entityType: 'AbuseReport',
    entityId: id,
    meta: { status: parsed.data.status, qrCodeId: report.qrCodeId },
  });

  return ok({ data: { id, status: parsed.data.status } });
});
