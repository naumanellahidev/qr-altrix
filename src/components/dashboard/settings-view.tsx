'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck, Bell, Building2, Check, Globe2, KeyRound, Languages, Mail, Palette, Plus, Save,
  ShieldCheck, Trash2, TriangleAlert, X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SwitchRow } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTriggerLine } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/feedback';
import { SectionHeader } from '@/components/ui/page-header';
import { ConfirmDialog } from '@/components/ui/confirm';
import { ColorInput } from '@/components/qr/color-input';
import { ResendVerification } from '@/components/auth/resend-verification';
import { TwoFactorSetup } from '@/components/dashboard/two-factor-setup';
import { bytesToSize } from '@/lib/utils';
import { toast } from 'sonner';

export interface SettingsUser {
  id: string;
  email: string;
  name: string | null;
  surname: string | null;
  phone: string | null;
  locale: string;
  timezone: string;
  dateFormat: string;
  hour12: boolean;
  thousandsSep: string;
  theme: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  notifyProduct: boolean;
  notifySecurity: boolean;
  notifyScanDigest: boolean;
  createdAt: string;
  hasPassword: boolean;
}

export interface SettingsWorkspace {
  id: string;
  name: string;
  slug: string;
  role: string;
  storageUsedBytes: number;
  tracking: { ga4?: string; metaPixel?: string; gtm?: string } | null;
  brandColors: string[];
  canDeleteOwnAccount: boolean;
  canManage: boolean;
}

const TIMEZONES = [
  'UTC', 'Asia/Karachi', 'Asia/Dubai', 'Asia/Riyadh', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Singapore',
  'Asia/Tokyo', 'Europe/London', 'Europe/Dublin', 'Europe/Berlin', 'Europe/Paris', 'Europe/Madrid',
  'Europe/Istanbul', 'Africa/Cairo', 'Africa/Lagos', 'America/New_York', 'America/Chicago',
  'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo', 'Australia/Sydney', 'Pacific/Auckland',
];

const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'اردو (Urdu)' },
  { value: 'ar', label: 'العربية (Arabic)' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'id', label: 'Bahasa Indonesia' },
];

