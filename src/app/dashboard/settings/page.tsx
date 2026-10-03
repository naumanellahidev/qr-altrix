import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { ROLE_LABELS } from '@/lib/rbac';
import { PageHeader } from '@/components/ui/page-header';
import { SettingsView } from '@/components/dashboard/settings-view';

export const metadata: Metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const auth = await requireAuth('/dashboard/settings');

  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: auth.workspace.id },
    select: { id: true, name: true, slug: true, storageUsed: true, tracking: true, brandColors: true },
  });

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your profile, how dates and numbers are shown, security, and workspace-wide options."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
      />

      <SettingsView
        user={{
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
          createdAt: auth.user.createdAt.toISOString(),
          hasPassword: Boolean(auth.user.passwordHash),
        }}
        workspace={{
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          role: ROLE_LABELS[auth.role],
          storageUsedBytes: Number(workspace.storageUsed),
          tracking: (workspace.tracking ?? null) as { ga4?: string; metaPixel?: string; gtm?: string } | null,
          brandColors: Array.isArray(workspace.brandColors) ? (workspace.brandColors as string[]) : [],
          canDeleteOwnAccount: auth.membership.canDeleteOwnAccount,
          canManage: can(auth.role, 'settings.manage'),
        }}
      />
    </>
  );
}
