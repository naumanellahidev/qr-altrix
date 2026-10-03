import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { requireAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { TXT_RECORD_NAME } from '@/lib/jobs/domain';
import { PageHeader } from '@/components/ui/page-header';
import { DomainsManager, type DomainRow } from '@/components/dashboard/domains-manager';

export const metadata: Metadata = { title: 'My domains' };
export const dynamic = 'force-dynamic';

function appHostname(): string {
  try {
    return new URL(env.appUrl).hostname;
  } catch {
    return 'localhost';
  }
}

export default async function DomainsPage() {
  const auth = await requireAuth('/dashboard/domains');

  const domains = await prisma.customDomain.findMany({
    where: { workspaceId: auth.workspace.id },
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { qrCodes: true } } },
  });

  const rows: DomainRow[] = domains.map((domain) => {
    const isApex = domain.host.split('.').length <= 2;
    return {
      id: domain.id,
      host: domain.host,
      status: domain.status,
      sslStatus: domain.sslStatus,
      isDefault: domain.isDefault,
      verifiedAt: domain.verifiedAt?.toISOString() ?? null,
      lastCheckedAt: domain.lastCheckedAt?.toISOString() ?? null,
      lastCheckError: domain.lastCheckError,
      codeCount: domain._count.qrCodes,
      dns: {
        verification: {
          type: 'TXT',
          name: `${TXT_RECORD_NAME}.${domain.host}`,
          value: `qr-altrix-verify=${domain.verifyToken}`,
          note: 'Proves you own the domain. Add this first.',
        },
        routing: isApex
          ? {
              type: 'A',
              name: domain.host,
              value: 'YOUR.SERVER.IP',
              note: 'Point the apex domain at the server running QR ALTRIX.',
            }
          : {
              type: 'CNAME',
              name: domain.host,
              value: appHostname(),
              note: 'Point the subdomain at your QR ALTRIX host.',
            },
        ssl: 'Once DNS resolves, run ./scripts/add-domain.sh <domain> on the server to issue the HTTPS certificate with Certbot.',
      },
    };
  });

  return (
    <>
      <PageHeader
        title="My domains"
        description="Serve short links from your own domain, with your own slugs. Free, like the rest of QR ALTRIX."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My domains' }]}
      />

      <DomainsManager
        domains={rows}
        fallbackShortDomain={env.shortUrlBase}
        canManage={can(auth.role, 'domain.manage')}
      />
    </>
  );
}
