import { describe, expect, it } from 'vitest';
import { evaluateAccess, evaluateExpiry, type ExpiryPolicy, type QrGateState } from '@/lib/routing/evaluate';
import { describeExpiry, expiryPolicyFromSettings, summarizeExpiryPolicy } from '@/lib/qr/expiry';

/**
 * The expiry policy is operator-controlled and off by default. These tests pin both
 * halves of that: nothing expires while it is off, and exactly what the operator
 * configured happens once it is on.
 */

const DAY = 86_400_000;
const NOW = new Date('2026-07-01T12:00:00Z');

function gate(overrides: Partial<QrGateState> = {}): QrGateState {
  return {
    status: 'ACTIVE',
    deletedAt: null,
    passwordHash: null,
    scheduleEnabled: false,
    scheduleStart: null,
    scheduleEnd: null,
    timeRules: null,
    scanLimitEnabled: false,
    scanLimitMax: null,
    scanCount: 0,
    createdAt: new Date(NOW.getTime() - 400 * DAY),
    lastScanAt: new Date(NOW.getTime() - 200 * DAY),
    ...overrides,
  };
}

function policy(overrides: Partial<ExpiryPolicy> = {}): ExpiryPolicy {
  return {
    enabled: true,
    expireAfterDays: 0,
    expireInactiveAfterDays: 0,
    appliesToExisting: true,
    enabledAt: new Date(NOW.getTime() - 500 * DAY).toISOString(),
    ...overrides,
  };
}

describe('policy off (the default)', () => {
  it('never expires when there is no policy', () => {
    expect(evaluateExpiry(gate(), null, NOW).expired).toBe(false);
    expect(evaluateExpiry(gate(), undefined, NOW).expired).toBe(false);
  });

  it('never expires when the master switch is off, even with rules set', () => {
    const result = evaluateExpiry(
      gate(),
      policy({ enabled: false, expireAfterDays: 1, expireInactiveAfterDays: 1 }),
      NOW,
    );
    expect(result.expired).toBe(false);
    expect(result.expiresAt).toBeUndefined();
  });

  it('never expires when the switch is on but no rule is set', () => {
    expect(evaluateExpiry(gate(), policy(), NOW).expired).toBe(false);
  });

  it('builds no policy object from settings while expiry is disabled', () => {
    expect(
      expiryPolicyFromSettings({
        expiryEnabled: false,
        expireAfterDays: 30,
        expireInactiveAfterDays: 30,
        expiryAppliesToExisting: true,
        expiryEnabledAt: null,
      }),
    ).toBeNull();
  });
});

describe('age-based expiry', () => {
  it('expires a code older than the limit', () => {
    const result = evaluateExpiry(gate(), policy({ expireAfterDays: 365 }), NOW);
    expect(result.expired).toBe(true);
    expect(result.reason).toBe('expired');
  });

  it('keeps a code inside the limit, and reports when it will expire', () => {
    const result = evaluateExpiry(
      gate({ createdAt: new Date(NOW.getTime() - 10 * DAY) }),
      policy({ expireAfterDays: 365 }),
      NOW,
    );
    expect(result.expired).toBe(false);
    expect(result.expiresAt).toBe(new Date(NOW.getTime() + 355 * DAY).toISOString());
  });

  it('expires exactly on the boundary', () => {
    const createdAt = new Date(NOW.getTime() - 30 * DAY);
    expect(evaluateExpiry({ createdAt, lastScanAt: null }, policy({ expireAfterDays: 30 }), NOW).expired).toBe(true);
  });
});

describe('inactivity-based expiry', () => {
  it('expires a code that has not been scanned for too long', () => {
    const result = evaluateExpiry(gate(), policy({ expireInactiveAfterDays: 90 }), NOW);
    expect(result.expired).toBe(true);
    expect(result.reason).toBe('expired_inactive');
  });

  it('counts from creation when a code has never been scanned', () => {
    const result = evaluateExpiry(
      { createdAt: new Date(NOW.getTime() - 100 * DAY), lastScanAt: null },
      policy({ expireInactiveAfterDays: 90 }),
      NOW,
    );
    expect(result.expired).toBe(true);
  });

  it('keeps a recently scanned code alive however old it is', () => {
    const result = evaluateExpiry(
      { createdAt: new Date(NOW.getTime() - 900 * DAY), lastScanAt: new Date(NOW.getTime() - 2 * DAY) },
      policy({ expireInactiveAfterDays: 90 }),
      NOW,
    );
    expect(result.expired).toBe(false);
  });

  it('reports the earlier of the two deadlines', () => {
    const result = evaluateExpiry(
      { createdAt: new Date(NOW.getTime() - 10 * DAY), lastScanAt: new Date(NOW.getTime() - 5 * DAY) },
      policy({ expireAfterDays: 365, expireInactiveAfterDays: 30 }),
      NOW,
    );
    // Inactivity bites first: 5 days since the last scan + 30 = 25 days from now.
    expect(result.expiresAt).toBe(new Date(NOW.getTime() + 25 * DAY).toISOString());
  });
});

