import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2, Flag, HardDrive, Infinity as InfinityIcon, MousePointerClick, QrCode, Users,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import { requirePlatformAdmin } from '@/lib/auth';
import { compactNumber, formatNumber } from '@/lib/utils';
import { PageHeader, SectionHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Overview' };
export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  await requirePlatformAdmin();

  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

  const [
    users,
    newUsers,
    workspaces,
    codeCounts,
    scans30,
    scansTotal,
    openReports,
    disabledCodes,
    recentUsers,
    topWorkspaces,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.workspace.count(),
    prisma.qRCode.groupBy({
      by: ['kind'],
      where: { status: { not: 'DELETED' } },
      _count: { _all: true },
    }),
    prisma.scanEvent.count({ where: { createdAt: { gte: since }, kind: 'SCAN' } }),
    prisma.scanEvent.count({ where: { kind: 'SCAN' } }),
    prisma.abuseReport.count({ where: { status: { in: ['OPEN', 'REVIEWING'] } } }),
    prisma.qRCode.count({ where: { status: 'ADMIN_DISABLED' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, email: true, name: true, createdAt: true, isPlatformAdmin: true, isDisabled: true },
    }),
    prisma.workspace.findMany({
      orderBy: { qrCodes: { _count: 'desc' } },
      take: 6,
      select: {
        id: true,
        name: true,
        isDisabled: true,
        owner: { select: { email: true } },
        _count: { select: { qrCodes: true, members: true } },
      },
    }),
  ]);

  const totalCodes = codeCounts.reduce((total, row) => total + row._count._all, 0);
  const dynamicCodes = codeCounts.find((row) => row.kind === 'DYNAMIC')?._count._all ?? 0;

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="Everything running on this install. Figures are live, not cached."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Accounts"
          value={formatNumber(users)}
          hint={`${newUsers} joined in the last 30 days`}
          icon={<Users />}
          tone="primary"
        />
        <StatCard
          label="Workspaces"
          value={formatNumber(workspaces)}
          hint={`${formatNumber(totalCodes)} QR codes (${formatNumber(dynamicCodes)} dynamic)`}
          icon={<Building2 />}
        />
        <StatCard
          label="Scans (30 days)"
          value={compactNumber(scans30)}
          hint={`${compactNumber(scansTotal)} recorded in total`}
          icon={<MousePointerClick />}
          tone="accent"
        />
        <StatCard
          label="Needs attention"
          value={formatNumber(openReports)}
          hint={`${disabledCodes} code(s) disabled for abuse`}
          icon={<Flag />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <SectionHeader
            title="Newest accounts"
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/users">View all</Link>
              </Button>
            }
          />
          <ul className="divide-y divide-border">
            {recentUsers.map((user) => (
              <li key={user.id} className="flex items-center gap-3 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-[11.5px] font-semibold">
                  {(user.name ?? user.email).slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium">{user.name ?? user.email.split('@')[0]}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{user.email}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {user.isPlatformAdmin ? <Badge variant="destructive">Admin</Badge> : null}
                  {user.isDisabled ? <Badge variant="warning">Disabled</Badge> : null}
                  <span className="text-[11.5px] text-muted-foreground">
                    {user.createdAt.toLocaleDateString()}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <SectionHeader
            title="Busiest workspaces"
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/workspaces">View all</Link>
              </Button>
            }
          />
          <ul className="divide-y divide-border">
            {topWorkspaces.map((workspace) => (
              <li key={workspace.id} className="flex items-center gap-3 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium">{workspace.name}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">
                    {workspace.owner?.email} · {workspace._count.members} member(s)
                  </span>
                </span>
                {workspace.isDisabled ? <Badge variant="warning">Disabled</Badge> : null}
                <span className="shrink-0 text-[13px] font-semibold tabular-nums">
                  {compactNumber(workspace._count.qrCodes)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-5 border-success/25 bg-success/8 p-5">
        <p className="flex items-center gap-2 text-[13.5px] font-semibold text-success-text">
          <InfinityIcon className="size-4" /> Expiry is not a lever you have
        </p>
        <p className="mt-1.5 max-w-3xl text-[12.5px] leading-6 text-muted-foreground">
          There is no setting anywhere in this panel that makes dynamic QR codes expire. Codes can be disabled
          individually for abuse (with a reason and an email to the owner), or a whole workspace can be suspended — both
          are reversible and both are logged.
        </p>
      </Card>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/admin/abuse">
            <Flag /> Review abuse reports {openReports > 0 ? `(${openReports})` : ''}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/system">
            <HardDrive /> System and queue
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/codes">
            <QrCode /> All QR codes
          </Link>
        </Button>
      </div>
    </>
  );
}
