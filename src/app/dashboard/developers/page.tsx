import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { requirePermission } from '@/lib/auth';
import { PageHeader } from '@/components/ui/page-header';
import { DevelopersView } from '@/components/dashboard/developers-view';

export const metadata: Metadata = { title: 'Developers & API' };
export const dynamic = 'force-dynamic';

export default async function DevelopersPage() {
  const auth = await requirePermission('apikey.manage', '/dashboard/developers');

  const [keys, webhooks] = await Promise.all([
    prisma.apiKey.findMany({
      where: { workspaceId: auth.workspace.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.webhook.findMany({ where: { workspaceId: auth.workspace.id }, orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <>
      <PageHeader
        title="Developers & API"
        description="Keys, webhooks and the REST reference. Everything the dashboard does, your code can do too."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Developers & API' }]}
      />

      <DevelopersView
        apiKeys={keys.map((key) => ({
          id: key.id,
          name: key.name,
          maskedKey: `qra_${key.prefix}_${'•'.repeat(12)}`,
          scopes: key.scopes,
          rateLimit: key.rateLimit,
          lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
          revokedAt: key.revokedAt?.toISOString() ?? null,
          createdAt: key.createdAt.toISOString(),
          createdBy: key.user?.name ?? key.user?.email ?? null,
        }))}
        webhooks={webhooks.map((hook) => ({
          id: hook.id,
          url: hook.url,
          events: hook.events,
          isActive: hook.isActive,
          lastStatus: hook.lastStatus,
          lastFiredAt: hook.lastFiredAt?.toISOString() ?? null,
          failureCount: hook.failureCount,
          secret: hook.secret,
        }))}
        appUrl={env.appUrl}
      />
    </>
  );
}
