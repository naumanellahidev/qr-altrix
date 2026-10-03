import 'server-only';
import { redirect } from 'next/navigation';
import type { Role, User, Workspace, WorkspaceMember } from '@prisma/client';
import { prisma } from '../db';
import { hashPassword, hashToken, verifyPassword } from '../hash';
import { randomToken, slugify } from '../utils';
import { can, type Permission } from '../rbac';
import { getSettings } from '../settings';
import { logSecurity } from '../audit';
import { readSessionCookie, setSessionCookie } from './session';

export interface AuthContext {
  user: User;
  workspace: Workspace;
  membership: WorkspaceMember;
  role: Role;
  memberships: (WorkspaceMember & { workspace: Workspace })[];
}

/**
 * How often `lastAccessAt` is written. It is the clock the idle timeout reads, so the
 * interval is kept well under the timeout itself rather than fixed at five minutes.
 */
function touchIntervalMs(idleTimeoutMinutes: number): number {
  if (idleTimeoutMinutes <= 0) return 5 * 60_000;
  return Math.max(30_000, Math.min(5 * 60_000, (idleTimeoutMinutes * 60_000) / 3));
}

/** Resolves the signed-in user and their active workspace, or null when signed out. */
export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await readSessionCookie();
  if (!session || session.pending2fa) return null;

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user || user.isDisabled || user.sessionVersion !== session.v) return null;

  // Optional idle timeout, controlled by the operator. 0 (the default) means never.
  const settings = await getSettings().catch(() => null);
  const idleTimeout = settings?.sessionIdleTimeoutMinutes ?? 0;
  const lastAccess = user.lastAccessAt?.getTime() ?? null;

  if (idleTimeout > 0 && lastAccess !== null && Date.now() - lastAccess > idleTimeout * 60_000) {
    return null;
  }

  if (lastAccess === null || Date.now() - lastAccess > touchIntervalMs(idleTimeout)) {
    // Fire and forget: a failed heartbeat must never break the request.
    void prisma.user
      .update({ where: { id: user.id }, data: { lastAccessAt: new Date() } })
      .catch(() => undefined);
  }

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: user.id, status: 'ACTIVE' },
    include: { workspace: true },
    orderBy: { invitedAt: 'asc' },
  });

  const activeMembership =
    memberships.find((m) => m.workspaceId === session.ws) ?? memberships[0] ?? null;

  if (!activeMembership || activeMembership.workspace.isDisabled) return null;

  return {
    user,
    workspace: activeMembership.workspace,
    membership: activeMembership,
    role: activeMembership.role,
    memberships,
  };
}

export async function requireAuth(returnTo?: string): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) {
    redirect(returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : '/login');
  }
  return context;
}

export async function requirePermission(permission: Permission, returnTo?: string): Promise<AuthContext> {
  const context = await requireAuth(returnTo);
  if (!can(context.role, permission)) {
    redirect('/dashboard?denied=1');
  }
  return context;
}

/** Throttles the "admin panel opened" audit entry to one per admin per hour. */
const adminAccessSeen = new Map<string, number>();

export async function requirePlatformAdmin(): Promise<AuthContext> {
  const context = await requireAuth('/admin');
  if (!context.user.isPlatformAdmin) {
    redirect('/dashboard');
  }

  const settings = await getSettings().catch(() => null);

  // When the operator requires two-factor for admins, an admin without it is sent to
  // enrol rather than being let in. The first admin can always enrol, because the
  // setting defaults to off.
  if (settings?.requireTwoFactorForAdmins && !context.user.twoFactorEnabled) {
    redirect('/dashboard/settings?tab=security&enroll2fa=1');
  }

  const lastSeen = adminAccessSeen.get(context.user.id) ?? 0;
  if (Date.now() - lastSeen > 60 * 60_000) {
    adminAccessSeen.set(context.user.id, Date.now());
    void logSecurity({
      type: 'ADMIN_PANEL_ACCESS',
      userId: context.user.id,
      workspaceId: context.workspace.id,
      email: context.user.email,
      meta: { twoFactor: context.user.twoFactorEnabled },
    });
  }

  return context;
}

export interface CreateAccountInput {
  email: string;
  password?: string;
  name?: string | null;
  surname?: string | null;
  googleId?: string | null;
  emailVerified?: boolean;
  workspaceName?: string | null;
}

