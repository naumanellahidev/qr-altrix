'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarClock, Infinity as InfinityIcon, KeyRound, Plus, Save, ShieldAlert, ShieldCheck, X,
} from 'lucide-react';
import type { PlatformSettings } from '@/lib/settings';
import { summarizeExpiryPolicy } from '@/lib/qr/expiry';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SwitchRow } from '@/components/ui/switch';
import { Alert } from '@/components/ui/feedback';
import { SectionHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';

export function PlatformSettingsForm({ initial }: { initial: PlatformSettings }) {
  const router = useRouter();
  const [form, setForm] = React.useState<PlatformSettings>(initial);
  const [keyword, setKeyword] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  function patch(next: Partial<PlatformSettings>) {
    setForm((current) => ({ ...current, ...next }));
  }

  async function save() {
    setBusy(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not save those settings');
        return;
      }
      toast.success('Platform settings saved');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {form.expiryEnabled ? (
        <Alert tone="warning" title="Expiry is switched ON for this install">
          <span className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 size-3.5 shrink-0" />
            {summarizeExpiryPolicy({
              enabled: true,
              expireAfterDays: form.expireAfterDays,
              expireInactiveAfterDays: form.expireInactiveAfterDays,
              appliesToExisting: form.expiryAppliesToExisting,
              enabledAt: form.expiryEnabledAt,
            })}{' '}
            Printed codes that pass the limit show a friendly notice and can be revived by their owner — nothing is
            deleted.
          </span>
        </Alert>
      ) : (
        <Alert tone="success" title="Expiry is OFF — dynamic codes never expire">
          <span className="flex items-start gap-2">
            <InfinityIcon className="mt-0.5 size-3.5 shrink-0" />
            This is the default. You can turn expiry on below, and you stay in control of the rules.
          </span>
        </Alert>
      )}

      <Card className="p-5">
        <SectionHeader title="Sign-ups and access" />
        <div className="space-y-4">
          <SwitchRow
            label="Allow new sign-ups"
            description="Turn off to make this a closed, invitation-only install."
            checked={form.allowSignups}
            onCheckedChange={(checked) => patch({ allowSignups: checked })}
          />
          <SwitchRow
            label="Require a confirmed email before creating dynamic codes"
            description="Unconfirmed accounts can still make static codes and download the code they designed before signing up; new dynamic codes wait for the email link. Needs working email (SMTP)."
            checked={form.requireEmailVerification}
            onCheckedChange={(checked) => patch({ requireEmailVerification: checked })}
          />
          <SwitchRow
            label="Let visitors download static codes without an account"
            description="Static codes carry no tracking, so this is usually safe. Dynamic codes always need an account."
            checked={form.allowGuestStaticDownload}
            onCheckedChange={(checked) => patch({ allowGuestStaticDownload: checked })}
          />
        </div>
      </Card>

      {/* ------------------------------------------------------------- expiry */}
      <Card className={form.expiryEnabled ? 'border-warning/35 p-5' : 'p-5'}>
        <SectionHeader
          title="Expiry policy"
          description="You decide whether QR codes on this install have a lifetime. Off by default."
        />

        <div className="space-y-4">
          <SwitchRow
            label={
              <span className="flex items-center gap-1.5">
                <CalendarClock className="size-3.5" /> Allow QR codes to expire
              </span>
            }
            description="While this is off, no dynamic code can stop working because of its age or inactivity."
            checked={form.expiryEnabled}
            onCheckedChange={(checked) => patch({ expiryEnabled: checked })}
          />

          {form.expiryEnabled ? (
            <>
              <Alert tone="warning" title="This affects printed material">
                A code that expires shows a notice instead of its destination. Posters, menus and packaging already in
                the world will stop working until the owner extends the code. Set generous limits, and tell your users.
              </Alert>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Expire this many days after creation"
                  help="0 = never expire by age. For example 365 gives every code a one-year life."
                >
                  <Input
                    type="number"
                    min={0}
                    max={3650}
                    value={form.expireAfterDays}
                    onChange={(event) => patch({ expireAfterDays: Number(event.target.value) || 0 })}
                  />
                </Field>

                <Field
                  label="Expire after this many days with no scans"
                  help="0 = never expire for inactivity. Useful for clearing out abandoned codes."
                >
                  <Input
                    type="number"
                    min={0}
                    max={3650}
                    value={form.expireInactiveAfterDays}
                    onChange={(event) => patch({ expireInactiveAfterDays: Number(event.target.value) || 0 })}
                  />
                </Field>
              </div>

              <div className="rounded-xl border border-border p-3.5">
                <SwitchRow
                  label="Apply to codes that already exist"
                  description="Off is safer: only codes created after you switched expiry on are affected. On applies the rule to every code, which can retire old printed codes immediately."
                  checked={form.expiryAppliesToExisting}
                  onCheckedChange={(checked) => patch({ expiryAppliesToExisting: checked })}
                />
              </div>

              <p className="rounded-xl bg-surface-muted/60 px-3 py-2.5 text-[12.5px] leading-6 text-muted-foreground">
                <strong className="font-medium text-foreground">Effect:</strong>{' '}
                {summarizeExpiryPolicy({
                  enabled: true,
                  expireAfterDays: form.expireAfterDays,
                  expireInactiveAfterDays: form.expireInactiveAfterDays,
                  appliesToExisting: form.expiryAppliesToExisting,
                  enabledAt: form.expiryEnabledAt,
                })}{' '}
                Owners see the expiry date on each code, and nothing is ever deleted — switching this off brings every
                code straight back.
              </p>
            </>
          ) : null}
        </div>
      </Card>

      {/* ----------------------------------------------------------- security */}
      <Card className="p-5">
        <SectionHeader
          title="Login and admin security"
          description="Applies to every account on this install, including yours."
        />
        <div className="space-y-4">
          <SwitchRow
            label={
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> Require two-factor authentication for administrators
              </span>
            }
            description="An admin without 2FA is sent to enrol before the admin panel opens. Enrol yours first so you are not locked out."
            checked={form.requireTwoFactorForAdmins}
            onCheckedChange={(checked) => patch({ requireTwoFactorForAdmins: checked })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Sign out after inactivity (minutes)"
              help="0 = never. 60 is a reasonable choice for a shared computer."
            >
              <Input
                type="number"
                min={0}
                max={10080}
                value={form.sessionIdleTimeoutMinutes}
                onChange={(event) => patch({ sessionIdleTimeoutMinutes: Number(event.target.value) || 0 })}
              />
            </Field>

            <Field
              label="Lock an account after this many failed sign-ins"
              help="Counted over 15 minutes, per account. A password reset always gets them back in."
            >
              <Input
                type="number"
                min={3}
                max={100}
                value={form.lockoutAfterFailedAttempts}
                onChange={(event) => patch({ lockoutAfterFailedAttempts: Number(event.target.value) || 10 })}
              />
            </Field>
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-surface-muted/60 px-3 py-2.5 text-[12.5px] leading-6 text-muted-foreground">
            <KeyRound className="mt-0.5 size-3.5 shrink-0" />
            Always on, regardless of these switches: bcrypt password hashing, signed HTTP-only session cookies with a
            version counter, per-IP rate limits on sign-in and the API, hashed API keys, Zod validation on every
            request, sanitised uploads, and a security log of every sensitive action.
          </p>
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader title="Privacy and retention" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Visitor IP handling"
            help="Hashed lets unique visitors be counted without identifying anyone. Never disables that count."
          >
            <Select
              value={form.ipStorageMode}
              onValueChange={(value) => patch({ ipStorageMode: value as PlatformSettings['ipStorageMode'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hashed">Salted hash (recommended)</SelectItem>
                <SelectItem value="never">Do not process IPs at all</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Delete scan rows after (days)"
            help="0 keeps analytics forever. This only trims history — codes are untouched."
          >
            <Input
              type="number"
              min={0}
              max={3650}
              value={form.analyticsRetentionDays}
              onChange={(event) => patch({ analyticsRetentionDays: Number(event.target.value) || 0 })}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader title="Abuse protection" description="Limits are per minute, per key or per IP address." />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="API requests / minute">
            <Input
              type="number"
              min={10}
              max={100000}
              value={form.rateLimitApiPerMin}
              onChange={(event) => patch({ rateLimitApiPerMin: Number(event.target.value) || 120 })}
            />
          </Field>
          <Field label="Auth attempts / minute">
            <Input
              type="number"
              min={3}
              max={1000}
              value={form.rateLimitAuthPerMin}
              onChange={(event) => patch({ rateLimitAuthPerMin: Number(event.target.value) || 10 })}
            />
          </Field>
          <Field label="Max upload size (MB)">
            <Input
              type="number"
              min={1}
              max={500}
              value={form.maxUploadMb}
              onChange={(event) => patch({ maxUploadMb: Number(event.target.value) || 15 })}
            />
          </Field>
          <Field label="Max rows per bulk import" className="sm:col-span-3 sm:max-w-xs">
            <Input
              type="number"
              min={10}
              max={1000000}
              value={form.bulkMaxRows}
              onChange={(event) => patch({ bulkMaxRows: Number(event.target.value) || 20000 })}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field
            label="Flag destinations containing these words"
            help="Matching codes are flagged for review. Nothing is disabled automatically."
          >
            <div className="flex gap-2">
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="free-crypto-giveaway"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && keyword.trim()) {
                    event.preventDefault();
                    patch({ abuseKeywords: [...form.abuseKeywords, keyword.trim().toLowerCase()] });
                    setKeyword('');
                  }
                }}
              />
              <Button
                variant="outline"
                disabled={!keyword.trim()}
                onClick={() => {
                  patch({ abuseKeywords: [...form.abuseKeywords, keyword.trim().toLowerCase()] });
                  setKeyword('');
                }}
              >
                <Plus /> Add
              </Button>
            </div>
          </Field>
          {form.abuseKeywords.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {form.abuseKeywords.map((word) => (
                <span
                  key={word}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted px-2.5 py-1 font-mono text-[11.5px]"
                >
                  {word}
                  <button
                    type="button"
                    onClick={() => patch({ abuseKeywords: form.abuseKeywords.filter((item) => item !== word) })}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Remove ${word}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader
          title="Dashboard notice"
          description="Shown as a banner to every signed-in user. Leave empty for none."
        />
        <Textarea
          value={form.maintenanceNote}
          onChange={(event) => patch({ maintenanceNote: event.target.value })}
          placeholder="Scheduled maintenance on Sunday 02:00–03:00 UTC. Scans keep working throughout."
          maxLength={400}
          rows={3}
        />
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="brand" loading={busy} onClick={() => void save()}>
          <Save /> Save platform settings
        </Button>
        <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <ShieldAlert className="size-3.5" /> Changes apply within 20 seconds across all processes.
        </p>
      </div>
    </div>
  );
}
