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
import { useGeneratorCopy } from '@/components/qr/generator-copy';

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
  const a = useGeneratorCopy().copy.auth;
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
        setFormError(a.errorCode);
        return;
      }

      if (!response.ok || !payload.ok) {
        if (payload.fields) setErrors(payload.fields);
        setFormError(payload.error ?? a.errorGeneric);
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
      setFormError(a.errorNetwork);
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
              <GoogleIcon /> {isSignup ? a.googleSignup : a.googleContinue}
            </a>
          </Button>
          <div className="relative py-1">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[11.5px] uppercase tracking-wide text-muted-foreground">
              {a.or}
            </span>
          </div>
        </>
      ) : null}

      <form onSubmit={submit} className="space-y-3.5" noValidate>
        {isSignup && !compact ? (
          <Field label={a.name} htmlFor="auth-name" hint={a.optional}>
            <Input
              id="auth-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              placeholder={a.namePlaceholder}
            />
          </Field>
        ) : null}

        <Field label={a.email} htmlFor="auth-email" required error={errors.email}>
          <Input
            id="auth-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder={a.emailPlaceholder}
            required
            invalid={Boolean(errors.email)}
          />
        </Field>

        <Field
          label={a.password}
          htmlFor="auth-password"
          required
          error={errors.password}
          help={isSignup ? a.passwordHelp : undefined}
        >
          <div className="relative">
            <Input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder={isSignup ? a.passwordCreate : a.passwordYours}
              required
              invalid={Boolean(errors.password)}
              className="pe-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute end-0.5 top-0.5 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? a.hidePassword : a.showPassword}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        {needsTwoFactor ? (
          <Field label={a.code} htmlFor="auth-code" required>
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
              {a.agree}{' '}
              <Link href="/legal/terms" className="font-medium text-primary hover:underline" target="_blank">
                {a.termsLink}
              </Link>{' '}
              {a.and}{' '}
              <Link href="/legal/privacy" className="font-medium text-primary hover:underline" target="_blank">
                {a.privacyLink}
              </Link>
              .
            </span>
          </label>
        ) : null}

        {formError ? <Alert tone="error">{formError}</Alert> : null}

        <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading}>
          {isSignup ? a.signup : a.login}
        </Button>
      </form>

      <div className="flex flex-col gap-2 text-center text-[12.5px] text-muted-foreground">
        {isSignup ? (
          <p>
            {a.haveAccount}{' '}
            {onSwitchMode ? (
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => onSwitchMode('login')}
              >
                {a.login}
              </button>
            ) : (
              <Link href="/login" className="font-medium text-primary hover:underline">
                {a.login}
              </Link>
            )}
          </p>
        ) : (
          <>
            <p>
              <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                {a.forgot}
              </Link>
            </p>
            <p>
              {a.newHere}{' '}
              {onSwitchMode ? (
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => onSwitchMode('signup')}
                >
                  {a.createAccount}
                </button>
              ) : (
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  {a.createAccount}
                </Link>
              )}
            </p>
          </>
        )}
        <p className="flex items-center justify-center gap-1.5 pt-1 text-[11.5px]">
          <ShieldCheck className="size-3.5 text-success" />
          {a.freeForever}
        </p>
      </div>
    </div>
  );
}
