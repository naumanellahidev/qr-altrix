import 'server-only';
import type { SecurityEventType } from '@prisma/client';
import { prisma } from './db';
import { hashIp } from './hash';
import { clientIp } from './request';
import { logger } from './logger';

/**
 * Every security-relevant action is written to two places: SecurityEvent (shown to the
 * user in Security history) and ActivityLog (workspace audit trail).
 */

export interface SecurityLogInput {
  type: SecurityEventType;
  userId?: string | null;
  workspaceId?: string | null;
  email?: string | null;
  headers?: Headers | null;
  meta?: Record<string, unknown>;
}

export async function logSecurity(input: SecurityLogInput): Promise<void> {
  try {
    const ip = input.headers ? clientIp(input.headers) : null;
    await prisma.securityEvent.create({
      data: {
        type: input.type,
        userId: input.userId ?? null,
        workspaceId: input.workspaceId ?? null,
        email: input.email ?? null,
        ipHash: hashIp(ip),
        userAgent: input.headers?.get('user-agent')?.slice(0, 400) ?? null,
        meta: (input.meta ?? {}) as object,
      },
    });
  } catch (error) {
    logger.error('security log failed', { error: (error as Error).message, type: input.type });
  }
}

export interface ActivityLogInput {
  workspaceId?: string | null;
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  meta?: Record<string, unknown>;
}

export async function logActivity(input: ActivityLogInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        workspaceId: input.workspaceId ?? null,
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        meta: (input.meta ?? {}) as object,
      },
    });
  } catch (error) {
    logger.error('activity log failed', { error: (error as Error).message, action: input.action });
  }
}

/** Convenience helper for the common "log both" case. */
export async function recordEvent(
  security: SecurityLogInput,
  activity?: Omit<ActivityLogInput, 'workspaceId' | 'userId'>,
): Promise<void> {
  await logSecurity(security);
  if (activity) {
    await logActivity({
      ...activity,
      workspaceId: security.workspaceId ?? null,
      userId: security.userId ?? null,
    });
  }
}

export const SECURITY_EVENT_LABELS: Record<SecurityEventType, string> = {
  LOGIN: 'Signed in',
  LOGIN_FAILED: 'Failed sign-in attempt',
  LOGOUT: 'Signed out',
  PASSWORD_CHANGED: 'Password changed',
  PASSWORD_RESET_REQUESTED: 'Password reset requested',
  PASSWORD_RESET_COMPLETED: 'Password reset completed',
  EMAIL_VERIFIED: 'Email verified',
  TWO_FACTOR_ENABLED: 'Two-factor authentication enabled',
  TWO_FACTOR_DISABLED: 'Two-factor authentication disabled',
  QR_CREATED: 'QR code created',
  QR_EDITED: 'QR code edited',
  QR_DELETED: 'QR code deleted',
  QR_PAUSED: 'QR code paused',
  QR_UNPAUSED: 'QR code resumed',
  QR_SCANS_RESET: 'Scan statistics reset',
  API_KEY_CREATED: 'API key created',
  API_KEY_REVOKED: 'API key revoked',
  DOMAIN_ADDED: 'Custom domain added',
  DOMAIN_REMOVED: 'Custom domain removed',
  DOMAIN_VERIFIED: 'Custom domain verified',
  USER_INVITED: 'Team member invited',
  ROLE_CHANGED: 'Role changed',
  MEMBER_DISABLED: 'Team member disabled',
  ADMIN_ABUSE_DISABLE: 'Disabled by platform admin',
  ADMIN_ABUSE_ENABLE: 'Re-enabled by platform admin',
  ADMIN_PANEL_ACCESS: 'Admin panel opened',
  ACCOUNT_LOCKED: 'Account temporarily locked after failed sign-ins',
  ACCOUNT_DELETED: 'Account deleted',
  EXPIRY_POLICY_ENABLED: 'Expiry policy switched on',
  EXPIRY_POLICY_DISABLED: 'Expiry policy switched off',
  TEMPLATE_CREATED: 'Template created',
  BULK_IMPORT: 'Bulk import',
  WEBHOOK_CREATED: 'Webhook created',
};
