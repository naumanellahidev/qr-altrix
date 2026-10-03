'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { toast } from 'sonner';

export function AcceptInvite({ token, workspaceName }: { token: string; workspaceName: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function accept() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/team/accept', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? 'Could not accept the invitation.');
        return;
      }
      toast.success(`You are now part of ${workspaceName}`);
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network problem — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Button variant="brand" size="lg" className="w-full" loading={loading} onClick={accept}>
        Accept invitation <ArrowRight />
      </Button>
    </div>
  );
}
