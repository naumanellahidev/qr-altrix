'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart3, CalendarClock, Copy, Download, ExternalLink, Eye, FolderInput, Gauge, Heart,
  Lock, MoreHorizontal, Pause, PencilLine, Play, RotateCcw, Search, Trash2, X,
} from 'lucide-react';
import type { QrDesign } from '@/lib/qr/types';
import { getTypeDef } from '@/lib/qr/catalog';
import { compactNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/feedback';
import { ConfirmDialog } from '@/components/ui/confirm';
import { QrThumb } from '@/components/qr/qr-preview';
import { CopyButton } from '@/components/ui/copy-button';
import { downloadQrFile } from '@/components/qr/download-menu';
import { TypeIcon } from '@/components/ui/icon';
import { toast } from 'sonner';
import { useDateFormat, DATE, DATE_TIME, TIME } from '@/lib/hooks/use-date-format';
import { useLiveScans } from '@/lib/hooks/use-live-scans';
import { LiveIndicator } from '@/components/dashboard/live-indicator';

export interface CodeRow {
  id: string;
  name: string;
  kind: 'STATIC' | 'DYNAMIC';
  type: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ADMIN_DISABLED';
  shortLink: string | null;
  payload: string;
  design: Partial<QrDesign>;
  folderId: string | null;
  folderName: string | null;
  isFavorite: boolean;
  passwordProtected: boolean;
  scheduleEnabled: boolean;
  scanLimitEnabled: boolean;
  scanCount: number;
  uniqueScanCount: number;
  createdAt: string;
  updatedAt: string;
  adminDisabledReason: string | null;
}

export interface CodesTableProps {
  rows: CodeRow[];
  folders: { id: string; name: string; codeCount: number }[];
  total: number;
  page: number;
  perPage: number;
  canEdit: boolean;
  canDelete: boolean;
  canResetScans: boolean;
}

const SHORT_DATE: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };

const FILTERS = [
  { value: 'all', label: 'All codes' },
  { value: 'dynamic', label: 'Dynamic' },
  { value: 'static', label: 'Static' },
  { value: 'favorites', label: 'Favourites' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'paused', label: 'Paused' },
  { value: 'protected', label: 'Password protected' },
  { value: 'deleted', label: 'Deleted' },
];

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'scans', label: 'Most scanned' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'edited', label: 'Recently edited' },
];

function StatusBadge({ row }: { row: CodeRow }) {
  if (row.status === 'ADMIN_DISABLED') {
    return <Badge variant="destructive">Disabled by admin</Badge>;
  }
  if (row.status === 'DELETED') return <Badge variant="outline">Deleted</Badge>;
  if (row.status === 'PAUSED') return <Badge variant="warning">Paused</Badge>;
  return <Badge variant="success">Active</Badge>;
}


