import Link from 'next/link';
import { CalendarClock, Infinity as InfinityIcon } from 'lucide-react';
import { BrandLogo } from '@/components/brand';
import { getSettings } from '@/lib/settings';

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { href: '/#features', label: 'Features' },
      { href: '/#types', label: 'QR code types' },
      { href: '/#use-cases', label: 'Use cases' },
      { href: '/dashboard/new', label: 'Create a QR code' },
      { href: '/dashboard/bulk', label: 'Bulk generation' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { href: '/developers', label: 'Developers & API' },
      { href: '/dashboard/domains', label: 'Custom domains' },
      { href: '/dashboard/stats', label: 'Analytics' },
      { href: '/dashboard/templates', label: 'Templates' },
      { href: '/support', label: 'Contact & support' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/legal/terms', label: 'Terms of service' },
      { href: '/legal/privacy', label: 'Privacy policy' },
      { href: '/report-abuse', label: 'Report a QR code' },
      { href: '/#faq', label: 'FAQ' },
    ],
  },
];

export async function SiteFooter() {
  // Read the live policy so the footer never advertises something this install has
  // switched off. Settings are cached, so this costs nothing.
  const settings = await getSettings().catch(() => null);
  const expiryEnabled = Boolean(settings?.expiryEnabled);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container py-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-3">
            <BrandLogo />
            <p className="max-w-xs text-[13px] leading-6 text-muted-foreground">
              A free, self-hostable QR code platform. Design beautiful codes, track every scan, and change where a
              printed code points — any time.
            </p>
            {expiryEnabled ? (
              <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
                <CalendarClock className="size-3.5" />
                Every code shows its expiry date
              </p>
            ) : (
              <p className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-[12px] font-medium text-success">
                <InfinityIcon className="size-3.5" />
                Dynamic codes never expire
              </p>
            )}
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-[12.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} QR ALTRIX. Self-hosted and yours to run.</p>
          <p>
            QR Code is a registered trademark of Denso Wave Incorporated. QR ALTRIX is an independent project and is not
            affiliated with any other QR service.
          </p>
        </div>
      </div>
    </footer>
  );
}
