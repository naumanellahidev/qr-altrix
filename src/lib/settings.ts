import 'server-only';
import { prisma } from './db';
import { env } from './env';
import { logger } from './logger';
import { defaultBrandingText } from './qr/branding';

/**
 * Platform settings live in the database so an admin can change them without a redeploy.
 * Environment variables provide the defaults.
 */

export interface PlatformSettings {
  /** Visitors may download a STATIC code without creating an account. */
  allowGuestStaticDownload: boolean;
  /** New self-service signups are open. */
  allowSignups: boolean;
  /** Require a verified email before QR codes can be created. */
  requireEmailVerification: boolean;

  // --- expiry policy ------------------------------------------------------
  // Off by default: out of the box a dynamic QR code never expires. These switches
  // exist so the operator — not the product — decides otherwise.
  /** Master switch. While false, every other expiry field is ignored. */
  expiryEnabled: boolean;
  /** Expire a dynamic code this many days after it was created. 0 = never. */
  expireAfterDays: number;
  /** Expire a dynamic code after this many days with no scans. 0 = never. */
  expireInactiveAfterDays: number;
  /** Apply to codes that already existed when the policy was switched on. */
  expiryAppliesToExisting: boolean;
  /** Set automatically when the master switch is turned on; used as the cut-off. */
  expiryEnabledAt: string | null;

  // --- login and admin security ------------------------------------------
  /** Platform admins must have two-factor authentication enrolled. */
  requireTwoFactorForAdmins: boolean;
  /** Sign a session out after this many minutes of inactivity. 0 = never. */
  sessionIdleTimeoutMinutes: number;
  /** Temporarily block an account after this many failed sign-ins in 15 minutes. */
  lockoutAfterFailedAttempts: number;
  /** 0 = keep scan analytics forever. */
  analyticsRetentionDays: number;
  /** Credit line under every rendered QR code ("Free QR codes by QR ALTRIX · <host>"). */
  brandingEnabled: boolean;
  brandingText: string;
  maxUploadMb: number;
  bulkMaxRows: number;
  rateLimitApiPerMin: number;
  rateLimitAuthPerMin: number;
  ipStorageMode: 'hashed' | 'never';
  /** Words that flag a destination for admin review (never auto-disables a code). */
  abuseKeywords: string[];
  /** Shown as a banner across the dashboard when set. */
  maintenanceNote: string;
  /**
   * The public developer surface: API-key access, API keys, webhooks and the API docs.
   * Off until a platform admin switches it on. The dashboard's own session calls to
   * /api/v1 are not affected.
   */
  developerApiEnabled: boolean;
}

const SETTINGS_KEY = 'platform';

function defaults(): PlatformSettings {
  return {
    allowGuestStaticDownload: env.allowGuestStaticDownload,
    allowSignups: true,
    requireEmailVerification: false,

    expiryEnabled: false,
    expireAfterDays: 0,
    expireInactiveAfterDays: 0,
    expiryAppliesToExisting: false,
    expiryEnabledAt: null,

    requireTwoFactorForAdmins: false,
    sessionIdleTimeoutMinutes: 0,
    lockoutAfterFailedAttempts: 10,
    analyticsRetentionDays: env.analyticsRetentionDays,
    brandingEnabled: true,
    brandingText: defaultBrandingText(env.appUrl),
    maxUploadMb: env.storage.maxUploadMb,
    bulkMaxRows: env.bulkMaxRows,
    rateLimitApiPerMin: env.rateLimits.apiPerMin,
    rateLimitAuthPerMin: env.rateLimits.authPerMin,
    ipStorageMode: env.ipStorageMode,
    abuseKeywords: [],
    maintenanceNote: '',
    developerApiEnabled: false,
  };
}

let cache: { value: PlatformSettings; expiresAt: number } | null = null;
const CACHE_MS = 20_000;

export async function getSettings(): Promise<PlatformSettings> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;
  const base = defaults();
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: SETTINGS_KEY } });
    const stored = (row?.value as Partial<PlatformSettings> | undefined) ?? {};
    const value: PlatformSettings = { ...base, ...stored };
    cache = { value, expiresAt: Date.now() + CACHE_MS };
    return value;
  } catch (error) {
    logger.warn('settings read failed, using defaults', { error: (error as Error).message });
    return base;
  }
}

export async function updateSettings(patch: Partial<PlatformSettings>): Promise<PlatformSettings> {
  const current = await getSettings();
  const next: PlatformSettings = { ...current, ...patch };

  // Stamp the moment expiry was switched on, so "applies to existing codes = off" has a
  // cut-off to work from. Switching it off clears the stamp.
  if (patch.expiryEnabled === true && !current.expiryEnabled) {
    next.expiryEnabledAt = new Date().toISOString();
  }
  if (patch.expiryEnabled === false) {
    next.expiryEnabledAt = null;
  }

  await prisma.systemSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value: next as object },
    update: { value: next as object },
  });
  cache = { value: next, expiresAt: Date.now() + CACHE_MS };
  return next;
}

/** Whether the developer API is switched on. Fails closed: a settings read error means off. */
export async function isDeveloperApiEnabled(): Promise<boolean> {
  const settings = await getSettings().catch(() => null);
  return Boolean(settings?.developerApiEnabled);
}

export function invalidateSettingsCache(): void {
  cache = null;
}

/** Flags a destination for human review. It never disables anything on its own. */
export async function screenDestination(url: string): Promise<{ flagged: boolean; matched: string[] }> {
  const settings = await getSettings();
  if (settings.abuseKeywords.length === 0) return { flagged: false, matched: [] };
  const haystack = url.toLowerCase();
  const matched = settings.abuseKeywords
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 2 && haystack.includes(k));
  return { flagged: matched.length > 0, matched };
}
