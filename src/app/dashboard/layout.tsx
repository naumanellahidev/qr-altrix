import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { DashboardShell } from '@/components/dashboard/shell';

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s · QR ALTRIX' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAuth('/dashboard');

  const [codeCount, settings] = await Promise.all([
    prisma.qRCode.count({ where: { workspaceId: auth.workspace.id, status: { not: 'DELETED' } } }),
    getSettings().catch(() => null),
  ]);

  return (
    <DashboardShell
      user={{
        name: auth.user.name,
        email: auth.user.email,
        isPlatformAdmin: auth.user.isPlatformAdmin,
        emailVerified: Boolean(auth.user.emailVerifiedAt),
      }}
      workspace={{ id: auth.workspace.id, name: auth.workspace.name, role: auth.role }}
      workspaces={auth.memberships.map((membership) => ({
        id: membership.workspace.id,
        name: membership.workspace.name,
        role: membership.role,
      }))}
      codeCount={codeCount}
      expiryEnabled={Boolean(settings?.expiryEnabled)}
      maintenanceNote={settings?.maintenanceNote || null}
    >
      {children}
    </DashboardShell>
  );
}
