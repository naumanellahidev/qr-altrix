import 'server-only';
import type { NextResponse } from 'next/server';
import { isDeveloperApiEnabled } from '../settings';
import { fail } from './respond';

/** Shown to callers while a platform admin has the developer API switched off. */
export const DEVELOPER_API_OFF = 'The developer API is not enabled on this platform';

/**
 * Developer-only endpoints (API keys, webhooks, the OpenAPI description) answer 404 while
 * the developer API is off. Returns the response to send, or null when the call may proceed.
 */
export async function developerApiGate(): Promise<NextResponse | null> {
  if (await isDeveloperApiEnabled()) return null;
  return fail(DEVELOPER_API_OFF, 404, { code: 'developer_api_disabled' });
}
