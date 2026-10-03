import { getAuthContext } from '@/lib/auth';
import { clearSessionCookie } from '@/lib/auth/session';
import { logSecurity } from '@/lib/audit';
import { ok, withApi } from '@/lib/api/respond';

export const POST = withApi(async (request: Request) => {
  const context = await getAuthContext();
  if (context) {
    await logSecurity({
      type: 'LOGOUT',
      userId: context.user.id,
      workspaceId: context.workspace.id,
      email: context.user.email,
      headers: request.headers,
    });
  }
  await clearSessionCookie();
  return ok({ signedOut: true });
});
