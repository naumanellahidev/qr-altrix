'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/feedback';
import { GoogleIcon } from '@/components/auth/google-icon';
import { Separator } from '@/components/ui/misc';

export interface AuthFormProps {
  mode: 'signup' | 'login';
  /** Where to go after success. Ignored when onSuccess is provided. */
  next?: string;
  onSuccess?: (result: { userId: string; claimedDraft: boolean; qrCodeId?: string | null }) => void;
  onSwitchMode?: (mode: 'signup' | 'login') => void;
  googleEnabled?: boolean;
  /** Shown above the form when a draft is waiting to be claimed. */
  draftNotice?: React.ReactNode;
  compact?: boolean;
}

export function AuthForm({
  mode,
  next = '/dashboard',
  onSuccess,
  onSwitchMode,
  googleEnabled = true,
  draftNotice,
  compact,
}: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [accept, setAccept] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [needsTwoFactor, setNeedsTwoFactor] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          mode === 'signup'
            ? { email, password, name: name || undefined, acceptTerms: accept }
            : { email, password, code: code || undefined },
        ),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        userId?: string;
        claimedDraft?: boolean;
        qrCodeId?: string | null;
        error?: string;
        fields?: Record<string, string>;
        requiresTwoFactor?: boolean;
      };

      if (response.status === 401 && payload.requiresTwoFactor) {
        setNeedsTwoFactor(true);
        setFormError('Enter the 6-digit code from your authenticator app.');
        return;
      }

      if (!response.ok || !payload.ok) {
        if (payload.fields) setErrors(payload.fields);
        setFormError(payload.error ?? 'Something went wrong. Please try again.');
        return;
      }

      if (onSuccess) {
        onSuccess({
          userId: payload.userId ?? '',
          claimedDraft: Boolean(payload.claimedDraft),
          qrCodeId: payload.qrCodeId ?? null,
        });
      } else {
        router.push(next);
        router.refresh();
      }
    } catch {
      setFormError('Network problem — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === 'signup';

  return (
    <div className="space-y-4">
      {draftNotice}

      {googleEnabled ? (
        <>
          <Button variant="outline" className="w-full" asChild>
            <a href={`/api/auth/google?next=${encodeURIComponent(next)}`}>
              <GoogleIcon /> {isSignup ? 'Sign up with Google' : 'Continue with Google'}
            </a>
          </Button>
          <div className="relative py-1">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[11.5px] uppercase tracking-wide text-muted-foreground">
              or
            </span>
          </div>
        </>
      ) : null}

      <form onSubmit={submit} className="space-y-3.5" noValidate>
        {isSignup && !compact ? (
          <Field label="Your name" htmlFor="auth-name" hint="optional">
            <Input
              id="auth-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              placeholder="Ayesha Khan"
            />
          </Field>
        ) : null}

        <Field label="Email" htmlFor="auth-email" required error={errors.email}>
          <Input
            id="auth-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
            required
            invalid={Boolean(errors.email)}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="auth-password"
          required
          error={errors.password}
          help={isSignup ? 'At least 8 characters, with a number.' : undefined}
        >
          <div className="relative">
            <Input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder={isSignup ? 'Create a password' : 'Your password'}
              required
              invalid={Boolean(errors.password)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-1 top-1 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        {needsTwoFactor ? (
          <Field label="Authentication code" htmlFor="auth-code" required>
            <Input
              id="auth-code"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              className="font-mono tracking-[0.3em]"
              autoFocus
            />
          </Field>
        ) : null}

        {isSignup ? (
          <label className="flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-5 text-muted-foreground">
            <Checkbox
              checked={accept}
              onCheckedChange={(checked) => setAccept(checked === true)}
              className="mt-0.5"
              aria-invalid={Boolean(errors.acceptTerms)}
            />
            <span>
              I agree to the{' '}
              <Link href="/legal/terms" className="font-medium text-primary hover:underline" target="_blank">
                terms of service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="font-medium text-primary hover:underline" target="_blank">
                privacy policy
              </Link>
              .
            </span>
          </label>
        ) : null}

        {formError ? <Alert tone="error">{formError}</Alert> : null}

        <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading}>
          {isSignup ? 'Sign up now' : 'Log in'}
        </Button>
      </form>

      <div className="flex flex-col gap-2 text-center text-[12.5px] text-muted-foreground">
        {isSignup ? (
          <p>
            Already have an account?{' '}
            {onSwitchMode ? (
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => onSwitchMode('login')}
              >
                Log in
              </button>
            ) : (
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            )}
          </p>
        ) : (
          <>
            <p>
              <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                Forgot your password?
              </Link>
            </p>
            <p>
              New to QR ALTRIX?{' '}
              {onSwitchMode ? (
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => onSwitchMode('signup')}
                >
                  Create a free account
                </button>
              ) : (
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Create a free account
                </Link>
              )}
            </p>
          </>
        )}
        <p className="flex items-center justify-center gap-1.5 pt-1 text-[11.5px]">
          <ShieldCheck className="size-3.5 text-success" />
          Free forever. Dynamic codes never expire.
        </p>
      </div>
    </div>
  );
}
