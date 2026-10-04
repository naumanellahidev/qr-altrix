'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Alert } from '@/components/ui/feedback';

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    if (password !== confirm) {
      setErrors({ confirm: 'The two passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fields?: Record<string, string>;
      };
      if (!response.ok || !payload.ok) {
        if (payload.fields) setErrors(payload.fields);
        setFormError(payload.error ?? 'Could not reset the password.');
        return;
      }
      setDone(true);
      window.setTimeout(() => router.push('/login'), 2200);
    } catch {
      setFormError('Network problem — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4">
        <Alert tone="success" title="Password updated">
          <span className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            You can log in with your new password now. Taking you to the login page…
          </span>
        </Alert>
        <Button asChild variant="brand" size="lg" className="w-full">
          <Link href="/login">Go to log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="New password" htmlFor="new-password" required error={errors.password} help="At least 8 characters, with a number.">
        <div className="relative">
          <Input
            id="new-password"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
            autoFocus
            invalid={Boolean(errors.password)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            className="absolute right-0.5 top-0.5 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Field label="Confirm new password" htmlFor="confirm-password" required error={errors.confirm}>
        <Input
          id="confirm-password"
          type={show ? 'text' : 'password'}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          autoComplete="new-password"
          required
          invalid={Boolean(errors.confirm)}
        />
      </Field>

      {formError ? <Alert tone="error">{formError}</Alert> : null}

      <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading}>
        Save new password
      </Button>
    </form>
  );
}
