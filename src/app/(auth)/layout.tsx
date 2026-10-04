import Link from 'next/link';
import { ArrowLeft, BarChart3, Infinity as InfinityIcon, Palette, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-provider';

const POINTS = [
  { icon: InfinityIcon, title: 'Nothing expires', body: 'Dynamic codes keep working until you pause or delete them.' },
  { icon: Palette, title: 'Designs worth printing', body: '32 frames, seven pattern styles, your logo and a scan-safety score.' },
  { icon: BarChart3, title: 'Scan analytics included', body: 'Country, city, device, language and campaign — exportable.' },
  { icon: ShieldCheck, title: 'Privacy-first', body: 'Visitor IPs are hashed, never stored in the clear.' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 min-h-dvh lg:grid-cols-2">
      {/* ------------------------------------------------------------- form side */}
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Home
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <p className="text-center text-[11.5px] text-muted-foreground">
          © {new Date().getFullYear()} QR ALTRIX ·{' '}
          <Link href="/legal/terms" className="hover:text-foreground">
            Terms
          </Link>{' '}
          ·{' '}
          <Link href="/legal/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </p>
      </div>

      {/* ------------------------------------------------------------ brand side */}
      <div className="qa-glow relative hidden overflow-hidden border-l border-border bg-surface lg:block">
        <div className="relative z-10 flex h-full flex-col justify-center px-12">
          <h2 className="font-display text-[30px] font-bold leading-tight tracking-[-0.03em]">
            Print it once.
            <span className="block text-gradient">Change it whenever.</span>
          </h2>
          <p className="mt-4 max-w-sm text-[14.5px] leading-7 text-muted-foreground">
            QR ALTRIX is a free, self-hostable QR platform. No trial countdown, no subscription wall — the codes you
            print today keep resolving for as long as you want them to.
          </p>

          <ul className="mt-9 space-y-5">
            {POINTS.map((point) => (
              <li key={point.title} className="flex gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-soft">
                  <point.icon className="size-[17px]" />
                </span>
                <span>
                  <span className="block text-[14px] font-semibold">{point.title}</span>
                  <span className="block text-[13px] leading-6 text-muted-foreground">{point.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
