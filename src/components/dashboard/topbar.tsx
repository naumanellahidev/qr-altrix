'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check, ChevronsUpDown, LogOut, Menu, Plus, Search, Settings, ShieldCheck, User,
} from 'lucide-react';
import type { Role } from '@prisma/client';
import { ROLE_LABELS } from '@/lib/rbac';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface TopbarProps {
  user: { name: string | null; email: string; isPlatformAdmin: boolean; emailVerified: boolean };
  workspace: { id: string; name: string; role: Role };
  workspaces: { id: string; name: string; role: Role }[];
  onOpenSidebar: () => void;
}

export function Topbar({ user, workspace, workspaces, onOpenSidebar }: TopbarProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [switching, setSwitching] = React.useState(false);

  async function switchWorkspace(workspaceId: string) {
    if (workspaceId === workspace.id) return;
    setSwitching(true);
    try {
      const response = await fetch('/api/workspace/switch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workspaceId }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        toast.error(payload.error ?? 'Could not switch workspace');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } finally {
      setSwitching(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/dashboard/codes?search=${encodeURIComponent(query)}` : '/dashboard/codes');
  }

  const initials = (user.name ?? user.email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-14 items-center gap-2 px-3 py-2.5 sm:px-5">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Open menu">
          <Menu />
        </Button>

        {/* Workspace switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 max-w-[13rem] items-center gap-2 rounded-xl border border-border bg-surface px-2.5 py-1.5 text-left transition-colors hover:bg-surface-muted"
              disabled={switching}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-[11px] font-bold text-white">
                {workspace.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium leading-4">{workspace.name}</span>
                <span className="block text-[10.5px] leading-3 text-muted-foreground">{ROLE_LABELS[workspace.role]}</span>
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            {workspaces.map((item) => (
              <DropdownMenuItem key={item.id} onSelect={() => void switchWorkspace(item.id)}>
                <span className="flex size-5 items-center justify-center rounded-md bg-surface-muted text-[10px] font-bold">
                  {item.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                {item.id === workspace.id ? <Check className="size-3.5 text-primary" /> : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/team">
                <User /> Invite a teammate
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <form onSubmit={submitSearch} className="ml-1 hidden min-w-0 flex-1 md:block">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your QR codes…"
            prefix={<Search className="size-3.5" />}
            className="h-9 max-w-sm"
            aria-label="Search QR codes"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <Button asChild size="sm" variant="brand" className="hidden sm:inline-flex">
            <Link href="/dashboard/new">
              <Plus /> New QR code
            </Link>
          </Button>
          <Button asChild size="icon" variant="brand" className="sm:hidden" aria-label="New QR code">
            <Link href="/dashboard/new">
              <Plus />
            </Link>
          </Button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface text-[11.5px] font-semibold transition-colors hover:bg-surface-muted"
                aria-label="Account menu"
              >
                {initials || <User className="size-4" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <div className="px-2.5 py-2">
                <p className="truncate text-[13px] font-medium">{user.name ?? user.email.split('@')[0]}</p>
                <p className="truncate text-[11.5px] text-muted-foreground">{user.email}</p>
                {!user.emailVerified ? (
                  <Badge variant="warning" className="mt-1.5">
                    Email not confirmed
                  </Badge>
                ) : null}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/security">
                  <ShieldCheck /> Security history
                </Link>
              </DropdownMenuItem>
              {user.isPlatformAdmin ? (
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <ShieldCheck /> Admin panel
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => void logout()}>
                <LogOut /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