export function SettingsView({ user, workspace }: { user: SettingsUser; workspace: SettingsWorkspace }) {
  const router = useRouter();

  const [profile, setProfile] = React.useState({
    name: user.name ?? '',
    surname: user.surname ?? '',
    phone: user.phone ?? '',
  });
  const [locale, setLocale] = React.useState({
    locale: user.locale,
    timezone: user.timezone,
    dateFormat: user.dateFormat,
    hour12: user.hour12,
    thousandsSep: user.thousandsSep,
  });
  const [notifications, setNotifications] = React.useState({
    notifyProduct: user.notifyProduct,
    notifySecurity: user.notifySecurity,
    notifyScanDigest: user.notifyScanDigest,
  });
  const [tracking, setTracking] = React.useState({
    ga4: workspace.tracking?.ga4 ?? '',
    metaPixel: workspace.tracking?.metaPixel ?? '',
    gtm: workspace.tracking?.gtm ?? '',
  });
  const [workspaceForm, setWorkspaceForm] = React.useState({
    name: workspace.name,
    brandColors: workspace.brandColors.length > 0 ? workspace.brandColors : ['#4F46E5'],
  });
  const [passwords, setPasswords] = React.useState({ current: '', next: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState('');

  async function patchSection(section: string, body: Record<string, unknown>, message: string) {
    setBusy(section);
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ section, ...body }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not save those settings');
        return;
      }
      toast.success(message);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function changePassword() {
    setPasswordErrors({});
    if (passwords.next !== passwords.confirm) {
      setPasswordErrors({ confirm: 'The two passwords do not match' });
      return;
    }
    setBusy('password');
    try {
      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current || 'unused', newPassword: passwords.next }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fields?: Record<string, string>;
      };
      if (!response.ok || !payload.ok) {
        if (payload.fields) setPasswordErrors(payload.fields);
        toast.error(payload.error ?? 'Could not change the password');
        return;
      }
      toast.success('Password changed. Other devices were signed out.');
      setPasswords({ current: '', next: '', confirm: '' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <Tabs defaultValue="general">
      <TabsList variant="underline" className="mb-6">
        <TabsTriggerLine value="general">
          <BadgeCheck /> General
        </TabsTriggerLine>
        <TabsTriggerLine value="locale">
          <Languages /> Language & format
        </TabsTriggerLine>
        <TabsTriggerLine value="security">
          <ShieldCheck /> Security
        </TabsTriggerLine>
        <TabsTriggerLine value="notifications">
          <Bell /> Notifications
        </TabsTriggerLine>
        <TabsTriggerLine value="tracking">
          <Globe2 /> Tracking
        </TabsTriggerLine>
        <TabsTriggerLine value="workspace">
          <Building2 /> Workspace
        </TabsTriggerLine>
        <TabsTriggerLine value="account">
          <TriangleAlert /> Account status
        </TabsTriggerLine>
      </TabsList>

      {/* ------------------------------------------------------------- general */}
      <TabsContent value="general" className="space-y-5">
        <Card className="p-5">
          <SectionHeader title="General information" description="How your name appears to teammates." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} maxLength={80} />
            </Field>
            <Field label="Surname">
              <Input
                value={profile.surname}
                onChange={(event) => setProfile({ ...profile, surname: event.target.value })}
                maxLength={80}
              />
            </Field>
            <Field label="Email" help="Email changes are not supported yet — contact support if you need one.">
              <Input value={user.email} disabled suffix={user.emailVerified ? <Check className="size-3.5 text-success" /> : undefined} />
            </Field>
            <Field label="Phone" hint="optional">
              <Input
                value={profile.phone}
                onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                type="tel"
                maxLength={40}
              />
            </Field>
          </div>
          <div className="mt-5">
            <Button
              variant="brand"
              loading={busy === 'profile'}
              onClick={() => void patchSection('profile', profile, 'Profile saved')}
            >
              <Save /> Save changes
            </Button>
          </div>
        </Card>
      </TabsContent>

      {/* -------------------------------------------------------------- locale */}
      <TabsContent value="locale" className="space-y-5">
        <Card className="p-5">
          <SectionHeader title="Language, timezone and formats" description="Affects how dates and numbers are shown to you." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Interface language" help="Dates and number formats follow this immediately.">
              <Select value={locale.locale} onValueChange={(value) => setLocale({ ...locale, locale: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCALES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Timezone" help="Analytics charts and schedules use this.">
              <Select value={locale.timezone} onValueChange={(value) => setLocale({ ...locale, timezone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Date format">
              <Select value={locale.dateFormat} onValueChange={(value) => setLocale({ ...locale, dateFormat: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">31/12/2026</SelectItem>
                  <SelectItem value="MM/dd/yyyy">12/31/2026</SelectItem>
                  <SelectItem value="yyyy-MM-dd">2026-12-31</SelectItem>
                  <SelectItem value="d MMM yyyy">31 Dec 2026</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Thousands separator">
              <Select
                value={locale.thousandsSep}
                onValueChange={(value) => setLocale({ ...locale, thousandsSep: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">1,234,567</SelectItem>
                  <SelectItem value=".">1.234.567</SelectItem>
                  <SelectItem value="space">1 234 567</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-4 rounded-xl border border-border p-3.5">
            <SwitchRow
              label="12-hour clock"
              description="Off shows times as 18:30, on shows 6:30 pm."
              checked={locale.hour12}
              onCheckedChange={(checked) => setLocale({ ...locale, hour12: checked })}
            />
          </div>

          <div className="mt-5">
            <Button
              variant="brand"
              loading={busy === 'profile'}
              onClick={() => void patchSection('profile', locale, 'Preferences saved')}
            >
              <Save /> Save preferences
            </Button>
          </div>
        </Card>
      </TabsContent>

      {/* ------------------------------------------------------------ security */}
      <TabsContent value="security" className="space-y-5">
        <Card className="p-5">
          <SectionHeader
            title={user.hasPassword ? 'Change password' : 'Set a password'}
            description={
              user.hasPassword
                ? 'Changing your password signs out every other device.'
                : 'Your account signs in with Google. Add a password as a second way in.'
            }
          />
          <div className="grid gap-4 sm:max-w-md">
            {user.hasPassword ? (
              <Field label="Current password" required error={passwordErrors.currentPassword}>
                <Input
                  type="password"
                  value={passwords.current}
                  onChange={(event) => setPasswords({ ...passwords, current: event.target.value })}
                  autoComplete="current-password"
                  invalid={Boolean(passwordErrors.currentPassword)}
                />
              </Field>
            ) : null}
            <Field label="New password" required error={passwordErrors.newPassword} help="At least 8 characters, with a number.">
              <Input
                type="password"
                value={passwords.next}
                onChange={(event) => setPasswords({ ...passwords, next: event.target.value })}
                autoComplete="new-password"
                invalid={Boolean(passwordErrors.newPassword)}
              />
            </Field>
            <Field label="Confirm new password" required error={passwordErrors.confirm}>
              <Input
                type="password"
                value={passwords.confirm}
                onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
                autoComplete="new-password"
                invalid={Boolean(passwordErrors.confirm)}
              />
            </Field>
          </div>
          <div className="mt-5">
            <Button
              variant="brand"
              loading={busy === 'password'}
              disabled={!passwords.next || !passwords.confirm}
              onClick={() => void changePassword()}
            >
              <KeyRound /> {user.hasPassword ? 'Change password' : 'Set password'}
            </Button>
          </div>
        </Card>

        <TwoFactorSetup enabled={user.twoFactorEnabled} hasPassword={user.hasPassword} />

        <Card className="p-5">
          <SectionHeader title="API keys" description="Programmatic access lives on the developers page." />
          <Button asChild variant="outline">
            <Link href="/dashboard/developers">
              <KeyRound /> Manage API keys
            </Link>
          </Button>
        </Card>
      </TabsContent>

      {/* ------------------------------------------------------- notifications */}
      <TabsContent value="notifications" className="space-y-5">
        <Card className="p-5">
          <SectionHeader title="Email notifications" description="We keep these to a minimum." />
          <div className="space-y-4">
            <SwitchRow
              label="Security alerts"
              description="Password changes, new sign-ins and admin actions on your codes. Strongly recommended."
              checked={notifications.notifySecurity}
              onCheckedChange={(checked) => setNotifications({ ...notifications, notifySecurity: checked })}
            />
            <SwitchRow
              label="Weekly scan digest"
              description="A short summary of how your codes performed last week."
              checked={notifications.notifyScanDigest}
              onCheckedChange={(checked) => setNotifications({ ...notifications, notifyScanDigest: checked })}
            />
            <SwitchRow
              label="Product updates"
              description="Occasional notes about new QR types and features."
              checked={notifications.notifyProduct}
              onCheckedChange={(checked) => setNotifications({ ...notifications, notifyProduct: checked })}
            />
          </div>
          <div className="mt-5">
            <Button
              variant="brand"
              loading={busy === 'notifications'}
              onClick={() => void patchSection('notifications', notifications, 'Notification preferences saved')}
            >
              <Save /> Save preferences
            </Button>
          </div>
        </Card>
      </TabsContent>

      {/* ----------------------------------------------------------- tracking */}
      <TabsContent value="tracking" className="space-y-5">
        <Card className="p-5">
          <SectionHeader
            title="Tracking integrations"
            description="Added to the landing pages QR ALTRIX hosts for you (menus, link lists, vCard Plus and the rest). Redirect codes pass UTM parameters to your own site instead."
          />
          {!workspace.canManage ? (
            <Alert tone="info" className="mb-4">
              Your role can view these settings but not change them.
            </Alert>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Google Analytics 4" help="Measurement ID, for example G-ABCD1234.">
              <Input
                value={tracking.ga4}
                onChange={(event) => setTracking({ ...tracking, ga4: event.target.value })}
                placeholder="G-XXXXXXXXXX"
                disabled={!workspace.canManage}
              />
            </Field>
            <Field label="Google Tag Manager" help="Container ID, for example GTM-ABCD12.">
              <Input
                value={tracking.gtm}
                onChange={(event) => setTracking({ ...tracking, gtm: event.target.value })}
                placeholder="GTM-XXXXXX"
                disabled={!workspace.canManage}
              />
            </Field>
            <Field label="Meta (Facebook) Pixel" help="Numeric pixel ID.">
              <Input
                value={tracking.metaPixel}
                onChange={(event) => setTracking({ ...tracking, metaPixel: event.target.value })}
                placeholder="123456789012345"
                disabled={!workspace.canManage}
              />
            </Field>
          </div>
          <Alert tone="info" className="mt-4">
            Webhooks give you raw scan events in your own systems. Set them up on the developers page.
          </Alert>
          {workspace.canManage ? (
            <div className="mt-5">
              <Button
                variant="brand"
                loading={busy === 'tracking'}
                onClick={() => void patchSection('tracking', tracking, 'Tracking settings saved')}
              >
                <Save /> Save tracking
              </Button>
            </div>
          ) : null}
        </Card>
      </TabsContent>

      {/* ---------------------------------------------------------- workspace */}
      <TabsContent value="workspace" className="space-y-5">
        <Card className="p-5">
          <SectionHeader title="Workspace" description="Shown in the switcher and on invitations." />
          <div className="grid gap-4 sm:max-w-md">
            <Field label="Workspace name">
              <Input
                value={workspaceForm.name}
                onChange={(event) => setWorkspaceForm({ ...workspaceForm, name: event.target.value })}
                maxLength={80}
                disabled={!workspace.canManage}
              />
            </Field>
            <Field label="Workspace address" help="Used internally; cannot be changed.">
              <Input value={workspace.slug} disabled />
            </Field>
          </div>

          <div className="mt-5">
            <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium">
              <Palette className="size-3.5" /> Brand kit colours
            </p>
            <p className="mb-3 text-[12.5px] text-muted-foreground">
              These appear as one-click swatches in the QR design editor.
            </p>
            <div className="flex flex-wrap items-end gap-2">
              {workspaceForm.brandColors.map((color, index) => (
                <div key={index} className="flex items-end gap-1">
                  <ColorInput
                    value={color}
                    onChange={(value) =>
                      setWorkspaceForm({
                        ...workspaceForm,
                        brandColors: workspaceForm.brandColors.map((item, i) => (i === index ? value : item)),
                      })
                    }
                  />
                  {workspace.canManage && workspaceForm.brandColors.length > 1 ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setWorkspaceForm({
                          ...workspaceForm,
                          brandColors: workspaceForm.brandColors.filter((_, i) => i !== index),
                        })
                      }
                      aria-label="Remove colour"
                    >
                      <X />
                    </Button>
                  ) : null}
                </div>
              ))}
              {workspace.canManage && workspaceForm.brandColors.length < 12 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setWorkspaceForm({ ...workspaceForm, brandColors: [...workspaceForm.brandColors, '#0EA5E9'] })
                  }
                >
                  <Plus /> Add colour
                </Button>
              ) : null}
            </div>
          </div>

          {workspace.canManage ? (
            <div className="mt-5">
              <Button
                variant="brand"
                loading={busy === 'workspace'}
                onClick={() =>
                  void patchSection(
                    'workspace',
                    { name: workspaceForm.name, brandColors: workspaceForm.brandColors },
                    'Workspace saved',
                  )
                }
              >
                <Save /> Save workspace
              </Button>
            </div>
          ) : null}
        </Card>

        <Card className="p-5">
          <SectionHeader title="Storage" description="Uploads for PDFs, images, audio and logos." />
          <p className="text-[22px] font-semibold tabular-nums">{bytesToSize(workspace.storageUsedBytes)}</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Stored on your own server. There is no quota beyond the disk you give it.
          </p>
        </Card>
      </TabsContent>

      {/* ------------------------------------------------------------ account */}
      <TabsContent value="account" className="space-y-5">
        <Card className="p-5">
          <SectionHeader title="Account status" />
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">Email</dt>
              <dd className="flex items-center gap-2 text-[13.5px]">
                {user.email}
                {user.emailVerified ? (
                  <Badge variant="success">
                    <Check className="size-3" /> Confirmed
                  </Badge>
                ) : (
                  <Badge variant="warning">Not confirmed</Badge>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">Member since</dt>
              <dd className="text-[13.5px]">{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">
                Two-factor authentication
              </dt>
              <dd className="text-[13.5px]">{user.twoFactorEnabled ? 'On' : 'Off'}</dd>
            </div>
            <div>
              <dt className="text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">
                Role in this workspace
              </dt>
              <dd className="text-[13.5px]">{workspace.role}</dd>
            </div>
          </dl>

          {!user.emailVerified ? (
            <div className="mt-4 max-w-sm">
              <Alert tone="warning" className="mb-3" title="Confirm your email">
                <span className="flex items-start gap-2">
                  <Mail className="mt-0.5 size-3.5 shrink-0" />
                  Without a confirmed email you cannot recover the account if you lose your password.
                </span>
              </Alert>
              <ResendVerification variant="outline" />
            </div>
          ) : null}
        </Card>

        <Card className="border-destructive/25 p-5">
          <SectionHeader
            title="Delete this account"
            description="Removes your account, the workspaces you own, and every QR code inside them."
          />
          {!workspace.canDeleteOwnAccount ? (
            <Alert tone="warning">
              An administrator has disabled self-deletion for your account. Ask them to remove it for you.
            </Alert>
          ) : (
            <>
              <Alert tone="error" className="mb-4" title="Printed codes will stop working">
                Every dynamic code you own stops resolving the moment the account is deleted. If you only want to stop a
                code, pause it instead.
              </Alert>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 /> Delete my account
              </Button>
            </>
          )}
        </Card>
      </TabsContent>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete your account?"
        description="This removes your account, the workspaces you own and all of their QR codes."
        warning="This cannot be undone, and anyone scanning your printed codes will see an inactive page."
        confirmLabel="Delete everything"
        destructive
        requireText="DELETE"
        extra={
          user.hasPassword ? (
            <Field label="Confirm with your password" htmlFor="delete-password">
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                autoComplete="current-password"
              />
            </Field>
          ) : null
        }
        onConfirm={async () => {
          const response = await fetch('/api/account', {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ confirm: 'DELETE', password: deletePassword || undefined }),
          });
          const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
          if (!response.ok || !payload.ok) {
            toast.error(payload.error ?? 'Could not delete the account');
            return;
          }
          window.location.href = '/';
        }}
      />

    </Tabs>
  );
}
