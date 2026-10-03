import type { Role } from '@prisma/client';

/**
 * Role model. Permissions are intentionally coarse and readable — a team owner should
 * be able to guess what a role can do from its name.
 */

export const ROLE_ORDER: Role[] = ['OWNER', 'ADMIN', 'EDITOR', 'ANALYST', 'VIEWER', 'LIMITED'];

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  ANALYST: 'Analyst',
  VIEWER: 'Viewer',
  LIMITED: 'Limited',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  OWNER: 'Full control, including billing-free settings, domains, team and deleting the workspace.',
  ADMIN: 'Everything except deleting the workspace or changing the owner.',
  EDITOR: 'Create and edit QR codes, templates and folders. No team or domain changes.',
  ANALYST: 'Read everything and export analytics. Cannot change QR codes.',
  VIEWER: 'Read-only access to QR codes and basic stats.',
  LIMITED: 'Can only see and edit QR codes inside the folders they are assigned to.',
};

export type Permission =
  | 'qr.read'
  | 'qr.create'
  | 'qr.update'
  | 'qr.delete'
  | 'qr.pause'
  | 'qr.resetScans'
  | 'folder.manage'
  | 'template.manage'
  | 'bulk.run'
  | 'stats.read'
  | 'stats.export'
  | 'stats.reset'
  | 'domain.manage'
  | 'team.manage'
  | 'apikey.manage'
  | 'webhook.manage'
  | 'settings.manage'
  | 'security.read'
  | 'workspace.delete';

const MATRIX: Record<Role, Permission[]> = {
  OWNER: [
    'qr.read', 'qr.create', 'qr.update', 'qr.delete', 'qr.pause', 'qr.resetScans',
    'folder.manage', 'template.manage', 'bulk.run',
    'stats.read', 'stats.export', 'stats.reset',
    'domain.manage', 'team.manage', 'apikey.manage', 'webhook.manage',
    'settings.manage', 'security.read', 'workspace.delete',
  ],
  ADMIN: [
    'qr.read', 'qr.create', 'qr.update', 'qr.delete', 'qr.pause', 'qr.resetScans',
    'folder.manage', 'template.manage', 'bulk.run',
    'stats.read', 'stats.export', 'stats.reset',
    'domain.manage', 'team.manage', 'apikey.manage', 'webhook.manage',
    'settings.manage', 'security.read',
  ],
  EDITOR: [
    'qr.read', 'qr.create', 'qr.update', 'qr.delete', 'qr.pause',
    'folder.manage', 'template.manage', 'bulk.run',
    'stats.read', 'stats.export',
  ],
  ANALYST: ['qr.read', 'stats.read', 'stats.export'],
  VIEWER: ['qr.read', 'stats.read'],
  LIMITED: ['qr.read', 'qr.update', 'stats.read'],
};

export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return MATRIX[role].includes(permission);
}

export function permissionsFor(role: Role): Permission[] {
  return [...MATRIX[role]];
}

/** LIMITED members only see the folders they are scoped to. */
export function isFolderScoped(role: Role): boolean {
  return role === 'LIMITED';
}

export function canAssignRole(actor: Role, target: Role): boolean {
  if (actor === 'OWNER') return true;
  if (actor === 'ADMIN') return target !== 'OWNER';
  return false;
}

export function roleRank(role: Role): number {
  return ROLE_ORDER.indexOf(role);
}
