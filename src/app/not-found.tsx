import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Flag, QrCode, Search } from 'lucide-react';
import { BrandLogo } from '@/components/brand';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

/**
 * A scanned code that no longer exists lands on /inactive with an explanation; this page
 * is for mistyped URLs, so it points back at the things people usually wanted.
 */
export default function NotFound() {
  return (
    <main className="qa-glow relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <BrandLogo href="/" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
          <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-muted text-muted-foreground">
            <Search className="size-6" />
          </span>
          <h1 className="font-display text-[22px] font-semibold tracking-[-0.02em]">We could not find that page</h1>
          <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-6 text-muted-foreground">
            The link may be mistyped or out of date. If you arrived here by scanning a QR code, the code itself is
            probably fine — check the full link printed beside it.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild variant="brand">
              <Link href="/">
                <ArrowLeft /> Back to the homepage
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/codes">
                <QrCode /> My QR codes
              </Link>
            </Button>
          </div>
        </div>

        <p className="mt-5 text-[12px] text-muted-foreground">
          Scanned a code that leads somewhere harmful?{' '}
          <Link href="/report-abuse" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
            <Flag className="size-3" /> Report it
          </Link>
        </p>
      </div>
    </main>
  );
}
