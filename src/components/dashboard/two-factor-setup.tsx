'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/feedback';
import { SectionHeader } from '@/components/ui/page-header';
import { ConfirmDialog } from '@/components/ui/confirm';
import { toast } from 'sonner';

/** Two-factor enrolment: QR for the authenticator app, code check, then recovery codes. */
export function TwoFactorSetup({ enabled, hasPassword }: { enabled: boolean; hasPassword: boolean }) {
  const router = useRouter();
  const [stage, setStage] = React.useState<'idle' | 'scan' | 'done'>('idle');
  const [secret, setSecret] = React.useState('');
  const [svg, setSvg] = React.useState('');
  const [code, setCode] = React.useState('');
  const [recovery, setRecovery] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [disableOpen, setDisableOpen] = React.useState(false);
  const [disablePassword, setDisablePassword] = React.useState('');

  async function begin() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/settings/two-factor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'begin' }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        data?: { secret: string; svg: string };
      };
      if (!response.ok || !payload.ok || !payload.data) {
        toast.error(payload.error ?? 'Could not start the setup');
        return;
      }
      setSecret(payload.data.secret);
      setSvg(payload.data.svg);
      setStage('scan');
    } finally {
      setBusy(false);
    }
  }

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/settings/two-factor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'enable', secret, code }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        data?: { recoveryCodes: string[] };
      };
      if (!response.ok || !payload.ok || !payload.data) {
        setError(payload.error ?? 'That code is not right');
        return;
      }
      setRecovery(payload.data.recoveryCodes);
      setStage('done');
      toast.success('Two-factor authentication is on');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <SectionHeader
        title="Two-factor authentication"
        description="A six-digit code from your phone, on top of your password."
        actions={enabled ? <Badge variant="success">On</Badge> : <Badge variant="outline">Off</Badge>}
      />

      {enabled ? (
        <div className="space-y-3">
          <Alert tone="success" title="Your account is protected">
            You will be asked for a code from your authenticator app each time you sign in.
          </Alert>
          <Button variant="destructive-outline" onClick={() => setDisableOpen(true)}>
            <ShieldOff /> Turn off two-factor
          </Button>
        </div>
      ) : stage === 'idle' ? (
        <Button variant="brand" loading={busy} onClick={() => void begin()}>
          <ShieldCheck /> Set up two-factor
        </Button>
      ) : stage === 'scan' ? (
        <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
          <div className="rounded-xl border border-border bg-white p-3">
            <div
              className="[&>svg]:h-auto [&>svg]:w-full"
              // Rendered by our own QR engine from the otpauth:// URI.
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>

          <div className="space-y-4">
            <ol className="space-y-2 text-[13px] leading-6 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">1.</span> Open your authenticator app (Google
                Authenticator, 1Password, Authy…).
              </li>
              <li>
                <span className="font-medium text-foreground">2.</span> Scan this code, or paste the key below.
              </li>
              <li>
                <span className="font-medium text-foreground">3.</span> Enter the six digits it shows.
              </li>
            </ol>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted/60 px-3 py-2">
              <code className="min-w-0 flex-1 truncate font-mono text-[12px]">{secret}</code>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  void navigator.clipboard.writeText(secret);
                  toast.success('Setup key copied');
                }}
                aria-label="Copy setup key"
              >
                <Copy />
              </Button>
            </div>

            <Field label="Six-digit code" required error={error}>
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                className="max-w-[9rem] font-mono tracking-[0.3em]"
                invalid={Boolean(error)}
              />
            </Field>

            <div className="flex gap-2">
              <Button variant="brand" loading={busy} disabled={code.length !== 6} onClick={() => void enable()}>
                <Check /> Turn on
              </Button>
              <Button variant="ghost" onClick={() => setStage('idle')}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Alert tone="warning" title="Save your recovery codes now">
            Each code works once if you lose your phone. They are not shown again.
          </Alert>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface-muted/60 p-3 font-mono text-[13px] sm:grid-cols-4">
            {recovery.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                void navigator.clipboard.writeText(recovery.join('\n'));
                toast.success('Recovery codes copied');
              }}
            >
              <Copy /> Copy all
            </Button>
            <Button variant="brand" onClick={() => setStage('idle')}>
              <Smartphone /> Done
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        title="Turn off two-factor authentication?"
        description="Your account will be protected by your password alone."
        warning="Anyone with your password will be able to sign in."
        confirmLabel="Turn it off"
        destructive
        extra={
          hasPassword ? (
            <Field label="Confirm with your password" htmlFor="twofa-password">
              <Input
                id="twofa-password"
                type="password"
                value={disablePassword}
                onChange={(event) => setDisablePassword(event.target.value)}
                autoComplete="current-password"
              />
            </Field>
          ) : null
        }
        onConfirm={async () => {
          const response = await fetch('/api/settings/two-factor', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: 'disable', password: disablePassword || undefined }),
          });
          const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
          if (!response.ok || !payload.ok) {
            toast.error(payload.error ?? 'Could not turn it off');
            return;
          }
          toast.success('Two-factor authentication is off');
          setDisablePassword('');
          router.refresh();
        }}
      />
    </Card>
  );
}
