import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { requirePermission } from '@/lib/auth';
import { findQrForWorkspace } from '@/lib/qr/service';
import { shortLinkFor } from '@/lib/routing/resolve';
import { DEFAULT_DESIGN, type QrDesign } from '@/lib/qr/types';
import { PageHeader } from '@/components/ui/page-header';
import { Alert } from '@/components/ui/feedback';
import { Builder, type SmartRule } from '@/components/dashboard/builder';

export const metadata: Metadata = { title: 'Edit QR code' };
export const dynamic = 'force-dynamic';

export default async function EditCodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission('qr.update', `/dashboard/codes/${id}/edit`);
  const qr = await findQrForWorkspace(id, auth.workspace.id);
  if (!qr) notFound();

  const [folders, templates, domains] = await Promise.all([
    prisma.folder.findMany({ where: { workspaceId: auth.workspace.id }, orderBy: { name: 'asc' } }),
    prisma.qRTemplate.findMany({
      where: { workspaceId: auth.workspace.id },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    }),
    prisma.customDomain.findMany({ where: { workspaceId: auth.workspace.id }, orderBy: { host: 'asc' } }),
  ]);

  const utm = (qr.utm ?? null) as {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    custom?: { key: string; value: string }[];
  } | null;

  const smartRules: SmartRule[] = qr.destinations
    .filter((destination) => destination.kind !== 'DEFAULT')
    .map((destination) => ({
      kind: destination.kind as SmartRule['kind'],
      matchValue: destination.matchValue ?? '',
      url: destination.url,
      priority: destination.priority,
    }));

  return (
    <>
      <PageHeader
        title={`Edit “${qr.name}”`}
        description="Change anything except the QR type. The printed pattern keeps working throughout."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My QR codes', href: '/dashboard/codes' },
          { label: qr.name, href: `/dashboard/codes/${qr.id}` },
          { label: 'Edit' },
        ]}
      />

      {qr.status === 'ADMIN_DISABLED' ? (
        <Alert tone="error" className="mb-5" title="This code is disabled">
          {qr.adminDisabledReason ?? 'A platform administrator disabled this code, so it cannot be edited.'}
        </Alert>
      ) : null}

      <Builder
        mode="edit"
        folders={folders.map((folder) => ({ id: folder.id, name: folder.name }))}
        templates={templates.map((template) => ({
          id: template.id,
          name: template.name,
          design: (template.design ?? {}) as Partial<QrDesign>,
          isDefault: template.isDefault,
        }))}
        domains={domains.map((domain) => ({
          id: domain.id,
          name: domain.host,
          host: domain.host,
          status: domain.status,
        }))}
        brandColors={Array.isArray(auth.workspace.brandColors) ? (auth.workspace.brandColors as string[]) : []}
        shortUrlBase={env.shortUrlBase}
        initial={{
          id: qr.id,
          name: qr.name,
          type: qr.type,
          kind: qr.kind,
          content: (qr.content ?? {}) as Record<string, unknown>,
          design: { ...DEFAULT_DESIGN, ...((qr.design ?? {}) as Partial<QrDesign>) },
          folderId: qr.folderId,
          customDomainId: qr.customDomainId,
          slug: qr.slug,
          utm,
          smartRules,
          passwordProtected: Boolean(qr.passwordHash),
          scheduleEnabled: qr.scheduleEnabled,
          scheduleStart: qr.scheduleStart?.toISOString() ?? null,
          scheduleEnd: qr.scheduleEnd?.toISOString() ?? null,
          scanLimitEnabled: qr.scanLimitEnabled,
          scanLimitMax: qr.scanLimitMax,
          shortLink: qr.kind === 'DYNAMIC' ? shortLinkFor(qr) : null,
          scanCount: qr.scanCount,
        }}
      />
    </>
  );
}
