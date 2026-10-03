import { appendQueryParams } from '../utils';

/**
 * The redirect decision engine — a pure function, so every rule is unit-testable and
 * the "never expires on its own" guarantee is provable.
 *
 * A dynamic QR code resolves unless one of these is true:
 *   1. the owner paused it,
 *   2. the owner deleted it,
 *   3. the owner turned on scheduling and we are outside the window,
 *   4. the owner turned on a scan limit and it has been reached,
 *   5. a platform admin disabled it for abuse.
 * There is no trial, subscription, inactivity or age check anywhere in this file.
 */

export type InactiveReason =
  | 'paused'
  | 'deleted'
  | 'admin_disabled'
  | 'not_started'
  | 'ended'
  | 'scan_limit'
  | 'closed_now'
  | 'expired'
  | 'expired_inactive';

export type AccessOutcome =
  | { kind: 'ok' }
  | { kind: 'password' }
  | { kind: 'inactive'; reason: InactiveReason; resumesAt?: string | null };

export interface QrGateState {
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ADMIN_DISABLED';
  deletedAt?: Date | string | null;
  passwordHash?: string | null;
  scheduleEnabled: boolean;
  scheduleStart?: Date | string | null;
  scheduleEnd?: Date | string | null;
  timeRules?: TimeRule[] | null;
  scanLimitEnabled: boolean;
  scanLimitMax?: number | null;
  scanCount: number;
  /** Needed only when an operator has switched on the expiry policy. */
  createdAt?: Date | string | null;
  lastScanAt?: Date | string | null;
}

/**
 * Operator-controlled expiry.
 *
 * This is deliberately a policy object rather than a hard-coded rule: with `enabled`
 * false — the default for a fresh install — nothing here can stop a code, and the
 * product behaves as "dynamic codes never expire". An administrator who turns it on is
 * making that choice explicitly, and it is logged.
 */
export interface ExpiryPolicy {
  enabled: boolean;
  /** Days after creation. 0 = never. */
  expireAfterDays: number;
  /** Days without a scan. 0 = never. */
  expireInactiveAfterDays: number;
  /** Also apply to codes created before the policy was switched on. */
  appliesToExisting: boolean;
  /** When the policy was switched on; the cut-off for `appliesToExisting`. */
  enabledAt?: Date | string | null;
}

export interface ExpiryResult {
  /** The code is past its allowed life. */
  expired: boolean;
  reason?: 'expired' | 'expired_inactive';
  /** When the code expires (or expired), for display in the dashboard. */
  expiresAt?: string | null;
}

/**
 * Works out whether the expiry policy currently blocks a code, and when it will.
 * Returns `expired: false` with no date whenever the policy cannot apply.
 */
export function evaluateExpiry(
  qr: Pick<QrGateState, 'createdAt' | 'lastScanAt'>,
  policy: ExpiryPolicy | null | undefined,
  now: Date = new Date(),
): ExpiryResult {
  if (!policy?.enabled) return { expired: false };

  const createdAt = qr.createdAt ? new Date(qr.createdAt) : null;
  if (!createdAt || Number.isNaN(createdAt.getTime())) return { expired: false };

  // Codes that predate the policy are exempt unless the operator says otherwise.
  if (!policy.appliesToExisting && policy.enabledAt) {
    const enabledAt = new Date(policy.enabledAt);
    if (!Number.isNaN(enabledAt.getTime()) && createdAt < enabledAt) {
      return { expired: false };
    }
  }

  const candidates: { at: number; reason: 'expired' | 'expired_inactive' }[] = [];

  if (policy.expireAfterDays > 0) {
    candidates.push({
      at: createdAt.getTime() + policy.expireAfterDays * 86_400_000,
      reason: 'expired',
    });
  }

  if (policy.expireInactiveAfterDays > 0) {
    // A code that has never been scanned counts from its creation date.
    const lastActivity = qr.lastScanAt ? new Date(qr.lastScanAt) : createdAt;
    const from = Number.isNaN(lastActivity.getTime()) ? createdAt : lastActivity;
    candidates.push({
      at: from.getTime() + policy.expireInactiveAfterDays * 86_400_000,
      reason: 'expired_inactive',
    });
  }

  if (candidates.length === 0) return { expired: false };

  // The earliest deadline wins, so the reported date is the one that actually bites.
  const soonest = candidates.reduce((best, item) => (item.at < best.at ? item : best));
  const expiresAt = new Date(soonest.at).toISOString();

  if (now.getTime() >= soonest.at) {
    return { expired: true, reason: soonest.reason, expiresAt };
  }
  return { expired: false, expiresAt };
}

