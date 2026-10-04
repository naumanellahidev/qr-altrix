import { Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowRight, BarChart3, FileText, Globe, Infinity as InfinityIcon, Layers, Link2, MousePointerClick,
  Palette, QrCode, UtensilsCrossed, Users,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { analyticsOverview, defaultRange } from '@/lib/analytics';
import { compactNumber, formatNumber } from '@/lib/utils';
import { encodedPayloadFor } from '@/lib/qr/service';
import { designFromRow } from '@/lib/qr/types';
import { shortLinkFor } from '@/lib/routing/resolve';
import { can } from '@/lib/rbac';
import { PageHeader, SectionHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/feedback';
import { QrThumb } from '@/components/qr/qr-preview';
import { ClaimDraft } from '@/components/dashboard/claim-draft';
import { CopyButton } from '@/components/ui/copy-button';

export const dynamic = 'force-dynamic';

const QUICK_ACTIONS = [
  { href: '/dashboard/new?type=WEBSITE', label: 'Website redirect', icon: Link2, hint: 'Editable link with analytics' },
  { href: '/dashboard/new?type=MENU', label: 'Restaurant menu', icon: UtensilsCrossed, hint: 'Hosted, editable menu' },
  { href: '/dashboard/new?type=PDF', label: 'PDF document', icon: FileText, hint: 'Brochure or price list' },
  { href: '/dashboard/new?type=VCARD_PLUS', label: 'Digital card', icon: Users, hint: 'Share your contact details' },
];

export default async function DashboardHome() {
  const auth = await requireAuth('/dashboard');
  const range = defaultRange(30);

  const [counts, recent, overview, folderCount, domainCount] = await Promise.all([
    prisma.qRCode.groupBy({
      by: ['kind'],
      where: { workspaceId: auth.workspace.id, status: { not: 'DELETED' } },
      _count: { _all: true },
      _sum: { scanCount: true },
    }),
    prisma.qRCode.findMany({
      where: { workspaceId: auth.workspace.id, status: { not: 'DELETED' } },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { design: true, customDomain: { select: { host: true, status: true } } },
    }),
    can(auth.role, 'stats.read')
      ? analyticsOverview({ workspaceId: auth.workspace.id, range }).catch(() => null)
      : Promise.resolve(null),
    prisma.folder.count({ where: { workspaceId: auth.workspace.id } }),
    prisma.customDomain.count({ where: { workspaceId: auth.workspace.id, status: 'VERIFIED' } }),
  ]);

  const totalCodes = counts.reduce((total, row) => total + row._count._all, 0);
  const dynamicCodes = counts.find((row) => row.kind === 'DYNAMIC')?._count._all ?? 0;
  const lifetimeScans = counts.reduce((total, row) => total + (row._sum.scanCount ?? 0), 0);

  const firstName = auth.user.name?.split(' ')[0] ?? auth.user.email.split('@')[0];

  return (
    <>
      <Suspense fallback={null}>
        <ClaimDraft />
      </Suspense>

      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Everything you have made, and how it is performing. Dynamic codes here never expire."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard/codes">
                <QrCode /> My QR codes
              </Link>
            </Button>
            <Button asChild variant="brand">
              <Link href="/dashboard/new">
                Create a QR code <ArrowRight />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="QR codes"
          value={formatNumber(totalCodes, auth.user.thousandsSep)}
          hint={`${dynamicCodes} dynamic · ${totalCodes - dynamicCodes} static`}
          icon={<QrCode />}
          tone="primary"
        />
        <StatCard
          label="Scans (30 days)"
          value={overview ? compactNumber(overview.totalScans) : '—'}
          change={overview?.changePercent ?? null}
          changeLabel="versus the previous 30 days"
          icon={<MousePointerClick />}
        />
        <StatCard
          label="Unique visitors"
          value={overview ? compactNumber(overview.uniqueScans) : '—'}
          hint="Counted from a salted, hashed fingerprint"
          icon={<Users />}
        />
        <StatCard
          label="Lifetime scans"
          value={compactNumber(lifetimeScans)}
          hint={`${folderCount} folders · ${domainCount} verified domains`}
          icon={<BarChart3 />}
          tone="accent"
        />
      </div>

      {/* ------------------------------------------------------- quick actions */}
      <section className="mt-8">
        <SectionHeader title="Start something new" description="The four people reach for most often." />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
            >
              <span className="mb-3 flex size-9 items-center justify-center rounded-xl bg-surface-muted text-muted-foreground transition-colors group-hover:bg-primary-soft group-hover:text-primary-soft-foreground">
                <action.icon className="size-[17px]" />
              </span>
              <p className="text-[13.5px] font-semibold">{action.label}</p>
              <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">{action.hint}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- recent codes */}
      <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeader
            title="Recently created"
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/codes">
                  View all <ArrowRight />
                </Link>
              </Button>
            }
          />

          {recent.length === 0 ? (
            <EmptyState
              icon={<QrCode />}
              title="No QR codes yet"
              description="Create your first code — it takes about thirty seconds, and it never expires."
              action={
                <Button asChild variant="brand">
                  <Link href="/dashboard/new">Create a QR code</Link>
                </Button>
              }
              secondaryAction={
                <Button asChild variant="outline">
                  <Link href="/dashboard/bulk">Import from CSV</Link>
                </Button>
              }
            />
          ) : (
            <Card flush>
              <ul className="divide-y divide-border">
                {recent.map((qr) => {
                  const payload = encodedPayloadFor(qr);
                  const link = qr.kind === 'DYNAMIC' ? shortLinkFor(qr) : null;
                  return (
                    <li key={qr.id} className="flex items-center gap-3 p-3.5">
                      <QrThumb data={payload} design={designFromRow(qr.design)} size={44} />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/dashboard/codes/${qr.id}`}
                          className="-my-2 block truncate py-2 text-[13.5px] font-medium hover:text-primary"
                        >
                          {qr.name}
                        </Link>
                        <p className="flex items-center gap-1.5 truncate text-[12px] text-muted-foreground">
                          <Badge variant={qr.kind === 'DYNAMIC' ? 'primary' : 'outline'}>
                            {qr.kind === 'DYNAMIC' ? 'Dynamic' : 'Static'}
                          </Badge>
                          {link ? <span className="truncate">{link.replace(/^https?:\/\//, '')}</span> : null}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-right">
                          <span className="block text-[13px] font-semibold tabular-nums">
                            {compactNumber(qr.scanCount)}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">scans</span>
                        </span>
                        {link ? <CopyButton value={link} size="icon-sm" variant="ghost" /> : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          {overview && overview.countries.length > 0 ? (
            <Card className="p-5">
              <SectionHeader title="Top countries" description="Last 30 days" />
              <ul className="space-y-2.5">
                {overview.countries.slice(0, 5).map((country) => (
                  <li key={country.label} className="space-y-1">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="font-medium">{country.label}</span>
                      <span className="tabular-nums text-muted-foreground">{formatNumber(country.value)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-brand-gradient"
                        style={{ width: `${Math.max(3, country.share)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card className="p-5">
            <SectionHeader title="Get more from QR ALTRIX" />
            <ul className="space-y-2.5">
              {[
                { href: '/dashboard/templates', icon: Palette, label: 'Save a design as a template', done: false },
                { href: '/dashboard/domains', icon: Globe, label: 'Use your own short domain', done: domainCount > 0 },
                { href: '/dashboard/bulk', icon: Layers, label: 'Generate codes from a CSV', done: false },
                { href: '/dashboard/team', icon: Users, label: 'Invite a teammate', done: auth.memberships.length > 1 },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-[13px] transition-colors hover:border-primary/40 hover:bg-surface-muted"
                  >
                    <item.icon className="size-4 text-muted-foreground" />
                    <span className="flex-1">{item.label}</span>
                    {item.done ? <Badge variant="success">Done</Badge> : <ArrowRight className="size-3.5 text-muted-foreground" />}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-success/25 bg-success/8 p-5">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-success-text">
              <InfinityIcon className="size-4" />
              A promise, not a plan feature
            </p>
            <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">
              Your dynamic codes have no trial clock, no scan cap and no subscription. They stop only if you pause or
              delete them, or set a schedule yourself.
            </p>
          </Card>
        </div>
      </section>
    </>
  );
}
