import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { designFromRow } from '@/lib/qr/types';
import { PageHeader } from '@/components/ui/page-header';
import { TemplatesManager } from '@/components/dashboard/templates-manager';

export const metadata: Metadata = { title: 'Templates' };
export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const auth = await requireAuth('/dashboard/templates');

  const templates = await prisma.qRTemplate.findMany({
    where: { workspaceId: auth.workspace.id },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });

  return (
    <>
      <PageHeader
        title="Templates"
        description="Reusable designs. Set one as the default and every new QR code starts on brand."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Templates' }]}
      />

      <TemplatesManager
        templates={templates.map((template) => ({
          id: template.id,
          name: template.name,
          isDefault: template.isDefault,
          design: designFromRow(template.design),
          updatedAt: template.updatedAt.toISOString(),
        }))}
        canManage={can(auth.role, 'template.manage')}
        brandColors={Array.isArray(auth.workspace.brandColors) ? (auth.workspace.brandColors as string[]) : []}
      />
    </>
  );
}
