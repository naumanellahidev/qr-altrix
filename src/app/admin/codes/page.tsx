import type { Metadata } from 'next';
import Link from 'next/link';
import { QrCode } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requirePlatformAdmin } from '@/lib/auth';
import { encodedPayloadFor } from '@/lib/qr/service';
import { shortLinkFor } from '@/lib/routing/resolve';
import { compactNumber } from '@/lib/utils';
import { getTypeDef } from '@/lib/qr/catalog';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/feedback';
import { Alert } from '@/components/ui/feedback';
import { CodeActions } from '@/components/dashboard/admin/row-actions';
import { AdminSearch } from '@/components/dashboard/admin/admin-search';

export const metadata: Metadata = { title: 'All QR codes' };
export const dynamic = 'force-dynamic';

export default async function AdminCodesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; state?: string }>;
}) {
  await requirePlatformAdmin();
  const query = await searchParams;

  const page = Math.max(1, Number(query.page ?? '1') || 1);
  const perPage = 30;
  const search = query.q?.trim();

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { shortCode: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(query.state === 'disabled' ? { status: 'ADMIN_DISABLED' as const } : {}),
    ...(query.state === 'dynamic' ? { kind: 'DYNAMIC' as const } : {}),
    ...(query.state === 'busiest' ? {} : {}),
  };

  const [codes, total] = await Promise.all([
    prisma.qRCode.findMany({
      where,
      orderBy: query.state === 'busiest' ? { scanCount: 'desc' } : { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        customDomain: { select: { host: true, status: true } },
        workspace: { select: { id: true, name: true, owner: { select: { email: true } } } },
      },
    }),
    prisma.qRCode.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <>
      <PageHeader
        title="All QR codes"
        description={`${total} code(s) across every workspace.`}
        actions={
          <div className="flex flex-wrap gap-1.5">
            {[
              ['all', 'All'],
              ['dynamic', 'Dynamic'],
              ['busiest', 'Busiest'],
              ['disabled', 'Disabled'],
            ].map(([value, label]) => (
              <Button key={value} asChild size="sm" variant={(query.state ?? 'all') === value ? 'subtle' : 'ghost'}>
                <Link href={value === 'all' ? '/admin/codes' : `/admin/codes?state=${value}`}>{label}</Link>
              </Button>
            ))}
          </div>
        }
      >
        <AdminSearch basePath="/admin/codes" placeholder="Search by name, short code or slug" />
      </PageHeader>

      <Alert tone="info" className="mb-4">
        Disabling a code here is an abuse action: the owner is emailed the reason, the change is logged, and it can be
        undone. Nothing on this page expires a code.
      </Alert>

      {codes.length === 0 ? (
        <EmptyState icon={<QrCode />} title="No codes match" description="Try a different search or filter." />
      ) : (
        <Card flush>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead className="hidden md:table-cell">Workspace</TableHead>
                <TableHead className="hidden lg:table-cell">Destination</TableHead>
                <TableHead className="text-right">Scans</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((qr) => {
                const def = getTypeDef(qr.type);
                const payload = encodedPayloadFor(qr);
                const destination = (qr.content as Record<string, unknown>).url;
                return (
                  <TableRow key={qr.id}>
                    <TableCell>
                      <p className="text-[13.5px] font-medium">{qr.name}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {def?.label ?? qr.type} · {qr.kind === 'DYNAMIC' ? shortLinkFor(qr).replace(/^https?:\/\//, '') : 'static'}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-[13px]">{qr.workspace.name}</p>
                      <p className="text-[11.5px] text-muted-foreground">{qr.workspace.owner?.email}</p>
                    </TableCell>
                    <TableCell className="hidden max-w-[18rem] truncate text-[12.5px] text-muted-foreground lg:table-cell">
                      {typeof destination === 'string' ? destination : payload.slice(0, 60)}
                    </TableCell>
                    <TableCell className="text-right text-[13px] tabular-nums">{compactNumber(qr.scanCount)}</TableCell>
                    <TableCell>
                      {qr.status === 'ADMIN_DISABLED' ? (
                        <Badge variant="destructive">Disabled</Badge>
                      ) : qr.status === 'PAUSED' ? (
                        <Badge variant="warning">Paused</Badge>
                      ) : qr.status === 'DELETED' ? (
                        <Badge variant="outline">Deleted</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <CodeActions qrCodeId={qr.id} name={qr.name} status={qr.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
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
              <Link href={`/admin/codes?page=${page - 1}${search ? `&q=${encodeURIComponent(search)}` : ''}`}>
                Previous
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
              <Link href={`/admin/codes?page=${page + 1}${search ? `&q=${encodeURIComponent(search)}` : ''}`}>
                Next
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
