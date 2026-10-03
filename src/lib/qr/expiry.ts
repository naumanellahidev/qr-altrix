import { evaluateExpiry, type ExpiryPolicy } from '../routing/evaluate';
import type { PlatformSettings } from '../settings';

/**
 * Bridge between the admin settings and the pure expiry rules.
 *
 * Kept separate from `settings.ts` (which is server-only) so the dashboard can describe
 * the policy to a user without pulling the server module into the browser bundle.
 */

export function expiryPolicyFromSettings(
  settings: Pick<
    PlatformSettings,
    'expiryEnabled' | 'expireAfterDays' | 'expireInactiveAfterDays' | 'expiryAppliesToExisting' | 'expiryEnabledAt'
  > | null
  | undefined,
): ExpiryPolicy | null {
  if (!settings?.expiryEnabled) return null;
  return {
    enabled: true,
    expireAfterDays: settings.expireAfterDays,
    expireInactiveAfterDays: settings.expireInactiveAfterDays,
    appliesToExisting: settings.expiryAppliesToExisting,
    enabledAt: settings.expiryEnabledAt,
  };
}

export interface ExpiryDisplay {
  /** The policy is on and applies to this code. */
  applies: boolean;
  expired: boolean;
  expiresAt: string | null;
  daysLeft: number | null;
  reason: 'expired' | 'expired_inactive' | null;
}

/** What the dashboard shows on a code, so an owner is never surprised by an expiry. */
export function describeExpiry(
  qr: { createdAt?: Date | string | null; lastScanAt?: Date | string | null },
  policy: ExpiryPolicy | null,
  now: Date = new Date(),
): ExpiryDisplay {
  if (!policy?.enabled) {
    return { applies: false, expired: false, expiresAt: null, daysLeft: null, reason: null };
  }

  const result = evaluateExpiry(qr, policy, now);
  if (!result.expiresAt) {
    return { applies: false, expired: false, expiresAt: null, daysLeft: null, reason: null };
  }

  const expiresAt = new Date(result.expiresAt);
  const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / 86_400_000);

  return {
    applies: true,
    expired: result.expired,
    expiresAt: result.expiresAt,
    daysLeft: result.expired ? 0 : Math.max(0, daysLeft),
    reason: result.reason ?? null,
  };
}

/** One-line human summary of the policy, used in the admin panel and the dashboard. */
export function summarizeExpiryPolicy(policy: ExpiryPolicy | null): string {
  if (!policy?.enabled) return 'Off — dynamic codes never expire on their own.';

  const parts: string[] = [];
  if (policy.expireAfterDays > 0) parts.push(`${policy.expireAfterDays} days after creation`);
  if (policy.expireInactiveAfterDays > 0) {
    parts.push(`${policy.expireInactiveAfterDays} days without a scan`);
  }
  if (parts.length === 0) return 'On, but no rule is set — nothing expires yet.';

  return `Codes expire ${parts.join(', or ')}${
    policy.appliesToExisting ? ', including codes created earlier.' : ' (new codes only).'
  }`;
}
