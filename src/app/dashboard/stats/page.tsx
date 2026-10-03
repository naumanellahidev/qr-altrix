import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { analyticsOverview, defaultRange } from '@/lib/analytics';
import { analyticsDeferred } from '@/lib/queue';
import { PageHeader } from '@/components/ui/page-header';
import { AnalyticsView, type AnalyticsPayload } from '@/components/dashboard/analytics-view';

export const metadata: Metadata = { title: 'Analytics' };
export const dynamic = 'force-dynamic';

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ qr?: string }> }) {
  const auth = await requirePermission('stats.read', '/dashboard/stats');
  const query = await searchParams;

  const selectedCodeId = query.qr ?? null;

  const [overview, codes, folders] = await Promise.all([
    analyticsOverview({
      workspaceId: auth.workspace.id,
      qrCodeId: selectedCodeId,
      range: defaultRange(30),
      timezone: auth.user.timezone,
    }).catch(() => null),
    prisma.qRCode.findMany({
      where: { workspaceId: auth.workspace.id, status: { not: 'DELETED' } },
      orderBy: { scanCount: 'desc' },
      select: { id: true, name: true },
      take: 500,
    }),
    prisma.folder.findMany({ where: { workspaceId: auth.workspace.id }, orderBy: { name: 'asc' } }),
  ]);

  const empty: AnalyticsPayload = {
    totalScans: 0,
    uniqueScans: 0,
    changePercent: null,
    firstScanAt: null,
    lastScanAt: null,
    series: [],
    countries: [],
    cities: [],
    devices: [],
    browsers: [],
    operatingSystems: [],
    languages: [],
    referrers: [],
    hours: Array.from({ length: 24 }, (_, hour) => ({ hour, scans: 0 })),
    topCodes: [],
    campaigns: [],
  };

  const initial: AnalyticsPayload = overview
    ? {
        totalScans: overview.totalScans,
        uniqueScans: overview.uniqueScans,
        changePercent: overview.changePercent,
        firstScanAt: overview.firstScanAt?.toISOString() ?? null,
        lastScanAt: overview.lastScanAt?.toISOString() ?? null,
        series: overview.series,
        countries: overview.countries,
        cities: overview.cities,
        devices: overview.devices,
        browsers: overview.browsers,
        operatingSystems: overview.operatingSystems,
        languages: overview.languages,
        referrers: overview.referrers,
        hours: overview.hours,
        topCodes: overview.topCodes,
        campaigns: overview.campaigns,
      }
    : empty;

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Scan data for your dynamic QR codes. Static codes cannot be tracked — their content never reaches a server."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
      />

      <AnalyticsView
        initial={initial}
        deferredProcessing={analyticsDeferred()}
        codes={codes}
        folders={folders.map((folder) => ({ id: folder.id, name: folder.name }))}
        selectedCodeId={selectedCodeId}
        canExport={can(auth.role, 'stats.export')}
        canReset={can(auth.role, 'stats.reset')}
        timezone={auth.user.timezone}
      />
    </>
  );
}