export interface TimeRule {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  start: string;
  end: string;
  url?: string | null;
}

const DAY_KEYS: TimeRule['day'][] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export interface ZonedParts {
  day: TimeRule['day'];
  minutes: number;
  hour: number;
}

/** Day-of-week and minute-of-day in a given IANA timezone. */
export function zonedParts(date: Date, timeZone = 'UTC'): ZonedParts {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Sun';
    const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
    const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
    const map: Record<string, TimeRule['day']> = {
      Sun: 'sun',
      Mon: 'mon',
      Tue: 'tue',
      Wed: 'wed',
      Thu: 'thu',
      Fri: 'fri',
      Sat: 'sat',
    };
    const normalizedHour = hour === 24 ? 0 : hour;
    return { day: map[weekday] ?? 'sun', minutes: normalizedHour * 60 + minute, hour: normalizedHour };
  } catch {
    const day = DAY_KEYS[date.getUTCDay()];
    return { day, minutes: date.getUTCHours() * 60 + date.getUTCMinutes(), hour: date.getUTCHours() };
  }
}

function toMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** True when `now` falls inside the rule's window (windows may cross midnight). */
export function matchesTimeRule(rule: TimeRule, parts: ZonedParts): boolean {
  if (rule.day !== parts.day) return false;
  const start = toMinutes(rule.start);
  const end = toMinutes(rule.end);
  if (start === null || end === null) return false;
  if (start <= end) return parts.minutes >= start && parts.minutes <= end;
  // Window wraps past midnight, e.g. 22:00 → 02:00.
  return parts.minutes >= start || parts.minutes <= end;
}

export interface EvaluateOptions {
  now?: Date;
  /** True when the visitor has already entered the correct password. */
  passwordVerified?: boolean;
  timeZone?: string;
  /** Operator-controlled expiry. Omit (or disable) and nothing expires. */
  expiry?: ExpiryPolicy | null;
}

export function evaluateAccess(qr: QrGateState, options: EvaluateOptions = {}): AccessOutcome {
  const now = options.now ?? new Date();

  if (qr.status === 'DELETED' || qr.deletedAt) return { kind: 'inactive', reason: 'deleted' };
  if (qr.status === 'ADMIN_DISABLED') return { kind: 'inactive', reason: 'admin_disabled' };
  if (qr.status === 'PAUSED') return { kind: 'inactive', reason: 'paused' };

  // Checked before the password prompt: there is no point asking a visitor for a
  // password to reach a code that the operator's policy has already closed.
  const expiry = evaluateExpiry(qr, options.expiry, now);
  if (expiry.expired) {
    return { kind: 'inactive', reason: expiry.reason ?? 'expired' };
  }

  if (qr.passwordHash && !options.passwordVerified) return { kind: 'password' };

  // Scheduling only applies when the owner explicitly enabled it.
  if (qr.scheduleEnabled) {
    const start = qr.scheduleStart ? new Date(qr.scheduleStart) : null;
    const end = qr.scheduleEnd ? new Date(qr.scheduleEnd) : null;
    if (start && now < start) {
      return { kind: 'inactive', reason: 'not_started', resumesAt: start.toISOString() };
    }
    if (end && now > end) {
      return { kind: 'inactive', reason: 'ended' };
    }
    const rules = Array.isArray(qr.timeRules) ? qr.timeRules : [];
    if (rules.length > 0) {
      const parts = zonedParts(now, options.timeZone ?? 'UTC');
      const anyRuleForToday = rules.some((rule) => rule.day === parts.day);
      const open = rules.some((rule) => matchesTimeRule(rule, parts));
      // Days with no rule at all stay open; a day with rules is closed outside them.
      if (anyRuleForToday && !open) {
        return { kind: 'inactive', reason: 'closed_now' };
      }
    }
  }

  // Scan limits are opt-in and owner-controlled.
  if (qr.scanLimitEnabled && typeof qr.scanLimitMax === 'number' && qr.scanLimitMax > 0) {
    if (qr.scanCount >= qr.scanLimitMax) {
      return { kind: 'inactive', reason: 'scan_limit' };
    }
  }

  return { kind: 'ok' };
}

