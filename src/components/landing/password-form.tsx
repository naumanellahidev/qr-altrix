'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';

export function PasswordForm({ code }: { code: string }) {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code, password }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? 'That password is not right.');
        return;
      }
      // The unlock cookie is now set, so the normal scan path takes over.
      window.location.replace(`/q/${encodeURIComponent(code)}`);
    } catch {
      setError('Network problem — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Password" htmlFor="qr-password" error={error}>
        <Input
          id="qr-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          autoComplete="off"
          placeholder="Enter password"
          invalid={Boolean(error)}
          required
        />
      </Field>
      <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading}>
        Unlock <ArrowRight />
      </Button>
    </form>
  );
}
