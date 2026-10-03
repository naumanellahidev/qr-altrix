import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { notificationSchema, profileSchema, trackingSchema } from '@/lib/validation';
import { logActivity } from '@/lib/audit';

const workspaceSchema = z.object({
  name: z.string().trim().min(1, 'Name the workspace').max(80).optional(),
  brandColors: z.array(z.string().regex(/^#([0-9a-fA-F]{6})$/)).max(12).optional(),
});

const bodySchema = z.discriminatedUnion('section', [
  z.object({ section: z.literal('profile') }).merge(profileSchema),
  z.object({ section: z.literal('notifications') }).merge(notificationSchema),
  z.object({ section: z.literal('tracking') }).merge(trackingSchema),
  z.object({ section: z.literal('workspace') }).merge(workspaceSchema),
]);

/** One endpoint for every Settings tab, split by `section`. */
export const PATCH = withApi(async (request: Request) => {
  const auth = await requireAuth();
  const parsed = bodySchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Check the submitted values', 400);
  }

  switch (parsed.data.section) {
    case 'profile': {
      const { section: _section, ...data } = parsed.data;
      const user = await prisma.user.update({
        where: { id: auth.user.id },
        data: {
          name: data.name ?? auth.user.name,
          surname: data.surname ?? auth.user.surname,
          phone: data.phone ?? auth.user.phone,
          locale: data.locale ?? auth.user.locale,
          timezone: data.timezone ?? auth.user.timezone,
          dateFormat: data.dateFormat ?? auth.user.dateFormat,
          hour12: data.hour12 ?? auth.user.hour12,
          thousandsSep: data.thousandsSep ?? auth.user.thousandsSep,
          theme: data.theme ?? auth.user.theme,
        },
      });
      void logActivity({
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
        action: 'settings.profile.updated',
        meta: { fields: Object.keys(data) },
      });
      return ok({
        data: {
          name: user.name,
          surname: user.surname,
          phone: user.phone,
          locale: user.locale,
          timezone: user.timezone,
          dateFormat: user.dateFormat,
          hour12: user.hour12,
          thousandsSep: user.thousandsSep,
          theme: user.theme,
        },
      });
    }

    case 'notifications': {
      const user = await prisma.user.update({
        where: { id: auth.user.id },
        data: {
          notifyProduct: parsed.data.notifyProduct,
          notifySecurity: parsed.data.notifySecurity,
          notifyScanDigest: parsed.data.notifyScanDigest,
        },
      });
      return ok({
        data: {
          notifyProduct: user.notifyProduct,
          notifySecurity: user.notifySecurity,
          notifyScanDigest: user.notifyScanDigest,
        },
      });
    }

    case 'tracking': {
      if (!can(auth.role, 'settings.manage')) return fail('Your role cannot change tracking settings', 403);
      const { section: _section, ...tracking } = parsed.data;
      const workspace = await prisma.workspace.update({
        where: { id: auth.workspace.id },
        data: { tracking: tracking as object },
      });
      void logActivity({
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
        action: 'settings.tracking.updated',
        meta: { providers: Object.entries(tracking).filter(([, v]) => v).map(([k]) => k) },
      });
      return ok({ data: workspace.tracking });
    }

    case 'workspace': {
      if (!can(auth.role, 'settings.manage')) return fail('Your role cannot change workspace settings', 403);
      const workspace = await prisma.workspace.update({
        where: { id: auth.workspace.id },
        data: {
          name: parsed.data.name ?? auth.workspace.name,
          brandColors:
            parsed.data.brandColors === undefined ? undefined : (parsed.data.brandColors as object),
        },
      });
      return ok({ data: { name: workspace.name, brandColors: workspace.brandColors } });
    }

    default:
      return fail('Unknown settings section', 400);
  }
});

/** Returns everything the Settings screens need in one request. */
export const GET = withApi(async () => {
  const auth = await requireAuth();
  const storage = await prisma.workspace.findUnique({
    where: { id: auth.workspace.id },
    select: { storageUsed: true, tracking: true, brandColors: true, name: true, slug: true },
  });

  return ok({
    data: {
      user: {
        id: auth.user.id,
        email: auth.user.email,
        name: auth.user.name,
        surname: auth.user.surname,
        phone: auth.user.phone,
        locale: auth.user.locale,
        timezone: auth.user.timezone,
        dateFormat: auth.user.dateFormat,
        hour12: auth.user.hour12,
        thousandsSep: auth.user.thousandsSep,
        theme: auth.user.theme,
        emailVerified: Boolean(auth.user.emailVerifiedAt),
        twoFactorEnabled: auth.user.twoFactorEnabled,
        notifyProduct: auth.user.notifyProduct,
        notifySecurity: auth.user.notifySecurity,
        notifyScanDigest: auth.user.notifyScanDigest,
        isPlatformAdmin: auth.user.isPlatformAdmin,
        createdAt: auth.user.createdAt,
      },
      workspace: {
        id: auth.workspace.id,
        name: storage?.name ?? auth.workspace.name,
        slug: storage?.slug ?? auth.workspace.slug,
        role: auth.role,
        storageUsedBytes: Number(storage?.storageUsed ?? 0),
        tracking: storage?.tracking ?? null,
        brandColors: storage?.brandColors ?? null,
        canDeleteOwnAccount: auth.membership.canDeleteOwnAccount,
      },
    },
  });
});
