import { getOrCreateDraftSessionId, readDraftSessionId } from '@/lib/auth/session';
import { getDraft, saveDraft } from '@/lib/drafts';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { ok, readJson, tooMany, withApi } from '@/lib/api/respond';
import { ipKey } from '@/lib/api/actor';

/** Stores the visitor's in-progress code so it survives the signup round trip. */
export const POST = withApi(async (request: Request) => {
  const limit = await rateLimit(ipKey(request, 'draft'), 60, 60);
  if (!limit.allowed) return tooMany('Too many draft saves', rateLimitHeaders(limit));

  const sessionId = await getOrCreateDraftSessionId();
  await saveDraft(sessionId, await readJson(request));
  return ok({ saved: true });
});

/** Lets the dashboard pick up a draft that was designed before signing in. */
export const GET = withApi(async () => {
  const sessionId = await readDraftSessionId();
  const draft = await getDraft(sessionId);
  return ok({ draft });
});