// --------------------------------------------------------------- smart routing

export interface DestinationRule {
  kind: 'DEFAULT' | 'COUNTRY' | 'LANGUAGE' | 'DEVICE' | 'TIME';
  matchValue?: string | null;
  url: string;
  priority?: number;
}

export interface VisitorContext {
  country?: string | null;
  language?: string | null;
  deviceType?: string | null;
  now?: Date;
  timeZone?: string;
}

function languageMatches(pattern: string, language: string): boolean {
  const p = pattern.trim().toLowerCase();
  const l = language.trim().toLowerCase();
  if (!p || !l) return false;
  if (p === l) return true;
  // "en" matches "en-GB"; "en-GB" does not match plain "en".
  return l.startsWith(`${p}-`);
}

/**
 * Picks the destination for a visitor. More specific rule kinds win, and within a kind
 * the lowest `priority` number wins — so the owner's ordering is respected.
 */
export function pickDestination(rules: DestinationRule[], ctx: VisitorContext = {}): string | null {
  const sorted = [...rules].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  const order: DestinationRule['kind'][] = ['TIME', 'DEVICE', 'COUNTRY', 'LANGUAGE'];

  for (const kind of order) {
    for (const rule of sorted.filter((r) => r.kind === kind)) {
      const match = (rule.matchValue ?? '').trim();
      if (!match) continue;

      if (kind === 'COUNTRY' && ctx.country) {
        const codes = match.split(/[,\s]+/).map((c) => c.trim().toUpperCase()).filter(Boolean);
        if (codes.includes(ctx.country.toUpperCase())) return rule.url;
      }
      if (kind === 'LANGUAGE' && ctx.language) {
        const langs = match.split(/[,\s]+/).filter(Boolean);
        if (langs.some((lang) => languageMatches(lang, ctx.language as string))) return rule.url;
      }
      if (kind === 'DEVICE' && ctx.deviceType) {
        const devices = match.split(/[,\s]+/).map((d) => d.trim().toLowerCase()).filter(Boolean);
        const device = ctx.deviceType.toLowerCase();
        if (devices.includes(device)) return rule.url;
        if (devices.includes('mobile') && (device === 'mobile' || device === 'tablet')) return rule.url;
      }
      if (kind === 'TIME') {
        const parts = zonedParts(ctx.now ?? new Date(), ctx.timeZone ?? 'UTC');
        // matchValue format: "mon,tue 09:00-17:00"
        const timeMatch = /^([a-z,\s]*)\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/i.exec(match);
        if (timeMatch) {
          const days = timeMatch[1]
            .split(/[,\s]+/)
            .map((d) => d.trim().toLowerCase())
            .filter(Boolean);
          const dayOk = days.length === 0 || days.includes(parts.day);
          if (dayOk && matchesTimeRule({ day: parts.day, start: timeMatch[2], end: timeMatch[3] }, parts)) {
            return rule.url;
          }
        }
      }
    }
  }

  const fallback = sorted.find((r) => r.kind === 'DEFAULT');
  return fallback?.url ?? null;
}

export interface UtmConfig {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  term?: string | null;
  content?: string | null;
  custom?: { key: string; value: string }[];
}

/** Adds the owner's UTM parameters to the final destination. */
export function applyUtm(url: string, utm?: UtmConfig | null): string {
  if (!utm) return url;
  const params: Record<string, string | undefined> = {
    utm_source: utm.source ?? undefined,
    utm_medium: utm.medium ?? undefined,
    utm_campaign: utm.campaign ?? undefined,
    utm_term: utm.term ?? undefined,
    utm_content: utm.content ?? undefined,
  };
  for (const pair of utm.custom ?? []) {
    if (pair.key) params[pair.key] = pair.value;
  }
  return appendQueryParams(url, params);
}

/** App-store codes route by device before anything else. */
export function pickAppStoreUrl(
  content: { iosUrl?: string | null; androidUrl?: string | null; otherUrl?: string | null },
  userAgent: string,
): string | null {
  const ua = userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod|ios/.test(ua) || (/macintosh/.test(ua) && /mobile/.test(ua));
  const isAndroid = /android/.test(ua);
  if (isIos && content.iosUrl) return content.iosUrl;
  if (isAndroid && content.androidUrl) return content.androidUrl;
  return content.otherUrl ?? content.iosUrl ?? content.androidUrl ?? null;
}
