import { getAuthContext } from '@/lib/auth';
import { readDraftSessionId } from '@/lib/auth/session';
import { claimDraft } from '@/lib/drafts';
import { fail, ok, withApi } from '@/lib/api/respond';

/** Turns a stored anonymous draft into a saved QR code for the signed-in user. */
export const POST = withApi(async (request: Request) => {
  const auth = await getAuthContext();
  if (!auth) return fail('Sign in to save your draft', 401);

  const sessionId = await readDraftSessionId();
  const qrCodeId = await claimDraft({
    sessionId,
    userId: auth.user.id,
    workspaceId: auth.workspace.id,
    headers: request.headers,
  });

  return ok({ claimed: Boolean(qrCodeId), qrCodeId });
});
