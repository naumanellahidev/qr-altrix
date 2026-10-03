import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { PageHeader } from '@/components/ui/page-header';
import { BulkWizard, type BulkJobRow } from '@/components/dashboard/bulk-wizard';

export const metadata: Metadata = { title: 'Bulk generation' };
export const dynamic = 'force-dynamic';

export default async function BulkPage() {
  const auth = await requirePermission('bulk.run', '/dashboard/bulk');

  const [folders, templates, domains, jobs, settings] = await Promise.all([
    prisma.folder.findMany({ where: { workspaceId: auth.workspace.id }, orderBy: { name: 'asc' } }),
    prisma.qRTemplate.findMany({ where: { workspaceId: auth.workspace.id }, orderBy: { name: 'asc' } }),
    prisma.customDomain.findMany({ where: { workspaceId: auth.workspace.id }, orderBy: { host: 'asc' } }),
    prisma.bulkJob.findMany({
      where: { workspaceId: auth.workspace.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    getSettings(),
  ]);

  const rows: BulkJobRow[] = jobs.map((job) => ({
    id: job.id,
    status: job.status,
    type: job.type,
    kind: job.kind,
    totalRows: job.totalRows,
    processedRows: job.processedRows,
    successRows: job.successRows,
    failedRows: job.failedRows,
    createdCount: job.createdQrIds.length,
    hasArchive: Boolean(job.zipPath),
    note: job.error,
    createdAt: job.createdAt.toISOString(),
    finishedAt: job.finishedAt?.toISOString() ?? null,
  }));

  return (
    <>
      <PageHeader
        title="Bulk generation"
        description="Turn a spreadsheet into hundreds of QR codes. Every row is validated before anything is written."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Bulk generation' }]}
      />

      <BulkWizard
        folders={folders.map((folder) => ({ id: folder.id, name: folder.name }))}
        templates={templates.map((template) => ({ id: template.id, name: template.name }))}
        domains={domains.map((domain) => ({ id: domain.id, host: domain.host, status: domain.status }))}
        jobs={rows}
        maxRows={settings.bulkMaxRows}
      />
    </>
  );
}
