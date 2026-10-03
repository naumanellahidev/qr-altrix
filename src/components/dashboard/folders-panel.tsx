'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Folder, FolderOpen, FolderPlus, MoreHorizontal, PencilLine, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm';
import { toast } from 'sonner';

export interface FolderRow {
  id: string;
  name: string;
  codeCount: number;
}

export interface FoldersPanelProps {
  folders: FolderRow[];
  unfiled: number;
  total: number;
  canManage: boolean;
}

/** Folder rail beside the codes table: search, create, rename, delete. */
export function FoldersPanel({ folders, unfiled, total, canManage }: FoldersPanelProps) {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get('folder') ?? '';

  const [query, setQuery] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [renaming, setRenaming] = React.useState<FolderRow | null>(null);
  const [renameValue, setRenameValue] = React.useState('');
  const [deleting, setDeleting] = React.useState<FolderRow | null>(null);
  const [busy, setBusy] = React.useState(false);

  const filtered = folders.filter((folder) => folder.name.toLowerCase().includes(query.trim().toLowerCase()));

  function select(folderId: string | null) {
    const next = new URLSearchParams(params.toString());
    if (folderId) next.set('folder', folderId);
    else next.delete('folder');
    next.delete('page');
    router.push(`/dashboard/codes${next.toString() ? `?${next.toString()}` : ''}`);
  }

  async function createFolder() {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const response = await fetch('/api/v1/folders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not create the folder');
        return;
      }
      toast.success('Folder created');
      setCreating(false);
      setNewName('');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function renameFolder() {
    if (!renaming || !renameValue.trim()) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/folders/${renaming.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not rename the folder');
        return;
      }
      toast.success('Folder renamed');
      setRenaming(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deleteFolder(folder: FolderRow) {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/folders/${folder.id}`, { method: 'DELETE' });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        codesMoved?: number;
      };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not delete the folder');
        return;
      }
      toast.success(
        payload.codesMoved
          ? `Folder deleted. ${payload.codesMoved} code${payload.codesMoved === 1 ? '' : 's'} moved to “No folder”.`
          : 'Folder deleted',
      );
      if (active === folder.id) select(null);
      else router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a folder"
          prefix={<Search className="size-3.5" />}
          className="h-9"
          aria-label="Search folders"
        />
        {canManage ? (
          <Button size="icon" variant="outline" onClick={() => setCreating(true)} aria-label="New folder">
            <FolderPlus />
          </Button>
        ) : null}
      </div>

      <ul className="space-y-0.5">
        <li>
          <button
            type="button"
            onClick={() => select(null)}
            className={cn(
              'flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors',
              active === ''
                ? 'bg-primary-soft font-medium text-primary'
                : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
            )}
          >
            <FolderOpen className="size-4" />
            <span className="flex-1 truncate">All codes</span>
            <span className="text-[11.5px] tabular-nums">{total}</span>
          </button>
        </li>

        {filtered.map((folder) => (
          <li key={folder.id} className="group flex items-center gap-1">
            <button
              type="button"
              onClick={() => select(folder.id)}
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors',
                active === folder.id
                  ? 'bg-primary-soft font-medium text-primary'
                  : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
              )}
            >
              <Folder className="size-4 shrink-0" />
              <span className="flex-1 truncate">{folder.name}</span>
              <span className="text-[11.5px] tabular-nums">{folder.codeCount}</span>
            </button>

            {canManage ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label={`Actions for ${folder.name}`}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => {
                      setRenaming(folder);
                      setRenameValue(folder.name);
                    }}
                  >
                    <PencilLine /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem destructive onSelect={() => setDeleting(folder)}>
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </li>
        ))}

        {unfiled > 0 ? (
          <li className="px-2.5 pt-1 text-[11.5px] text-muted-foreground">{unfiled} code(s) not in a folder</li>
        ) : null}
      </ul>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
          </DialogHeader>
          <Field label="Folder name" help="For example: Spring campaign, Branch menus, Client A.">
            <Input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              maxLength={60}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === 'Enter') void createFolder();
              }}
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button variant="brand" loading={busy} onClick={() => void createFolder()}>
              Create folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(renaming)} onOpenChange={(open) => !open && setRenaming(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
          </DialogHeader>
          <Field label="Folder name">
            <Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} maxLength={60} autoFocus />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button variant="brand" loading={busy} onClick={() => void renameFolder()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this folder?"
        description={deleting ? `“${deleting.name}” holds ${deleting.codeCount} code(s).` : ''}
        warning="The folder is removed, but every QR code inside it keeps working and moves to “No folder”."
        confirmLabel="Delete folder"
        destructive
        onConfirm={async () => {
          if (deleting) await deleteFolder(deleting);
        }}
      />
    </div>
  );
}
