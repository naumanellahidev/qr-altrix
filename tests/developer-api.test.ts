import { describe, expect, it, vi } from 'vitest';

/**
 * The developer API (API keys, webhooks, OpenAPI, docs) is off until a platform admin
 * switches it on. The guard answers 404 while it is off and steps aside once it is on.
 */

const developerApi = vi.hoisted(() => ({ enabled: false }));
vi.mock('@/lib/settings', () => ({
  isDeveloperApiEnabled: async () => developerApi.enabled,
}));

describe('developer API switch', () => {
  it('answers 404 while the developer API is off', async () => {
    developerApi.enabled = false;
    const { developerApiGate, DEVELOPER_API_OFF } = await import('@/lib/api/developer');
    const response = await developerApiGate();
    expect(response?.status).toBe(404);
    expect(await response?.json()).toMatchObject({ ok: false, error: DEVELOPER_API_OFF, code: 'developer_api_disabled' });
  });

  it('lets the call through once a platform admin switches it on', async () => {
    developerApi.enabled = true;
    const { developerApiGate } = await import('@/lib/api/developer');
    expect(await developerApiGate()).toBeNull();
  });
});
