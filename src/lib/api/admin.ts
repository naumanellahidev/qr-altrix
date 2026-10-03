import 'server-only';
import { getAuthContext, type AuthContext } from '../auth';
import { getSettings } from '../settings';
import { rateLimit } from '../rate-limit';

export type AdminResult = { ok: true; auth: AuthContext } | { ok: false; status: number; error: string };

/**
 * Guard for admin API routes: platform admins only, no workspace scoping.
 *
 * Deliberately stricter than the dashboard guard — these endpoints can disable other
 * people's QR codes, so they also enforce the two-factor requirement and their own rate
 * limit rather than relying on the generic one.
 */
export async function requireAdminApi(): Promise<AdminResult> {
  const auth = await getAuthContext();
  if (!auth) return { ok: false, status: 401, error: 'Sign in to continue' };
  if (!auth.user.isPlatformAdmin) return { ok: false, status: 403, error: 'Platform administrators only' };

  const settings = await getSettings().catch(() => null);
  if (settings?.requireTwoFactorForAdmins && !auth.user.twoFactorEnabled) {
    return {
      ok: false,
      status: 403,
      error: 'Two-factor authentication is required for administrators. Enrol it in Settings → Security first.',
    };
  }

  const limit = await rateLimit(`admin-api:${auth.user.id}`, 300, 60);
  if (!limit.allowed) {
    return { ok: false, status: 429, error: 'Too many admin requests — slow down a little' };
  }

  return { ok: true, auth };
}
