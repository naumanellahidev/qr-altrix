'use client';

import * as React from 'react';
import Link from 'next/link';
import { LifeBuoy, RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Dashboard-level boundary: keeps the sidebar and top bar in place so a failure on one
 * screen does not feel like the whole product fell over.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Dashboard error', error.digest ?? error.message);
  }, [error]);

  return (
    <Card className="mx-auto max-w-lg p-7 text-center">
      <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" />
      </span>
      <h1 className="font-display text-[20px] font-semibold tracking-[-0.02em]">This screen failed to load</h1>
      <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-6 text-muted-foreground">
        Nothing was lost. Your QR codes keep resolving for anyone scanning them while you try again.
      </p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button variant="brand" onClick={reset}>
          <RefreshCw /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/support">
            <LifeBuoy /> Get help
          </Link>
        </Button>
      </div>

      {error.digest ? (
        <p className="mt-5 text-[12px] text-muted-foreground">
          Reference <span className="font-mono">{error.digest}</span>
        </p>
      ) : null}
    </Card>
  );
}
