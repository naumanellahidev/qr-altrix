import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdminApi } from '@/lib/api/admin';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { logActivity, logSecurity } from '@/lib/audit';
import { abuseDisabledEmail, sendMail } from '@/lib/mailer';

const schema = z.object({
  action: z.enum(['disable', 'enable']),
  reason: z.string().trim().max(400).optional(),
  notifyOwner: z.boolean().optional(),
});

/**
 * Admin abuse control. This is the only path that can stop somebody else's QR code, and
 * it always records who did it and why.
 */
export const POST = withApi(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const guard = await requireAdminApi();
  if (!guard.ok) return fail(guard.error, guard.status);

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail('Choose disable or enable, and give a reason', 400);

  const qr = await prisma.qRCode.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      workspaceId: true,
      workspace: { select: { name: true, owner: { select: { email: true } } } },
    },
  });
  if (!qr) return fail('QR code not found', 404);

  if (parsed.data.action === 'disable') {
    if (!parsed.data.reason) {
      return fail('A reason is required so the owner can be told why', 400, { fields: { reason: 'Required' } });
    }
    await prisma.qRCode.update({
      where: { id },
      data: { status: 'ADMIN_DISABLED', adminDisabledReason: parsed.data.reason },
    });
    await logSecurity({
      type: 'ADMIN_ABUSE_DISABLE',
      userId: guard.auth.user.id,
      workspaceId: qr.workspaceId,
      headers: request.headers,
      meta: { qrCodeId: id, name: qr.name, reason: parsed.data.reason },
    });
    if (parsed.data.notifyOwner !== false && qr.workspace.owner?.email) {
      void sendMail(abuseDisabledEmail(qr.workspace.owner.email, qr.name, parsed.data.reason));
    }
  } else {
    await prisma.qRCode.update({
      where: { id },
      data: { status: 'ACTIVE', adminDisabledReason: null },
    });
    await logSecurity({
      type: 'ADMIN_ABUSE_ENABLE',
      userId: guard.auth.user.id,
      workspaceId: qr.workspaceId,
      headers: request.headers,
      meta: { qrCodeId: id, name: qr.name },
    });
  }

  await logActivity({
    userId: guard.auth.user.id,
    workspaceId: qr.workspaceId,
    action: `admin.qr.${parsed.data.action}`,
    entityType: 'QRCode',
    entityId: id,
    meta: { name: qr.name, reason: parsed.data.reason ?? null },
  });

  return ok({ data: { id, action: parsed.data.action } });
});
