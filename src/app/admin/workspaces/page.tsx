import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requirePlatformAdmin } from '@/lib/auth';
import { bytesToSize, compactNumber } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/feedback';
import { WorkspaceActions } from '@/components/dashboard/admin/row-actions';
import { AdminSearch } from '@/components/dashboard/admin/admin-search';

export const metadata: Metadata = { title: 'Workspaces' };
export const dynamic = 'force-dynamic';

export default async function AdminWorkspacesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requirePlatformAdmin();
  const query = await searchParams;

  const page = Math.max(1, Number(query.page ?? '1') || 1);
  const perPage = 30;
  const search = query.q?.trim();

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
          { owner: { email: { contains: search, mode: 'insensitive' as const } } },
        ],
      }
    : {};

  const [workspaces, total] = await Promise.all([
    prisma.workspace.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        slug: true,
        isDisabled: true,
        storageUsed: true,
        createdAt: true,
        owner: { select: { email: true } },
        _count: { select: { qrCodes: true, members: true, domains: true, scanEvents: true } },
      },
    }),
    prisma.workspace.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <>
      <PageHeader title="Workspaces" description={`${total} workspace(s) on this install.`}>
        <AdminSearch basePath="/admin/workspaces" placeholder="Search by name, slug or owner email" />
      </PageHeader>

      {workspaces.length === 0 ? (
        <EmptyState icon={<Building2 />} title="No workspaces match" description="Try a different search." />
      ) : (
        <Card flush>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace</TableHead>
                <TableHead className="hidden md:table-cell">Owner</TableHead>
                <TableHead className="text-right">Codes</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Scans</TableHead>
                <TableHead className="hidden lg:table-cell">Storage</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((workspace) => (
                <TableRow key={workspace.id}>
                  <TableCell>
                    <p className="text-[13.5px] font-medium">{workspace.name}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {workspace.slug} · {workspace._count.members} member(s) · {workspace._count.domains} domain(s)
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-[12.5px] text-muted-foreground md:table-cell">
                    {workspace.owner?.email ?? '—'}
                  </TableCell>
                  <TableCell className="text-right text-[13px] tabular-nums">{workspace._count.qrCodes}</TableCell>
                  <TableCell className="hidden text-right text-[13px] tabular-nums lg:table-cell">
                    {compactNumber(workspace._count.scanEvents)}
                  </TableCell>
                  <TableCell className="hidden text-[12.5px] text-muted-foreground lg:table-cell">
                    {bytesToSize(Number(workspace.storageUsed))}
                  </TableCell>
                  <TableCell>
                    {workspace.isDisabled ? (
                      <Badge variant="warning">Suspended</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <WorkspaceActions
                      workspaceId={workspace.id}
                      name={workspace.name}
                      isDisabled={workspace.isDisabled}
                      codeCount={workspace._count.qrCodes}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[12.5px] text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" disabled={page <= 1}>
              <Link href={`/admin/workspaces?page=${page - 1}${search ? `&q=${encodeURIComponent(search)}` : ''}`}>
                Previous
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
              <Link href={`/admin/workspaces?page=${page + 1}${search ? `&q=${encodeURIComponent(search)}` : ''}`}>
                Next
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
