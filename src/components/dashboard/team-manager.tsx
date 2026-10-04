'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Crown, MailPlus, MoreHorizontal, RefreshCw, Trash2, UserCheck, UserX } from 'lucide-react';
import type { Role } from '@prisma/client';
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/lib/rbac';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert } from '@/components/ui/feedback';
import { ConfirmDialog } from '@/components/ui/confirm';
import { CopyField } from '@/components/ui/copy-button';
import { toast } from 'sonner';
import { useDateFormat, DATE, DATE_TIME, TIME } from '@/lib/hooks/use-date-format';

const ASSIGNABLE: Role[] = ['ADMIN', 'EDITOR', 'ANALYST', 'VIEWER', 'LIMITED'];

export interface MemberRow {
  id: string;
  email: string;
  role: Role;
  status: 'PENDING' | 'ACTIVE' | 'DISABLED';
  invitedAt: string;
  acceptedAt: string | null;
  lastAccessAt: string | null;
  canDeleteOwnAccount: boolean;
  folderScopes: string[];
  isOwner: boolean;
  isYou: boolean;
  name: string | null;
}

export function TeamManager({
  members,
  folders,
  canManage,
  yourRole,
}: {
  members: MemberRow[];
  folders: { id: string; name: string }[];
  canManage: boolean;
  yourRole: Role;
}) {
  const formatDate = useDateFormat();
  const router = useRouter();
  const [inviting, setInviting] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<Role>('EDITOR');
  const [scopes, setScopes] = React.useState<string[]>([]);
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [inviteLink, setInviteLink] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [removing, setRemoving] = React.useState<MemberRow | null>(null);
  const [roleFilter, setRoleFilter] = React.useState<'all' | Role>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | MemberRow['status']>('all');

  const filtered = members.filter(
    (member) =>
      (roleFilter === 'all' || member.role === roleFilter) &&
      (statusFilter === 'all' || member.status === statusFilter),
  );

  async function invite() {
    setBusy(true);
    setInviteError(null);
    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          role,
          folderScopes: role === 'LIMITED' ? scopes : undefined,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        meta?: { inviteUrl?: string };
      };
      if (!response.ok || !payload.ok) {
        setInviteError(payload.error ?? 'Could not send the invitation');
        return;
      }
      toast.success('Invitation sent');
      setInviteLink(payload.meta?.inviteUrl ? `${window.location.origin}${payload.meta.inviteUrl}` : null);
      setEmail('');
      setScopes([]);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function patchMember(member: MemberRow, body: Record<string, unknown>, message: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not update that member');
        return;
      }
      toast.success(message);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(member: MemberRow) {
    const response = await fetch(`/api/team/${member.id}`, { method: 'DELETE' });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      toast.error(payload.error ?? 'Could not remove that member');
      return;
    }
    toast.success('Member removed');
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as 'all' | Role)}>
          <SelectTrigger className="w-[10.5rem]">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="OWNER">Owner</SelectItem>
            {ASSIGNABLE.map((item) => (
              <SelectItem key={item} value={item}>
                {ROLE_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | MemberRow['status'])}>
          <SelectTrigger className="w-[10.5rem]">
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending invitation</SelectItem>
            <SelectItem value="DISABLED">Disabled</SelectItem>
          </SelectContent>
        </Select>

        {canManage ? (
          <Button variant="brand" className="ml-auto" onClick={() => setInviting(true)}>
            <MailPlus /> Invite someone
          </Button>
        ) : null}
      </div>

      <Card flush>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="hidden md:table-cell">Last access</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-[11.5px] font-semibold">
                      {(member.name ?? member.email).slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-[13.5px] font-medium">
                        {member.name ?? member.email.split('@')[0]}
                        {member.isOwner ? <Crown className="size-3 text-warning" /> : null}
                        {member.isYou ? <Badge variant="outline">You</Badge> : null}
                      </p>
                      <p className="truncate text-[12px] text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {canManage && !member.isOwner ? (
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        void patchMember(member, { role: value }, `Role changed to ${ROLE_LABELS[value as Role]}`)
                      }
                    >
                      <SelectTrigger className="h-8 w-[8.5rem] text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNABLE.map((item) => (
                          <SelectItem key={item} value={item}>
                            {ROLE_LABELS[item]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={member.isOwner ? 'primary' : 'outline'}>{ROLE_LABELS[member.role]}</Badge>
                  )}
                  {member.role === 'LIMITED' ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {member.folderScopes.length} folder(s) assigned
                    </p>
                  ) : null}
                </TableCell>

                <TableCell>
                  {member.status === 'ACTIVE' ? (
                    <Badge variant="success">Active</Badge>
                  ) : member.status === 'PENDING' ? (
                    <Badge variant="warning">Invited</Badge>
                  ) : (
                    <Badge variant="destructive">Disabled</Badge>
                  )}
                </TableCell>

                <TableCell className="hidden whitespace-nowrap text-[12.5px] text-muted-foreground md:table-cell">
                  {formatDate(member.lastAccessAt)}
                </TableCell>

                <TableCell>
                  {canManage && !member.isOwner ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.email}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>{member.email}</DropdownMenuLabel>
                        {member.status === 'PENDING' ? (
                          <DropdownMenuItem
                            onSelect={() => void patchMember(member, { resendInvite: true }, 'Invitation resent')}
                          >
                            <RefreshCw /> Resend invitation
                          </DropdownMenuItem>
                        ) : null}
                        {member.status === 'ACTIVE' ? (
                          <DropdownMenuItem
                            onSelect={() => void patchMember(member, { status: 'DISABLED' }, 'Member disabled')}
                          >
                            <UserX /> Disable access
                          </DropdownMenuItem>
                        ) : member.status === 'DISABLED' ? (
                          <DropdownMenuItem
                            onSelect={() => void patchMember(member, { status: 'ACTIVE' }, 'Member re-enabled')}
                          >
                            <UserCheck /> Re-enable access
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem
                          onSelect={() =>
                            void patchMember(
                              member,
                              { canDeleteOwnAccount: !member.canDeleteOwnAccount },
                              member.canDeleteOwnAccount
                                ? 'They can no longer delete their own account'
                                : 'They may delete their own account',
                            )
                          }
                        >
                          {member.canDeleteOwnAccount ? 'Block self-deletion' : 'Allow self-deletion'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem destructive onSelect={() => setRemoving(member)}>
                          <Trash2 /> Remove from workspace
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-display text-[15px] font-semibold">What each role can do</h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(['OWNER', ...ASSIGNABLE] as Role[]).map((item) => (
            <div key={item} className="rounded-xl border border-border p-3">
              <dt className="text-[13px] font-semibold">{ROLE_LABELS[item]}</dt>
              <dd className="mt-0.5 text-[12.5px] leading-5 text-muted-foreground">{ROLE_DESCRIPTIONS[item]}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Dialog
        open={inviting}
        onOpenChange={(open) => {
          setInviting(open);
          if (!open) setInviteLink(null);
        }}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Invite someone to {''}this workspace</DialogTitle>
          </DialogHeader>

          {inviteLink ? (
            <div className="space-y-3">
              <Alert tone="success" title="Invitation sent">
                If the email does not arrive, share this link directly. It works once and only for the invited address.
              </Alert>
              <CopyField label="Invitation link" value={inviteLink} />
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Email address" required error={inviteError}>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="teammate@company.com"
                  autoFocus
                  invalid={Boolean(inviteError)}
                />
              </Field>

              <Field label="Role" help={ROLE_DESCRIPTIONS[role]}>
                <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE.filter((item) => yourRole === 'OWNER' || item !== 'ADMIN').map((item) => (
                      <SelectItem key={item} value={item}>
                        {ROLE_LABELS[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {role === 'LIMITED' ? (
                <Field label="Folders they can work in" help="A Limited member only sees the folders you choose.">
                  {folders.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border px-3 py-3 text-[12.5px] text-muted-foreground">
                      Create a folder first, then assign it here.
                    </p>
                  ) : (
                    <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-xl border border-border p-2.5">
                      {folders.map((folder) => (
                        <label key={folder.id} className="flex cursor-pointer items-center gap-2 text-[13px]">
                          <Checkbox
                            checked={scopes.includes(folder.id)}
                            onCheckedChange={(checked) =>
                              setScopes((current) =>
                                checked === true ? [...current, folder.id] : current.filter((id) => id !== folder.id),
                              )
                            }
                          />
                          {folder.name}
                        </label>
                      ))}
                    </div>
                  )}
                </Field>
              ) : null}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInviting(false);
                setInviteLink(null);
              }}
            >
              {inviteLink ? 'Done' : 'Cancel'}
            </Button>
            {!inviteLink ? (
              <Button variant="brand" loading={busy} onClick={() => void invite()}>
                Send invitation
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remove this member?"
        description={removing ? `${removing.email} will lose access to this workspace.` : ''}
        warning="QR codes they created stay with the workspace and keep working."
        confirmLabel="Remove member"
        destructive
        onConfirm={async () => {
          if (removing) await removeMember(removing);
        }}
      />
    </div>
  );
}
