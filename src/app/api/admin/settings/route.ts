import { requireAdminApi } from '@/lib/api/admin';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { getSettings, updateSettings } from '@/lib/settings';
import { platformSettingsSchema } from '@/lib/validation';
import { logActivity, logSecurity } from '@/lib/audit';

export const GET = withApi(async () => {
  const guard = await requireAdminApi();
  if (!guard.ok) return fail(guard.error, guard.status);
  return ok({ data: await getSettings() });
});

/** Platform-wide switches. Nothing here can make a QR code expire on a timer. */
export const PATCH = withApi(async (request: Request) => {
  const guard = await requireAdminApi();
  if (!guard.ok) return fail(guard.error, guard.status);

  const parsed = platformSettingsSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Check the submitted values', 400);

  const before = await getSettings();
  const next = await updateSettings(parsed.data);

  await logActivity({
    userId: guard.auth.user.id,
    action: 'admin.settings.updated',
    meta: { changed: Object.keys(parsed.data) },
  });

  // Turning expiry on or off changes whether printed codes can stop working, so it is
  // recorded as a security event rather than an ordinary settings change.
  if (parsed.data.expiryEnabled !== undefined && parsed.data.expiryEnabled !== before.expiryEnabled) {
    await logSecurity({
      type: parsed.data.expiryEnabled ? 'EXPIRY_POLICY_ENABLED' : 'EXPIRY_POLICY_DISABLED',
      userId: guard.auth.user.id,
      email: guard.auth.user.email,
      headers: request.headers,
      meta: {
        expireAfterDays: next.expireAfterDays,
        expireInactiveAfterDays: next.expireInactiveAfterDays,
        appliesToExisting: next.expiryAppliesToExisting,
      },
    });
  }

  return ok({ data: next });
});
