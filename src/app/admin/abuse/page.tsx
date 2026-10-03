import type { Metadata } from 'next';
import Link from 'next/link';
import { Flag, ShieldCheck } from 'lucide-react';
import { Prisma, type AbuseStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requirePlatformAdmin } from '@/lib/auth';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/feedback';
import { AbuseActions, CodeActions } from '@/components/dashboard/admin/row-actions';

export const metadata: Metadata = { title: 'Abuse reports' };
export const dynamic = 'force-dynamic';

const REASON_LABELS: Record<string, string> = {
  phishing: 'Phishing',
  malware: 'Malware',
  spam: 'Spam',
  illegal: 'Illegal content',
  adult: 'Adult content',
  other: 'Other',
};

export default async function AdminAbusePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePlatformAdmin();
  const query = await searchParams;
  const status = query.status ?? 'open';

  const where: Prisma.AbuseReportWhereInput =
    status === 'all'
      ? {}
      : status === 'open'
        ? { status: { in: ['OPEN', 'REVIEWING'] } }
        : { status: status.toUpperCase() as AbuseStatus };

  const reports = await prisma.abuseReport.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      qrCode: {
        select: {
          id: true,
          name: true,
          status: true,
          type: true,
          content: true,
          shortCode: true,
          workspace: { select: { name: true, owner: { select: { email: true } } } },
        },
      },
      reporter: { select: { email: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Abuse reports"
        description="Reports never change a code by themselves — you decide."
        actions={
          <div className="flex flex-wrap gap-1.5">
            {[
              ['open', 'Needs review'],
              ['actioned', 'Actioned'],
              ['dismissed', 'Dismissed'],
              ['all', 'All'],
            ].map(([value, label]) => (
              <Button key={value} asChild size="sm" variant={status === value ? 'subtle' : 'ghost'}>
                <Link href={`/admin/abuse?status=${value}`}>{label}</Link>
              </Button>
            ))}
          </div>
        }
      />

      {reports.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck />}
          title="Nothing to review"
          description="Reports submitted through the public form will appear here."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const destination = (report.qrCode?.content as Record<string, unknown> | undefined)?.url;
            return (
              <Card key={report.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <Badge variant="destructive">
                        <Flag className="size-3" /> {REASON_LABELS[report.reason] ?? report.reason}
                      </Badge>
                      <Badge
                        variant={
                          report.status === 'ACTIONED'
                            ? 'success'
                            : report.status === 'DISMISSED'
                              ? 'outline'
                              : 'warning'
                        }
                      >
                        {report.status}
                      </Badge>
                      <span className="text-[12px] text-muted-foreground">
                        {report.createdAt.toLocaleString()}
                      </span>
                    </p>

                    {report.qrCode ? (
                      <div className="mt-2">
                        <p className="text-[14px] font-semibold">{report.qrCode.name}</p>
                        <p className="text-[12.5px] text-muted-foreground">
                          {report.qrCode.workspace.name} · {report.qrCode.workspace.owner?.email} ·{' '}
                          {report.qrCode.shortCode ? `/q/${report.qrCode.shortCode}` : 'static code'}
                        </p>
                        {typeof destination === 'string' ? (
                          <p className="mt-1 break-all font-mono text-[12px] text-muted-foreground">{destination}</p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-2 text-[13px] text-muted-foreground">
                        The reported code could not be matched automatically — see the details below.
                      </p>
                    )}

                    {report.details ? (
                      <p className="mt-3 whitespace-pre-line rounded-xl border border-border bg-surface-muted/50 p-3 text-[12.5px] leading-6">
                        {report.details}
                      </p>
                    ) : null}

                    <p className="mt-2 text-[11.5px] text-muted-foreground">
                      Reported by {report.reporter?.email ?? report.reporterEmail ?? 'an anonymous visitor'}
                      {report.resolution ? ` · Note: ${report.resolution}` : ''}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {report.qrCode ? (
                      <CodeActions
                        qrCodeId={report.qrCode.id}
                        name={report.qrCode.name}
                        status={report.qrCode.status}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-3">
                  <AbuseActions reportId={report.id} status={report.status} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
