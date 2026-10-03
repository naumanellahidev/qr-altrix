'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Check, MoreHorizontal, Power, ShieldAlert, ShieldCheck, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm';
import { toast } from 'sonner';

async function send(url: string, method: 'PATCH' | 'POST', body: Record<string, unknown>): Promise<boolean> {
  const response = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!response.ok || !payload.ok) {
    toast.error(payload.error ?? 'That action failed');
    return false;
  }
  return true;
}

/** Enable/disable an account and grant or remove platform admin. */
export function UserActions({
  userId,
  email,
  isDisabled,
  isPlatformAdmin,
  isSelf,
}: {
  userId: string;
  email: string;
  isDisabled: boolean;
  isPlatformAdmin: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [confirm, setConfirm] = React.useState<'disable' | 'admin' | null>(null);

  async function act(body: Record<string, unknown>, message: string) {
    if (await send(`/api/admin/users/${userId}`, 'PATCH', body)) {
      toast.success(message);
      router.refresh();
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${email}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{email}</DropdownMenuLabel>
          {isDisabled ? (
            <DropdownMenuItem onSelect={() => void act({ isDisabled: false }, 'Account re-enabled')}>
              <Undo2 /> Re-enable account
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem destructive disabled={isSelf} onSelect={() => setConfirm('disable')}>
              <Ban /> Disable account
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            disabled={isSelf}
            onSelect={() => void act({ signOutEverywhere: true }, 'Signed out of every device')}
          >
            <Power /> Sign out everywhere
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isPlatformAdmin ? (
            <DropdownMenuItem
              disabled={isSelf}
              onSelect={() => void act({ isPlatformAdmin: false }, 'Administrator access removed')}
            >
              <ShieldCheck /> Remove admin access
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => setConfirm('admin')}>
              <ShieldAlert /> Make platform admin
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirm === 'disable'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Disable this account?"
        description={`${email} will be signed out and unable to sign in.`}
        warning="Dynamic QR codes in workspaces they own keep resolving. To stop those, disable the workspace instead."
        confirmLabel="Disable account"
        destructive
        onConfirm={() => act({ isDisabled: true }, 'Account disabled')}
      />

      <ConfirmDialog
        open={confirm === 'admin'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Grant platform admin?"
        description={`${email} will be able to see and disable every workspace and QR code on this install.`}
        warning="Give this only to people who run the server."
        confirmLabel="Grant admin access"
        onConfirm={() => act({ isPlatformAdmin: true }, 'Administrator access granted')}
      />
    </>
  );
}

/** Suspend or restore a whole workspace. */
export function WorkspaceActions({
  workspaceId,
  name,
  isDisabled,
  codeCount,
}: {
  workspaceId: string;
  name: string;
  isDisabled: boolean;
  codeCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  async function act(isDisabledNext: boolean) {
    if (await send(`/api/admin/workspaces/${workspaceId}`, 'PATCH', { isDisabled: isDisabledNext })) {
      toast.success(isDisabledNext ? 'Workspace suspended' : 'Workspace restored');
      router.refresh();
    }
  }

  return (
    <>
      {isDisabled ? (
        <Button size="xs" variant="outline" onClick={() => void act(false)}>
          <Undo2 /> Restore
        </Button>
      ) : (
        <Button size="xs" variant="destructive-outline" onClick={() => setOpen(true)}>
          <Ban /> Suspend
        </Button>
      )}

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Suspend this workspace?"
        description={`“${name}” holds ${codeCount} QR code(s).`}
        warning="Every dynamic code in this workspace stops resolving while it is suspended, and members cannot sign in to it. This is reversible."
        confirmLabel="Suspend workspace"
        destructive
        requireText={codeCount > 20 ? 'SUSPEND' : undefined}
        onConfirm={() => act(true)}
      />
    </>
  );
}

/** Disable a single QR code for abuse, with a reason sent to the owner. */
export function CodeActions({
  qrCodeId,
  name,
  status,
}: {
  qrCodeId: string;
  name: string;
  status: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [notify, setNotify] = React.useState(true);

  async function act(action: 'disable' | 'enable') {
    if (
      await send(`/api/admin/codes/${qrCodeId}`, 'POST', {
        action,
        reason: action === 'disable' ? reason.trim() : undefined,
        notifyOwner: notify,
      })
    ) {
      toast.success(action === 'disable' ? 'Code disabled' : 'Code re-enabled');
      setOpen(false);
      setReason('');
      router.refresh();
    }
  }

  if (status === 'ADMIN_DISABLED') {
    return (
      <Button size="xs" variant="outline" onClick={() => void act('enable')}>
        <Undo2 /> Re-enable
      </Button>
    );
  }

  return (
    <>
      <Button size="xs" variant="destructive-outline" onClick={() => setOpen(true)}>
        <ShieldAlert /> Disable
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Disable this QR code?"
        description={`“${name}” will show a neutral notice to anyone who scans it.`}
        warning="Use this only for abuse. The owner is told the reason and can contest it."
        confirmLabel="Disable code"
        destructive
        extra={
          <div className="space-y-3">
            <Field label="Reason (sent to the owner)" required>
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Destination is a phishing page impersonating a bank."
                rows={3}
                maxLength={400}
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={notify}
                onChange={(event) => setNotify(event.target.checked)}
                className="size-4 rounded border-input"
              />
              Email the workspace owner
            </label>
          </div>
        }
        onConfirm={async () => {
          if (!reason.trim()) {
            toast.error('A reason is required');
            return;
          }
          await act('disable');
        }}
      />
    </>
  );
}

/** Move an abuse report through review. */
export function AbuseActions({ reportId, status }: { reportId: string; status: string }) {
  const router = useRouter();
  const [resolution, setResolution] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  async function update(nextStatus: string) {
    setBusy(true);
    try {
      if (await send(`/api/admin/abuse/${reportId}`, 'PATCH', { status: nextStatus, resolution: resolution.trim() || undefined })) {
        toast.success('Report updated');
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={(value) => void update(value)}>
        <SelectTrigger className="h-8 w-[9.5rem] text-[12.5px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="REVIEWING">Reviewing</SelectItem>
          <SelectItem value="ACTIONED">Actioned</SelectItem>
          <SelectItem value="DISMISSED">Dismissed</SelectItem>
        </SelectContent>
      </Select>
      <Input
        value={resolution}
        onChange={(event) => setResolution(event.target.value)}
        placeholder="Note (optional)"
        className="h-8 max-w-[14rem] text-[12.5px]"
      />
      <Button size="xs" variant="outline" loading={busy} onClick={() => void update(status)}>
        <Check /> Save note
      </Button>
    </div>
  );
}
