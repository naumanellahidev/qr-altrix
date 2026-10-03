import type { Permission } from '@/lib/rbac';

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  /** Hidden unless the member's role grants this permission. */
  permission?: Permission;
  description?: string;
  exact?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/** Sidebar structure. Order matches the task flow: create → manage → measure → set up. */
export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { href: '/dashboard', label: 'Overview', icon: 'LayoutDashboard', exact: true },
      { href: '/dashboard/new', label: 'New QR code', icon: 'Plus', permission: 'qr.create' },
      { href: '/dashboard/bulk', label: 'Bulk generation', icon: 'Layers', permission: 'bulk.run' },
    ],
  },
  {
    title: 'Manage',
    items: [
      { href: '/dashboard/codes', label: 'My QR codes', icon: 'QrCode' },
      { href: '/dashboard/templates', label: 'Templates', icon: 'Palette', permission: 'template.manage' },
      { href: '/dashboard/domains', label: 'My domains', icon: 'Globe', permission: 'domain.manage' },
    ],
  },
  {
    title: 'Measure',
    items: [{ href: '/dashboard/stats', label: 'Analytics', icon: 'BarChart3', permission: 'stats.read' }],
  },
  {
    title: 'Workspace',
    items: [
      { href: '/dashboard/team', label: 'Users & team', icon: 'Users' },
      { href: '/dashboard/security', label: 'Security history', icon: 'ShieldCheck' },
      { href: '/dashboard/developers', label: 'Developers & API', icon: 'Code2', permission: 'apikey.manage' },
      { href: '/dashboard/settings', label: 'Settings', icon: 'Settings' },
      { href: '/dashboard/support', label: 'Contact & support', icon: 'LifeBuoy' },
    ],
  },
];

export const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: 'Gauge', exact: true },
  { href: '/admin/users', label: 'Users', icon: 'Users' },
  { href: '/admin/workspaces', label: 'Workspaces', icon: 'Building2' },
  { href: '/admin/codes', label: 'All QR codes', icon: 'QrCode' },
  { href: '/admin/abuse', label: 'Abuse reports', icon: 'Flag' },
  { href: '/admin/system', label: 'System & queue', icon: 'Server' },
  { href: '/admin/settings', label: 'Platform settings', icon: 'SlidersHorizontal' },
];