export interface CreateAccountResult {
  user: User;
  workspace: Workspace;
  verificationToken?: string;
}

async function uniqueWorkspaceSlug(base: string): Promise<string> {
  const root = slugify(base) || 'workspace';
  let candidate = root;
  let attempt = 0;
  // Slugs are globally unique because they can appear in share links.
  while (await prisma.workspace.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    attempt += 1;
    candidate = `${root}-${attempt + 1}`;
    if (attempt > 40) {
      candidate = `${root}-${randomToken(3)}`;
      break;
    }
  }
  return candidate;
}

/** Creates the user, their personal workspace and the owner membership in one go. */
export async function createAccount(input: CreateAccountInput): Promise<CreateAccountResult> {
  const email = input.email.trim().toLowerCase();
  const passwordHash = input.password ? await hashPassword(input.password) : null;
  const displayName = input.name?.trim() || email.split('@')[0];
  const workspaceName = input.workspaceName?.trim() || `${displayName}'s workspace`;
  const slug = await uniqueWorkspaceSlug(workspaceName);

  const isFirstUser = (await prisma.user.count()) === 0;

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name?.trim() || null,
      surname: input.surname?.trim() || null,
      googleId: input.googleId ?? null,
      emailVerifiedAt: input.emailVerified ? new Date() : null,
      isPlatformAdmin: isFirstUser,
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: workspaceName,
      slug,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          email,
          role: 'OWNER',
          status: 'ACTIVE',
          acceptedAt: new Date(),
        },
      },
    },
  });

  let verificationToken: string | undefined;
  if (!input.emailVerified) {
    verificationToken = randomToken(32);
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(verificationToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
      },
    });
  }

  return { user, workspace, verificationToken };
}

export type AuthFailure =
  | 'invalid_credentials'
  | 'account_disabled'
  | 'password_not_set'
  | 'two_factor_required';

export interface AuthSuccess {
  ok: true;
  user: User;
  workspaceId: string | null;
  requiresTwoFactor: boolean;
}

export interface AuthFailureResult {
  ok: false;
  reason: AuthFailure;
  user?: User;
}

export async function authenticate(email: string, password: string): Promise<AuthSuccess | AuthFailureResult> {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) {
    // Constant-ish timing: still run a hash comparison so probing is not cheaper.
    await verifyPassword(password, '$2a$12$0000000000000000000000000000000000000000000000000000');
    return { ok: false, reason: 'invalid_credentials' };
  }
  if (!user.passwordHash) return { ok: false, reason: 'password_not_set', user };
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { ok: false, reason: 'invalid_credentials', user };
  if (user.isDisabled) return { ok: false, reason: 'account_disabled', user };

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
    orderBy: { invitedAt: 'asc' },
  });

  return {
    ok: true,
    user,
    workspaceId: membership?.workspaceId ?? null,
    requiresTwoFactor: user.twoFactorEnabled,
  };
}

/** Signs the user in and records the access timestamp. */
export async function startSession(userId: string, workspaceId?: string | null, pending2fa = false): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await setSessionCookie({
    sub: user.id,
    v: user.sessionVersion,
    ws: workspaceId ?? undefined,
    pending2fa,
  });
  if (!pending2fa) {
    await prisma.user.update({ where: { id: user.id }, data: { lastAccessAt: new Date() } });
    if (workspaceId) {
      await prisma.workspaceMember
        .updateMany({
          where: { userId: user.id, workspaceId },
          data: { lastAccessAt: new Date() },
        })
        .catch(() => undefined);
    }
  }
}

/** Ensures a user always has at least one workspace (e.g. after leaving a team). */
export async function ensureWorkspace(userId: string): Promise<Workspace> {
  const existing = await prisma.workspaceMember.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { workspace: true },
  });
  if (existing) return existing.workspace;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const slug = await uniqueWorkspaceSlug(user.name || user.email.split('@')[0]);
  return prisma.workspace.create({
    data: {
      name: `${user.name || user.email.split('@')[0]}'s workspace`,
      slug,
      ownerId: user.id,
      members: {
        create: { userId: user.id, email: user.email, role: 'OWNER', status: 'ACTIVE', acceptedAt: new Date() },
      },
    },
  });
}

export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = randomToken(32);
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
    },
  });
  return token;
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = randomToken(32);
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2),
    },
  });
  return token;
}

export { readSessionCookie, setSessionCookie } from './session';
