'use client';

import * as React from 'react';
import type { Role } from '@prisma/client';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import { Alert } from '@/components/ui/feedback';

export interface DashboardShellProps {
  user: { name: string | null; email: string; isPlatformAdmin: boolean; emailVerified: boolean };
  workspace: { id: string; name: string; role: Role };
  workspaces: { id: string; name: string; role: Role }[];
  codeCount: number;
  expiryEnabled?: boolean;
  maintenanceNote?: string | null;
  children: React.ReactNode;
}

/** Client wrapper that owns the mobile drawer state for the dashboard chrome. */
export function DashboardShell({
  user,
  workspace,
  workspaces,
  codeCount,
  expiryEnabled,
  maintenanceNote,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar
        role={workspace.role}
        isPlatformAdmin={user.isPlatformAdmin}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        codeCount={codeCount}
        expiryEnabled={expiryEnabled}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          workspace={workspace}
          workspaces={workspaces}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {maintenanceNote ? (
            <Alert tone="warning" title="Notice from your administrator" className="mb-5">
              {maintenanceNote}
            </Alert>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
