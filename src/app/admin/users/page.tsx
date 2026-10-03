import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requirePlatformAdmin } from '@/lib/auth';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/feedback';
import { UserActions } from '@/components/dashboard/admin/row-actions';
import { AdminSearch } from '@/components/dashboard/admin/admin-search';

export const metadata: Metadata = { title: 'Users' };
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; state?: string }>;
}) {
  const auth = await requirePlatformAdmin();
  const query = await searchParams;

  const page = Math.max(1, Number(query.page ?? '1') || 1);
  const perPage = 30;
  const search = query.q?.trim();

  const where = {
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(query.state === 'disabled' ? { isDisabled: true } : {}),
    ...(query.state === 'admins' ? { isPlatformAdmin: true } : {}),
    ...(query.state === 'unverified' ? { emailVerifiedAt: null } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        isDisabled: true,
        isPlatformAdmin: true,
        emailVerifiedAt: true,
        createdAt: true,
        lastAccessAt: true,
        _count: { select: { ownedWorkspaces: true, memberships: true, createdQrCodes: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <>
      <PageHeader
        title="Users"
        description={`${total} account(s) on this install.`}
        actions={
          <div className="flex flex-wrap gap-1.5">
            {[
              ['all', 'All'],
              ['admins', 'Admins'],
              ['disabled', 'Disabled'],
              ['unverified', 'Unverified'],
            ].map(([value, label]) => (
              <Button
                key={value}
                asChild
                size="sm"
                variant={(query.state ?? 'all') === value ? 'subtle' : 'ghost'}
              >
                <Link href={value === 'all' ? '/admin/users' : `/admin/users?state=${value}`}>{label}</Link>
              </Button>
            ))}
          </div>
        }
      >
        <AdminSearch basePath="/admin/users" placeholder="Search by email or name" />
      </PageHeader>

      {users.length === 0 ? (
        <EmptyState icon={<Search />} title="No accounts match" description="Try a different search or filter." />
      ) : (
        <Card flush>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="hidden md:table-cell">Workspaces</TableHead>
                <TableHead className="hidden lg:table-cell">Codes</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="text-[13.5px] font-medium">
                      {[user.name, user.surname].filter(Boolean).join(' ') || user.email.split('@')[0]}
                    </p>
                    <p className="text-[12px] text-muted-foreground">{user.email}</p>
                  </TableCell>
                  <TableCell className="hidden text-[13px] md:table-cell">
                    {user._count.ownedWorkspaces} owned · {user._count.memberships} member
                  </TableCell>
                  <TableCell className="hidden text-[13px] tabular-nums lg:table-cell">
                    {user._count.createdQrCodes}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-[12.5px] text-muted-foreground lg:table-cell">
                    {user.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-1">
                      {user.isPlatformAdmin ? <Badge variant="destructive">Admin</Badge> : null}
                      {user.isDisabled ? (
                        <Badge variant="warning">Disabled</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                      {!user.emailVerifiedAt ? <Badge variant="outline">Unverified</Badge> : null}
                    </span>
                  </TableCell>
                  <TableCell>
                    <UserActions
                      userId={user.id}
                      email={user.email}
                      isDisabled={user.isDisabled}
                      isPlatformAdmin={user.isPlatformAdmin}
                      isSelf={user.id === auth.user.id}
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
              <Link href={`/admin/users?page=${page - 1}${search ? `&q=${encodeURIComponent(search)}` : ''}`}>
                Previous
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
              <Link href={`/admin/users?page=${page + 1}${search ? `&q=${encodeURIComponent(search)}` : ''}`}>
                Next
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
