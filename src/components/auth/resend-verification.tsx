'use client';

import * as React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ResendVerification({ variant = 'brand' }: { variant?: 'brand' | 'outline' }) {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function resend() {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ resend: true }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; alreadyVerified?: boolean };

      if (response.status === 401) {
        toast.error('Log in first, then request a new link.');
        return;
      }
      if (payload.alreadyVerified) {
        toast.success('Your email is already confirmed.');
        setSent(true);
        return;
      }
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not send the email.');
        return;
      }
      setSent(true);
      toast.success('A fresh confirmation link is on its way.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} size="lg" className="w-full" loading={loading} disabled={sent} onClick={resend}>
      <Send /> {sent ? 'Link sent' : 'Send a new confirmation link'}
    </Button>
  );
}
