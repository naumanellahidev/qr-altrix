import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { can, isFolderScoped } from '@/lib/rbac';
import { listQrCodes } from '@/lib/qr/service';
import { encodedPayloadFor } from '@/lib/qr/service';
import { shortLinkFor } from '@/lib/routing/resolve';
import type { QrDesign } from '@/lib/qr/types';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CodesTable, type CodeRow } from '@/components/dashboard/codes-table';
import { FoldersPanel } from '@/components/dashboard/folders-panel';

export const metadata: Metadata = { title: 'My QR codes' };
export const dynamic = 'force-dynamic';

export default async function CodesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    filter?: string;
    sort?: string;
    folder?: string;
    page?: string;
  }>;
}) {
  const auth = await requireAuth('/dashboard/codes');
  const query = await searchParams;

  const page = Math.max(1, Number(query.page ?? '1') || 1);
  const perPage = 25;

  let folderScopes: string[] | null = null;
  if (isFolderScoped(auth.role)) {
    const scopes = auth.membership.folderScopes as string[] | null | undefined;
    folderScopes = Array.isArray(scopes) ? scopes : [];
  }

  const [{ items, total }, folders, unfiled, totalAll] = await Promise.all([
    listQrCodes({
      workspaceId: auth.workspace.id,
      search: query.search,
      folderId: query.folder ?? null,
      filter: (query.filter as never) ?? 'all',
      sort: (query.sort as never) ?? 'newest',
      skip: (page - 1) * perPage,
      take: perPage,
      folderScopes,
    }),
    prisma.folder.findMany({
      where: { workspaceId: auth.workspace.id },
      orderBy: { name: 'asc' },
      include: { _count: { select: { qrCodes: true } } },
    }),
    prisma.qRCode.count({
      where: { workspaceId: auth.workspace.id, folderId: null, status: { not: 'DELETED' } },
    }),
    prisma.qRCode.count({ where: { workspaceId: auth.workspace.id, status: { not: 'DELETED' } } }),
  ]);

  const rows: CodeRow[] = items.map((qr) => ({
    id: qr.id,
    name: qr.name,
    kind: qr.kind,
    type: qr.type,
    status: qr.status,
    shortLink: qr.kind === 'DYNAMIC' ? shortLinkFor(qr) : null,
    payload: encodedPayloadFor(qr),
    design: (qr.design ?? {}) as Partial<QrDesign>,
    folderId: qr.folderId,
    folderName: qr.folder?.name ?? null,
    isFavorite: qr.isFavorite,
    passwordProtected: Boolean(qr.passwordHash),
    scheduleEnabled: qr.scheduleEnabled,
    scanLimitEnabled: qr.scanLimitEnabled,
    scanCount: qr.scanCount,
    uniqueScanCount: qr.uniqueScanCount,
    createdAt: qr.createdAt.toISOString(),
    updatedAt: qr.updatedAt.toISOString(),
    adminDisabledReason: qr.adminDisabledReason,
  }));

  return (
    <>
      <PageHeader
        title="My QR codes"
        description="Every code you own. Dynamic codes stay editable and keep working — nothing here expires on its own."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My QR codes' }]}
        actions={
          can(auth.role, 'qr.create') ? (
            <Button asChild variant="brand">
              <Link href="/dashboard/new">
                <Plus /> New QR code
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="grid gap-5 lg:grid-cols-[232px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Card className="p-3">
            <FoldersPanel
              folders={folders.map((folder) => ({
                id: folder.id,
                name: folder.name,
                codeCount: folder._count.qrCodes,
              }))}
              unfiled={unfiled}
              total={totalAll}
              canManage={can(auth.role, 'folder.manage')}
            />
          </Card>
        </aside>

        <div className="min-w-0">
          <CodesTable
            rows={rows}
            folders={folders.map((folder) => ({
              id: folder.id,
              name: folder.name,
              codeCount: folder._count.qrCodes,
            }))}
            total={total}
            page={page}
            perPage={perPage}
            canEdit={can(auth.role, 'qr.update')}
            canDelete={can(auth.role, 'qr.delete')}
            canResetScans={can(auth.role, 'stats.reset')}
          />
        </div>
      </div>
    </>
  );
}