describe('applies to existing codes', () => {
  const enabledAt = new Date(NOW.getTime() - 10 * DAY).toISOString();

  it('exempts codes created before the policy was switched on', () => {
    const result = evaluateExpiry(
      gate({ createdAt: new Date(NOW.getTime() - 400 * DAY) }),
      policy({ expireAfterDays: 30, appliesToExisting: false, enabledAt }),
      NOW,
    );
    expect(result.expired).toBe(false);
  });

  it('includes those codes when the operator opts in', () => {
    const result = evaluateExpiry(
      gate({ createdAt: new Date(NOW.getTime() - 400 * DAY) }),
      policy({ expireAfterDays: 30, appliesToExisting: true, enabledAt }),
      NOW,
    );
    expect(result.expired).toBe(true);
  });

  it('still applies to codes created after it was switched on', () => {
    const result = evaluateExpiry(
      { createdAt: new Date(NOW.getTime() - 5 * DAY), lastScanAt: null },
      policy({ expireAfterDays: 1, appliesToExisting: false, enabledAt }),
      NOW,
    );
    expect(result.expired).toBe(true);
  });
});

describe('access decisions with expiry', () => {
  it('reports expired as an inactive reason', () => {
    const outcome = evaluateAccess(gate(), { now: NOW, expiry: policy({ expireAfterDays: 365 }) });
    expect(outcome).toEqual({ kind: 'inactive', reason: 'expired' });
  });

  it('does not ask for a password on an expired code', () => {
    const outcome = evaluateAccess(gate({ passwordHash: '$2a$12$hash' }), {
      now: NOW,
      expiry: policy({ expireAfterDays: 365 }),
    });
    expect(outcome).toEqual({ kind: 'inactive', reason: 'expired' });
  });

  it('still puts paused and deleted ahead of expiry', () => {
    expect(evaluateAccess(gate({ status: 'PAUSED' }), { now: NOW, expiry: policy({ expireAfterDays: 1 }) })).toEqual({
      kind: 'inactive',
      reason: 'paused',
    });
    expect(evaluateAccess(gate({ status: 'DELETED' }), { now: NOW, expiry: policy({ expireAfterDays: 1 }) })).toEqual({
      kind: 'inactive',
      reason: 'deleted',
    });
  });

  it('resolves normally when the policy is absent — the default install', () => {
    expect(evaluateAccess(gate(), { now: NOW })).toEqual({ kind: 'ok' });
  });
});

describe('dashboard display', () => {
  it('says the policy does not apply when it is off', () => {
    const display = describeExpiry(gate(), null, NOW);
    expect(display).toMatchObject({ applies: false, expired: false, expiresAt: null });
  });

  it('reports days left for a live code', () => {
    const display = describeExpiry(
      { createdAt: new Date(NOW.getTime() - 10 * DAY), lastScanAt: null },
      policy({ expireAfterDays: 40 }),
      NOW,
    );
    expect(display.applies).toBe(true);
    expect(display.expired).toBe(false);
    expect(display.daysLeft).toBe(30);
  });

  it('reports zero days left once expired', () => {
    const display = describeExpiry(gate(), policy({ expireAfterDays: 30 }), NOW);
    expect(display.expired).toBe(true);
    expect(display.daysLeft).toBe(0);
    expect(display.reason).toBe('expired');
  });
});

describe('policy summary', () => {
  it('states clearly that nothing expires when off', () => {
    expect(summarizeExpiryPolicy(null)).toContain('never expire');
  });

  it('describes both rules and the scope', () => {
    const text = summarizeExpiryPolicy(
      policy({ expireAfterDays: 365, expireInactiveAfterDays: 90, appliesToExisting: false }),
    );
    expect(text).toContain('365 days after creation');
    expect(text).toContain('90 days without a scan');
    expect(text).toContain('new codes only');
  });

  it('admits when the switch is on but nothing is configured', () => {
    expect(summarizeExpiryPolicy(policy())).toContain('no rule is set');
  });
});
