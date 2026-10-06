import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen, Bug, ExternalLink, Flag, Infinity as InfinityIcon, LifeBuoy, Mail, Server, ShieldCheck,
} from 'lucide-react';
import { env } from '@/lib/env';
import { requireAuth } from '@/lib/auth';
import { redisEnabled } from '@/lib/redis';
import { PageHeader, SectionHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/misc';
import { CopyField } from '@/components/ui/copy-button';
import { isDeveloperApiEnabled } from '@/lib/settings';

export const metadata: Metadata = { title: 'Contact & support' };
export const dynamic = 'force-dynamic';

const HELP = [
  {
    q: 'My printed code stopped working — what happened?',
    a: 'A dynamic code only stops for five reasons: you paused it, you deleted it, you turned on a schedule or scan limit that has been reached, or a platform administrator disabled it. Open the code in My QR codes and the state badge will tell you which. Nothing expires on its own here.',
  },
  {
    q: 'Can I change where a printed code points?',
    a: 'Yes, if it is a dynamic code. Open it and edit the destination — the pattern never changes, so there is nothing to reprint. Static codes hold their content inside the pattern and cannot be changed.',
  },
  {
    q: 'A code scans slowly or not at all',
    a: 'Open the code, check the scan-safety score, and raise the contrast or the quiet zone if it flags anything. For small prints keep the logo under 25% and use error correction Q. Print at 2.5 cm or larger for close-range scanning.',
  },
  {
    q: 'My custom domain is not verifying',
    a: 'DNS changes can take up to an hour. Check that the TXT record name includes the _qr-altrix prefix and that the value matches exactly. Then press "Check DNS" again on the My domains page.',
  },
  {
    q: 'Scans are not appearing in analytics',
    a: 'Scans are logged after the redirect, so they can lag a few seconds. Bot and crawler traffic is deliberately excluded, and opening the destination from the dashboard with ?preview=1 is not counted.',
  },
  {
    q: 'How do I export everything?',
    a: 'Analytics exports to CSV and XLSX from the Analytics page. Codes themselves export as PNG, SVG, PDF, JPEG, WebP or EPS individually, or as a ZIP from a bulk import. The REST API can read everything too.',
  },
];

export default async function SupportPage() {
  const auth = await requireAuth('/dashboard/support');
  const developerApiEnabled = await isDeveloperApiEnabled();
  // Without the developer API there is no REST API to mention.
  const help = developerApiEnabled ? HELP : HELP.map((item) => ({ ...item, a: item.a.replace(' The REST API can read everything too.', '') }));

  return (
    <>
      <PageHeader
        title="Contact & support"
        description="Self-service answers first, then how to reach a human."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Contact & support' }]}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Card className="p-5">
            <SectionHeader title="Common questions" />
            <Accordion type="single" collapsible>
              {help.map((item, index) => (
                <AccordionItem key={item.q} value={`help-${index}`}>
                  <AccordionTrigger className="text-[14px]">{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <Card className="p-5">
            <SectionHeader title="Reach a person" description="Include the details on the right so we can look straight at the problem." />
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="brand">
                <a
                  href={`mailto:support@${new URL(env.appUrl).hostname}?subject=${encodeURIComponent(
                    'QR ALTRIX support request',
                  )}&body=${encodeURIComponent(
                    `Workspace: ${auth.workspace.name}\nAccount: ${auth.user.email}\n\nWhat happened:\n`,
                  )}`}
                >
                  <Mail /> Email support
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/report-abuse">
                  <Flag /> Report a QR code
                </Link>
              </Button>
              {developerApiEnabled ? (
                <Button asChild variant="outline">
                  <Link href="/developers" target="_blank">
                    <BookOpen /> API reference <ExternalLink />
                  </Link>
                </Button>
              ) : null}
            </div>
            <p className="mt-4 text-[12.5px] leading-6 text-muted-foreground">
              This is a self-hosted install, so the administrator who runs this server is your first line of support.
              If you run it yourself, the production README in the repository covers backups, restores and upgrades.
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <SectionHeader title="Details to include" description="Copy these into your message." />
            <div className="space-y-3">
              <CopyField label="Account" value={auth.user.email} mono={false} />
              <CopyField label="Workspace" value={`${auth.workspace.name} (${auth.workspace.id})`} mono={false} />
              <CopyField label="Role" value={auth.role} mono={false} />
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader title="This install" />
            <ul className="space-y-2 text-[13px]">
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Base URL</span>
                <span className="truncate font-mono text-[12px]">{env.appUrl.replace(/^https?:\/\//, '')}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Short links</span>
                <span className="truncate font-mono text-[12px]">{env.shortUrlBase.replace(/^https?:\/\//, '')}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Background worker</span>
                {redisEnabled() ? <Badge variant="success">Redis queue</Badge> : <Badge variant="outline">Inline</Badge>}
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">File storage</span>
                <Badge variant="outline">{env.storage.driver === 's3' ? 'S3-compatible' : 'Local disk'}</Badge>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Email</span>
                <Badge variant={env.smtp.host ? 'success' : 'warning'}>
                  {env.smtp.host ? 'SMTP configured' : 'Logging only'}
                </Badge>
              </li>
            </ul>
          </Card>

          <Card className="border-success/25 bg-success/8 p-5">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-success-text">
              <InfinityIcon className="size-4" /> No expiry, no upsell
            </p>
            <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">
              There is no paid tier to be moved onto and no trial to run out. If a code stops working, something is
              wrong — tell us and we will look.
            </p>
          </Card>

          <Card className="p-5">
            <SectionHeader title="For administrators" />
            <ul className="space-y-1.5 text-[12.5px] text-muted-foreground">
              <li className="flex items-center gap-2">
                <Server className="size-3.5" /> System health and queue: Admin panel → System
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-3.5" /> Abuse reports: Admin panel → Abuse
              </li>
              <li className="flex items-center gap-2">
                <Bug className="size-3.5" /> Logs: <code className="font-mono">docker compose logs -f app worker</code>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