export function CodesTable({
  rows,
  folders,
  total,
  page,
  perPage,
  canEdit,
  canDelete,
  canResetScans,
}: CodesTableProps) {
  const formatDate = useDateFormat();
  const router = useRouter();
  // Scan counts in the list follow new scans without a reload.
  const liveState = useLiveScans({ onChange: () => router.refresh() });
  const params = useSearchParams();

  const [search, setSearch] = React.useState(params.get('search') ?? '');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [busy, setBusy] = React.useState(false);

  const [renaming, setRenaming] = React.useState<CodeRow | null>(null);
  const [renameValue, setRenameValue] = React.useState('');
  const [moving, setMoving] = React.useState<CodeRow | null>(null);
  const [moveTarget, setMoveTarget] = React.useState('none');
  const [confirm, setConfirm] = React.useState<
    | { kind: 'delete'; row: CodeRow }
    | { kind: 'reset'; row: CodeRow }
    | { kind: 'bulk'; action: 'delete' | 'resetScans' }
    | null
  >(null);

  const currentFilter = params.get('filter') ?? 'all';
  const currentSort = params.get('sort') ?? 'newest';
  const currentFolder = params.get('folder') ?? '';

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    if (!('page' in patch)) next.delete('page');
    router.push(`/dashboard/codes${next.toString() ? `?${next.toString()}` : ''}`);
  }

  // Debounce search so typing does not fire a request per keystroke.
  React.useEffect(() => {
    const current = params.get('search') ?? '';
    if (search === current) return;
    const timer = window.setTimeout(() => updateParams({ search: search || null }), 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.id)));
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function patchCode(id: string, body: Record<string, unknown>, successMessage?: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/qr/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not update the code');
        return false;
      }
      if (successMessage) toast.success(successMessage);
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function runBulk(action: string, folderId?: string | null) {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      const response = await fetch('/api/v1/qr/bulk-action', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), action, folderId }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; affected?: number; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not apply that action');
        return;
      }
      toast.success(`${payload.affected ?? 0} code${payload.affected === 1 ? '' : 's'} updated`);
      setSelected(new Set());
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function duplicate(row: CodeRow) {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/qr/${row.id}/duplicate`, { method: 'POST' });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not duplicate');
        return;
      }
      toast.success('Duplicated');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function download(row: CodeRow) {
    try {
      await downloadQrFile({ data: row.payload, design: row.design, name: row.name, qrCodeId: row.id, format: 'png', size: 1024 });
      toast.success('PNG downloaded');
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function removeCode(row: CodeRow) {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/qr/${row.id}`, { method: 'DELETE' });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not delete');
        return;
      }
      toast.success('Code deleted. Its scan history is kept.');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function resetScans(row: CodeRow) {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/qr/${row.id}/reset-scans`, { method: 'POST' });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not reset the statistics');
        return;
      }
      toast.success('Statistics reset');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------- toolbar */}
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or short link…"
          prefix={<Search className="size-3.5" />}
          className="lg:max-w-xs"
          aria-label="Search QR codes"
        />

        <div className="flex flex-wrap items-center gap-2">
          <LiveIndicator live={liveState.live} className="order-last lg:order-first" />
          <Select value={currentFilter} onValueChange={(value) => updateParams({ filter: value === 'all' ? null : value })}>
            <SelectTrigger className="w-[11rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentSort} onValueChange={(value) => updateParams({ sort: value === 'newest' ? null : value })}>
            <SelectTrigger className="w-[11rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((sort) => (
                <SelectItem key={sort.value} value={sort.value}>
                  {sort.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {folders.length > 0 ? (
            <Select
              value={currentFolder || 'all'}
              onValueChange={(value) => updateParams({ folder: value === 'all' ? null : value })}
            >
              <SelectTrigger className="w-[11rem]">
                <SelectValue placeholder="All folders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All folders</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name} ({folder.codeCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {(currentFilter !== 'all' || currentSort !== 'newest' || currentFolder || search) ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                router.push('/dashboard/codes');
              }}
            >
              <X /> Clear
            </Button>
          ) : null}
        </div>

        <p className="text-[12.5px] text-muted-foreground lg:ml-auto">
          {total} code{total === 1 ? '' : 's'}
        </p>
      </div>

      {/* -------------------------------------------------------- bulk actions */}
      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-primary-soft/60 px-3 py-2.5">
          <span className="text-[13px] font-medium text-primary">{selected.size} selected</span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {canEdit ? (
              <>
                <Button size="xs" variant="outline" disabled={busy} onClick={() => void runBulk('pause')}>
                  <Pause /> Pause
                </Button>
                <Button size="xs" variant="outline" disabled={busy} onClick={() => void runBulk('resume')}>
                  <Play /> Resume
                </Button>
                <Button size="xs" variant="outline" disabled={busy} onClick={() => void runBulk('favorite')}>
                  <Heart /> Favourite
                </Button>
                <Select onValueChange={(value) => void runBulk('move', value === 'none' ? null : value)}>
                  <SelectTrigger className="h-8 w-[9.5rem] text-[12.5px]">
                    <SelectValue placeholder="Move to folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No folder</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : null}
            {canResetScans ? (
              <Button
                size="xs"
                variant="outline"
                disabled={busy}
                onClick={() => setConfirm({ kind: 'bulk', action: 'resetScans' })}
              >
                <RotateCcw /> Reset scans
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                size="xs"
                variant="destructive-outline"
                disabled={busy}
                onClick={() => setConfirm({ kind: 'bulk', action: 'delete' })}
              >
                <Trash2 /> Delete
              </Button>
            ) : null}
            <Button size="xs" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      {/* ---------------------------------------------------------------- table */}
      {rows.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title={search || currentFilter !== 'all' ? 'Nothing matches those filters' : 'No QR codes yet'}
          description={
            search || currentFilter !== 'all'
              ? 'Try a different search, or clear the filters to see everything.'
              : 'Create your first code — it takes about thirty seconds and never expires.'
          }
          action={
            search || currentFilter !== 'all' ? (
              <Button variant="outline" onClick={() => router.push('/dashboard/codes')}>
                Clear filters
              </Button>
            ) : (
              <Button asChild variant="brand">
                <Link href="/dashboard/new">Create a QR code</Link>
              </Button>
            )
          }
        />
      ) : (
        <Card flush>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected ? true : selected.size > 0 ? 'indeterminate' : false}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="hidden xl:table-cell">Edited</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Scans</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const def = getTypeDef(row.type);
                return (
                  <TableRow key={row.id} data-state={selected.has(row.id) ? 'selected' : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(row.id)}
                        onCheckedChange={() => toggle(row.id)}
                        aria-label={`Select ${row.name}`}
                      />
                    </TableCell>

                    <TableCell className="min-w-[14rem]">
                      <div className="flex items-center gap-3">
                        <QrThumb data={row.payload} design={row.design} size={40} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/dashboard/codes/${row.id}`}
                              className="truncate text-[13.5px] font-medium hover:text-primary"
                            >
                              {row.name}
                            </Link>
                            {row.isFavorite ? <Heart className="size-3 fill-destructive text-destructive" /> : null}
                            {row.passwordProtected ? <Lock className="size-3 text-muted-foreground" /> : null}
                            {row.scheduleEnabled ? <CalendarClock className="size-3 text-muted-foreground" /> : null}
                            {row.scanLimitEnabled ? <Gauge className="size-3 text-muted-foreground" /> : null}
                          </div>
                          {row.shortLink ? (
                            <div className="flex items-center gap-1">
                              <a
                                href={row.shortLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate text-[11.5px] text-muted-foreground hover:text-primary"
                              >
                                {row.shortLink.replace(/^https?:\/\//, '')}
                              </a>
                              <CopyButton value={row.shortLink} size="icon-sm" variant="ghost" successMessage="Short link copied" />
                            </div>
                          ) : (
                            <span className="text-[11.5px] text-muted-foreground">
                              {row.folderName ?? 'No folder'}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                        <TypeIcon name={def?.icon ?? 'QrCode'} className="size-3.5" />
                        {def?.label ?? row.type}
                      </span>
                      <Badge variant={row.kind === 'DYNAMIC' ? 'primary' : 'outline'} className="mt-1">
                        {row.kind === 'DYNAMIC' ? 'Dynamic' : 'Static'}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden whitespace-nowrap text-[12.5px] text-muted-foreground lg:table-cell">
                      {formatDate(row.createdAt, SHORT_DATE)}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-[12.5px] text-muted-foreground xl:table-cell">
                      {formatDate(row.updatedAt, SHORT_DATE)}
                    </TableCell>

                    <TableCell>
                      <StatusBadge row={row} />
                    </TableCell>

                    <TableCell className="text-right">
                      <span className="block text-[13px] font-semibold tabular-nums">{compactNumber(row.scanCount)}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {compactNumber(row.uniqueScanCount)} unique
                      </span>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.name}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>{row.name}</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/codes/${row.id}`}>
                              <Eye /> View details
                            </Link>
                          </DropdownMenuItem>
                          {row.kind === 'DYNAMIC' ? (
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/stats?qr=${row.id}`}>
                                <BarChart3 /> Analytics
                              </Link>
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onSelect={() => void download(row)}>
                            <Download /> Download PNG
                          </DropdownMenuItem>
                          {row.shortLink ? (
                            <DropdownMenuItem asChild>
                              <a href={`${row.shortLink}?preview=1`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink /> Open destination
                              </a>
                            </DropdownMenuItem>
                          ) : null}

                          {canEdit ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/codes/${row.id}/edit`}>
                                  <PencilLine /> Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setRenaming(row);
                                  setRenameValue(row.name);
                                }}
                              >
                                <PencilLine /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => void duplicate(row)}>
                                <Copy /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() =>
                                  void patchCode(
                                    row.id,
                                    { status: row.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED' },
                                    row.status === 'PAUSED' ? 'Code resumed' : 'Code paused',
                                  )
                                }
                                disabled={row.status === 'ADMIN_DISABLED'}
                              >
                                {row.status === 'PAUSED' ? <Play /> : <Pause />}
                                {row.status === 'PAUSED' ? 'Resume' : 'Pause'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() =>
                                  void patchCode(
                                    row.id,
                                    { isFavorite: !row.isFavorite },
                                    row.isFavorite ? 'Removed from favourites' : 'Added to favourites',
                                  )
                                }
                              >
                                <Heart /> {row.isFavorite ? 'Remove favourite' : 'Add to favourites'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setMoving(row);
                                  setMoveTarget(row.folderId ?? 'none');
                                }}
                              >
                                <FolderInput /> Move to folder
                              </DropdownMenuItem>
                            </>
                          ) : null}

                          {canResetScans || canDelete ? <DropdownMenuSeparator /> : null}
                          {canResetScans ? (
                            <DropdownMenuItem onSelect={() => setConfirm({ kind: 'reset', row })}>
                              <RotateCcw /> Reset statistics
                            </DropdownMenuItem>
                          ) : null}
                          {canDelete ? (
                            <DropdownMenuItem destructive onSelect={() => setConfirm({ kind: 'delete', row })}>
                              <Trash2 /> Delete
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ------------------------------------------------------------ paging */}
      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12.5px] text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {/* ---------------------------------------------------------- dialogs */}
      <Dialog open={Boolean(renaming)} onOpenChange={(open) => !open && setRenaming(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Rename QR code</DialogTitle>
          </DialogHeader>
          <Field label="Name" help="Only you see this name.">
            <Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} maxLength={120} autoFocus />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              loading={busy}
              onClick={async () => {
                if (!renaming) return;
                const ok = await patchCode(renaming.id, { name: renameValue.trim() }, 'Renamed');
                if (ok) setRenaming(null);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(moving)} onOpenChange={(open) => !open && setMoving(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Move to folder</DialogTitle>
          </DialogHeader>
          <Field label="Folder">
            <Select value={moveTarget} onValueChange={setMoveTarget}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoving(null)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              loading={busy}
              onClick={async () => {
                if (!moving) return;
                const ok = await patchCode(
                  moving.id,
                  { folderId: moveTarget === 'none' ? null : moveTarget },
                  'Moved',
                );
                if (ok) setMoving(null);
              }}
            >
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirm?.kind === 'delete'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Delete this QR code?"
        description={confirm?.kind === 'delete' ? `“${confirm.row.name}” will stop resolving for anyone who scans it.` : ''}
        warning="Scan history is kept and the short code is never reused, so support can restore it. Printed copies will show an inactive page until then."
        confirmLabel="Delete code"
        destructive
        onConfirm={async () => {
          if (confirm?.kind === 'delete') await removeCode(confirm.row);
        }}
      />

      <ConfirmDialog
        open={confirm?.kind === 'reset'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Reset statistics?"
        description={
          confirm?.kind === 'reset'
            ? `All ${compactNumber(confirm.row.scanCount)} recorded scans for “${confirm.row.name}” will be removed.`
            : ''
        }
        warning="This cannot be undone. The code itself keeps working exactly as before."
        confirmLabel="Reset statistics"
        destructive
        onConfirm={async () => {
          if (confirm?.kind === 'reset') await resetScans(confirm.row);
        }}
      />

      <ConfirmDialog
        open={confirm?.kind === 'bulk'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.kind === 'bulk' && confirm.action === 'delete' ? 'Delete selected codes?' : 'Reset selected statistics?'}
        description={`This affects ${selected.size} code${selected.size === 1 ? '' : 's'}.`}
        warning={
          confirm?.kind === 'bulk' && confirm.action === 'delete'
            ? 'Deleted codes stop resolving immediately. Their scan history is kept.'
            : 'Scan history for the selected codes will be removed. This cannot be undone.'
        }
        confirmLabel={confirm?.kind === 'bulk' && confirm.action === 'delete' ? 'Delete codes' : 'Reset statistics'}
        destructive
        requireText={confirm?.kind === 'bulk' && confirm.action === 'delete' && selected.size > 5 ? 'DELETE' : undefined}
        onConfirm={async () => {
          if (confirm?.kind === 'bulk') await runBulk(confirm.action);
        }}
      />
    </div>
  );
}
