'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DRAFT_STORAGE_KEY } from '@/components/qr/use-draft';
import { toast } from 'sonner';

/**
 * Runs once after signup or login when `?claim=1` is present: turns the homepage draft
 * into a saved QR code and takes the user straight to its download.
 */
export function ClaimDraft() {
  const router = useRouter();
  const params = useSearchParams();
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (ran.current) return;
    if (params.get('claim') !== '1') return;
    ran.current = true;

    void (async () => {
      try {
        const response = await fetch('/api/drafts/claim', { method: 'POST' });
        const payload = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          claimed?: boolean;
          qrCodeId?: string | null;
        };

        if (payload.claimed && payload.qrCodeId) {
          try {
            window.localStorage.removeItem(DRAFT_STORAGE_KEY);
          } catch {
            /* private mode */
          }
          toast.success('Your QR code was saved to your account');
          router.replace(`/dashboard/codes/${payload.qrCodeId}?download=1`);
          return;
        }

        // Nothing to claim: clean the URL so a refresh does not try again.
        router.replace('/dashboard');
      } catch {
        router.replace('/dashboard');
      }
    })();
  }, [params, router]);

  return null;
}
