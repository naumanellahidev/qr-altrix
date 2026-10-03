import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { requirePermission } from '@/lib/auth';
import { readDraftSessionId } from '@/lib/auth/session';
import { getDraft } from '@/lib/drafts';
import { getTypeDef } from '@/lib/qr/catalog';
import { DEFAULT_DESIGN, type QrDesign } from '@/lib/qr/types';
import { PageHeader } from '@/components/ui/page-header';
import { Builder, type BuilderInitialValue } from '@/components/dashboard/builder';

export const metadata: Metadata = { title: 'New QR code' };
export const dynamic = 'force-dynamic';

export default async function NewQrPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; claim?: string; template?: string; folder?: string }>;
}) {
  const auth = await requirePermission('qr.create', '/dashboard/new');
  const query = await searchParams;

  const [folders, templates, domains, draftSessionId] = await Promise.all([
    prisma.folder.findMany({ where: { workspaceId: auth.workspace.id }, orderBy: { name: 'asc' } }),
    prisma.qRTemplate.findMany({
      where: { workspaceId: auth.workspace.id },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    }),
    prisma.customDomain.findMany({ where: { workspaceId: auth.workspace.id }, orderBy: { host: 'asc' } }),
    readDraftSessionId(),
  ]);

  // A code designed on the homepage before signing in is picked up here.
  const draft = query.claim === '1' ? await getDraft(draftSessionId).catch(() => null) : null;

  const requestedType = query.type && getTypeDef(query.type.toUpperCase()) ? query.type.toUpperCase() : null;
  const startType = draft?.type ?? requestedType ?? 'WEBSITE';
  const startDef = getTypeDef(startType);

  const initial: BuilderInitialValue | null = draft
    ? {
        name: draft.name ?? '',
        type: draft.type,
        kind: draft.kind,
        content: draft.content ?? {},
        design: { ...DEFAULT_DESIGN, ...((draft.design ?? {}) as Partial<QrDesign>) },
        folderId: query.folder ?? null,
      }
    : {
        name: '',
        type: startType,
        kind: (startDef?.kind ?? 'DYNAMIC') as 'STATIC' | 'DYNAMIC',
        content: {},
        design: { ...DEFAULT_DESIGN },
        folderId: query.folder ?? null,
      };

  const requestedTemplate = query.template
    ? templates.find((template) => template.id === query.template)
    : templates.find((template) => template.isDefault);
  if (requestedTemplate) {
    initial.design = { ...DEFAULT_DESIGN, ...((requestedTemplate.design ?? {}) as Partial<QrDesign>), ...initial.design };
  }

  return (
    <>
      <PageHeader
        title="Create a QR code"
        description="Six short steps. Everything except the QR type can be changed later, even after printing."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'New QR code' }]}
      />

      <Builder
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
        initial={initial}
        mode="create"
      />
    </>
  );
}
