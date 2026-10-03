'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, LifeBuoy, RefreshCw, TriangleAlert } from 'lucide-react';
import { BrandLogo } from '@/components/brand';
import { Button } from '@/components/ui/button';

/**
 * Last-resort error boundary. It never shows a stack trace to a visitor, but it does show
 * the digest so a support request can be matched to a server log line.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    // The server already logged the detail; this keeps the browser console useful too.
    console.error('Unhandled application error', error.digest ?? error.message);
  }, [error]);

  return (
    <main className="qa-glow relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <BrandLogo href="/" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
          <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <TriangleAlert className="size-6" />
          </span>
          <h1 className="font-display text-[22px] font-semibold tracking-[-0.02em]">Something went wrong</h1>
          <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-6 text-muted-foreground">
            This page failed to load. Your QR codes are unaffected — scans keep resolving even while the dashboard is
            having a bad moment.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="brand" onClick={reset}>
              <RefreshCw /> Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft /> Back to the dashboard
              </Link>
            </Button>
          </div>
        </div>

        {error.digest ? (
          <p className="mt-5 text-[12px] text-muted-foreground">
            Reference <span className="font-mono">{error.digest}</span> ·{' '}
            <Link href="/support" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              <LifeBuoy className="size-3" /> Get help
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
