import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { getAuthContext } from '@/lib/auth';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AbuseReportForm } from '@/components/marketing/abuse-report-form';
import { canonical } from '@/lib/seo/routes';

export const metadata: Metadata = {
  alternates: canonical('/report-abuse'),
  title: 'Report a QR code',
  description: 'Report a QR code that leads somewhere harmful. A human reviews every report.',
  robots: { index: true, follow: true },
};

export const dynamic = 'force-dynamic';

export default async function ReportAbusePage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const [auth, query] = await Promise.all([getAuthContext().catch(() => null), searchParams]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader signedIn={Boolean(auth)} />

      <main className="container flex-1 py-12">
        <div className="mx-auto max-w-xl">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <h1 className="font-display text-[26px] font-bold tracking-[-0.03em]">Report a QR code</h1>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-7 text-muted-foreground">
              If a code created here leads to phishing, malware or anything else harmful, tell us and a person will look
              at it.
            </p>
          </div>

          <Card className="p-5">
            <AbuseReportForm defaultCode={query.code ?? ''} signedIn={Boolean(auth)} />
          </Card>

          <div className="mt-6 space-y-3 rounded-2xl border border-border bg-surface p-5">
            <p className="flex items-center gap-2 text-[13px] font-semibold">
              <Badge variant="outline">How this works</Badge>
            </p>
            <ul className="space-y-2 text-[13px] leading-6 text-muted-foreground">
              <li>
                A report never disables a code by itself — that would let anyone take a competitor&apos;s printed code
                offline.
              </li>
              <li>An administrator reviews the destination and the report, usually within a working day.</li>
              <li>
                If the code is abusive it is disabled, the owner is told why, and anyone scanning it sees a neutral
                notice.
              </li>
              <li>If it is not, nothing changes and the report is closed.</li>
            </ul>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
