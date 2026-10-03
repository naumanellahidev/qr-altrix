import 'server-only';
import type { Role } from '@prisma/client';
import { prisma } from '../db';
import { hashToken } from '../hash';
import { getAuthContext } from '../auth';
import { can, type Permission } from '../rbac';
import { rateLimit, rateLimitHeaders, type RateLimitResult } from '../rate-limit';
import { getSettings } from '../settings';
import { clientIp } from '../request';

/**
 * API routes accept two kinds of caller: a signed-in dashboard session, or an API key.
 * Both resolve to the same actor shape so handlers never branch on authentication.
 */

export type ActorKind = 'session' | 'apiKey';

export interface Actor {
  kind: ActorKind;
  userId: string | null;
  workspaceId: string;
  role: Role;
  scopes: string[];
  isPlatformAdmin: boolean;
  apiKeyId?: string;
  rateLimit?: RateLimitResult;
}

export type ActorResult =
  | { ok: true; actor: Actor }
  | { ok: false; status: number; error: string; headers?: Record<string, string> };

const SCOPE_PERMISSIONS: Record<string, Permission[]> = {
  'qr:read': ['qr.read', 'stats.read'],
  'qr:write': ['qr.read', 'qr.create', 'qr.update', 'qr.delete', 'qr.pause'],
  'stats:read': ['stats.read', 'stats.export'],
  'folders:write': ['folder.manage'],
  'bulk:write': ['bulk.run', 'qr.create'],
  'webhooks:write': ['webhook.manage'],
};

export function apiKeyGrants(scopes: string[]): Set<Permission> {
  const grants = new Set<Permission>();
  for (const scope of scopes) {
    for (const permission of SCOPE_PERMISSIONS[scope] ?? []) grants.add(permission);
  }
  return grants;
}

/** Keys look like `qra_<prefix>_<secret>` so the prefix can be indexed and shown in the UI. */
export function parseApiKey(raw: string): { prefix: string; secret: string } | null {
  const match = /^qra_([A-Za-z0-9]{8})_([A-Za-z0-9]{24,})$/.exec(raw.trim());
  if (!match) return null;
  return { prefix: match[1], secret: match[2] };
}

export async function resolveActor(request: Request): Promise<ActorResult> {
  const header = request.headers.get('authorization') ?? request.headers.get('x-api-key') ?? '';
  const bearer = header.replace(/^Bearer\s+/i, '').trim();

  if (bearer) {
    const parsed = parseApiKey(bearer);
    if (!parsed) return { ok: false, status: 401, error: 'That API key is not valid' };

    const key = await prisma.apiKey.findUnique({
      where: { prefix: parsed.prefix },
      include: { workspace: { select: { id: true, isDisabled: true, ownerId: true } } },
    });
    if (!key || key.revokedAt || key.keyHash !== hashToken(bearer)) {
      return { ok: false, status: 401, error: 'That API key is not valid' };
    }
    if (key.workspace.isDisabled) {
      return { ok: false, status: 403, error: 'This workspace is disabled' };
    }

    const limit = await rateLimit(`apikey:${key.id}`, key.rateLimit, 60);
    if (!limit.allowed) {
      return {
        ok: false,
        status: 429,
        error: `Rate limit reached (${key.rateLimit}/min). Try again shortly.`,
        headers: rateLimitHeaders(limit),
      };
    }

    // lastUsedAt is useful for spotting stale keys; a failed write must not block the call.
    void prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => undefined);

    return {
      ok: true,
      actor: {
        kind: 'apiKey',
        userId: key.userId,
        workspaceId: key.workspaceId,
        role: 'ADMIN',
        scopes: key.scopes,
        isPlatformAdmin: false,
        apiKeyId: key.id,
        rateLimit: limit,
      },
    };
  }

  const context = await getAuthContext();
  if (!context) return { ok: false, status: 401, error: 'Sign in to continue' };

  const settings = await getSettings();
  const limit = await rateLimit(`session:${context.user.id}`, settings.rateLimitApiPerMin * 4, 60);
  if (!limit.allowed) {
    return { ok: false, status: 429, error: 'Too many requests — slow down a little', headers: rateLimitHeaders(limit) };
  }

  return {
    ok: true,
    actor: {
      kind: 'session',
      userId: context.user.id,
      workspaceId: context.workspace.id,
      role: context.role,
      scopes: ['*'],
      isPlatformAdmin: context.user.isPlatformAdmin,
      rateLimit: limit,
    },
  };
}

/** True when the actor may perform the permission, honouring API key scopes. */
export function actorCan(actor: Actor, permission: Permission): boolean {
  if (actor.kind === 'apiKey') {
    return apiKeyGrants(actor.scopes).has(permission);
  }
  return can(actor.role, permission);
}

export function ipKey(request: Request, bucket: string): string {
  const ip = clientIp(request.headers) ?? 'unknown';
  return `${bucket}:${ip}`;
}
