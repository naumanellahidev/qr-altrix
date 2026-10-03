import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { PageHeader } from '@/components/ui/page-header';
import { TeamManager, type MemberRow } from '@/components/dashboard/team-manager';

export const metadata: Metadata = { title: 'Users & team' };
export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const auth = await requireAuth('/dashboard/team');

  const [members, folders] = await Promise.all([
    prisma.workspaceMember.findMany({
      where: { workspaceId: auth.workspace.id },
      orderBy: [{ role: 'asc' }, { invitedAt: 'asc' }],
      include: { user: { select: { id: true, name: true, surname: true, lastAccessAt: true } } },
    }),
    prisma.folder.findMany({ where: { workspaceId: auth.workspace.id }, orderBy: { name: 'asc' } }),
  ]);

  const rows: MemberRow[] = members.map((member) => ({
    id: member.id,
    email: member.email,
    role: member.role,
    status: member.status,
    invitedAt: member.invitedAt.toISOString(),
    acceptedAt: member.acceptedAt?.toISOString() ?? null,
    lastAccessAt: (member.lastAccessAt ?? member.user?.lastAccessAt)?.toISOString() ?? null,
    canDeleteOwnAccount: member.canDeleteOwnAccount,
    folderScopes: Array.isArray(member.folderScopes) ? (member.folderScopes as string[]) : [],
    isOwner: member.role === 'OWNER',
    isYou: member.userId === auth.user.id,
    name: member.user ? [member.user.name, member.user.surname].filter(Boolean).join(' ') || null : null,
  }));

  return (
    <>
      <PageHeader
        title="Users & team"
        description="Invite people, set what they can touch, and see when they last signed in."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Users & team' }]}
      />

      <TeamManager
        members={rows}
        folders={folders.map((folder) => ({ id: folder.id, name: folder.name }))}
        canManage={can(auth.role, 'team.manage')}
        yourRole={auth.role}
      />
    </>
  );
}
