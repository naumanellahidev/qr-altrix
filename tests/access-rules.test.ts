import { describe, expect, it } from 'vitest';
import {
  evaluateAccess, matchesTimeRule, zonedParts, type QrGateState,
} from '@/lib/routing/evaluate';

/**
 * These tests are the written form of the product's core promise: a dynamic QR code
 * never stops working on its own. If one of them fails, the promise is broken.
 */

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
    ...overrides,
  };
}

describe('the never-expires guarantee', () => {
  it('resolves a plain active code', () => {
    expect(evaluateAccess(gate())).toEqual({ kind: 'ok' });
  });

  it('still resolves a code created years ago with millions of scans', () => {
    const outcome = evaluateAccess(
      gate({ scanCount: 9_500_000 }),
      { now: new Date('2031-06-01T12:00:00Z') },
    );
    expect(outcome).toEqual({ kind: 'ok' });
  });

  it('ignores schedule dates while scheduling is switched off', () => {
    const outcome = evaluateAccess(
      gate({
        scheduleEnabled: false,
        scheduleStart: new Date('2030-01-01T00:00:00Z'),
        scheduleEnd: new Date('2020-01-01T00:00:00Z'),
      }),
    );
    expect(outcome).toEqual({ kind: 'ok' });
  });

  it('ignores a scan limit while the limit is switched off', () => {
    const outcome = evaluateAccess(gate({ scanLimitEnabled: false, scanLimitMax: 10, scanCount: 5000 }));
    expect(outcome).toEqual({ kind: 'ok' });
  });
});

describe('owner-controlled stops', () => {
  it('reports paused codes', () => {
    expect(evaluateAccess(gate({ status: 'PAUSED' }))).toEqual({ kind: 'inactive', reason: 'paused' });
  });

  it('reports deleted codes, by status or by timestamp', () => {
    expect(evaluateAccess(gate({ status: 'DELETED' }))).toEqual({ kind: 'inactive', reason: 'deleted' });
    expect(evaluateAccess(gate({ deletedAt: new Date() }))).toEqual({ kind: 'inactive', reason: 'deleted' });
  });

  it('reports admin-disabled codes', () => {
    expect(evaluateAccess(gate({ status: 'ADMIN_DISABLED' }))).toEqual({
      kind: 'inactive',
      reason: 'admin_disabled',
    });
  });

  it('asks for a password before anything else when one is set', () => {
    expect(evaluateAccess(gate({ passwordHash: '$2a$12$hash' }))).toEqual({ kind: 'password' });
  });

  it('passes through once the password has been verified', () => {
    expect(
      evaluateAccess(gate({ passwordHash: '$2a$12$hash' }), { passwordVerified: true }),
    ).toEqual({ kind: 'ok' });
  });

  it('puts the deleted check ahead of the password check', () => {
    const outcome = evaluateAccess(gate({ status: 'DELETED', passwordHash: '$2a$12$hash' }));
    expect(outcome).toEqual({ kind: 'inactive', reason: 'deleted' });
  });
});

describe('owner-enabled scheduling', () => {
  const now = new Date('2026-06-15T12:00:00Z');

  it('blocks before the start date and reports when it resumes', () => {
    const outcome = evaluateAccess(
      gate({ scheduleEnabled: true, scheduleStart: new Date('2026-07-01T00:00:00Z') }),
      { now },
    );
    expect(outcome).toMatchObject({ kind: 'inactive', reason: 'not_started' });
    expect(outcome).toHaveProperty('resumesAt', '2026-07-01T00:00:00.000Z');
  });

  it('blocks after the end date', () => {
    const outcome = evaluateAccess(
      gate({ scheduleEnabled: true, scheduleEnd: new Date('2026-06-01T00:00:00Z') }),
      { now },
    );
    expect(outcome).toEqual({ kind: 'inactive', reason: 'ended' });
  });

  it('resolves inside the window', () => {
    const outcome = evaluateAccess(
      gate({
        scheduleEnabled: true,
        scheduleStart: new Date('2026-06-01T00:00:00Z'),
        scheduleEnd: new Date('2026-12-31T00:00:00Z'),
      }),
      { now },
    );
    expect(outcome).toEqual({ kind: 'ok' });
  });

  it('closes outside opening hours on days that have rules', () => {
    // 2026-06-15 is a Monday; 12:00 UTC is outside 18:00–22:00.
    const outcome = evaluateAccess(
      gate({ scheduleEnabled: true, timeRules: [{ day: 'mon', start: '18:00', end: '22:00' }] }),
      { now, timeZone: 'UTC' },
    );
    expect(outcome).toEqual({ kind: 'inactive', reason: 'closed_now' });
  });

  it('leaves days without any rule open', () => {
    const outcome = evaluateAccess(
      gate({ scheduleEnabled: true, timeRules: [{ day: 'sun', start: '10:00', end: '14:00' }] }),
      { now, timeZone: 'UTC' },
    );
    expect(outcome).toEqual({ kind: 'ok' });
  });

  it('respects the timezone when evaluating opening hours', () => {
    // 12:00 UTC is 17:00 in Karachi, which is inside a 16:00–20:00 window.
    const outcome = evaluateAccess(
      gate({ scheduleEnabled: true, timeRules: [{ day: 'mon', start: '16:00', end: '20:00' }] }),
      { now, timeZone: 'Asia/Karachi' },
    );
    expect(outcome).toEqual({ kind: 'ok' });
  });
});

describe('owner-enabled scan limit', () => {
  it('resolves below the limit', () => {
    expect(evaluateAccess(gate({ scanLimitEnabled: true, scanLimitMax: 100, scanCount: 99 }))).toEqual({
      kind: 'ok',
    });
  });

  it('blocks once the limit is reached', () => {
    expect(evaluateAccess(gate({ scanLimitEnabled: true, scanLimitMax: 100, scanCount: 100 }))).toEqual({
      kind: 'inactive',
      reason: 'scan_limit',
    });
  });

  it('ignores a limit of zero or null, which would otherwise lock a code instantly', () => {
    expect(evaluateAccess(gate({ scanLimitEnabled: true, scanLimitMax: 0, scanCount: 5 }))).toEqual({
      kind: 'ok',
    });
    expect(evaluateAccess(gate({ scanLimitEnabled: true, scanLimitMax: null, scanCount: 5 }))).toEqual({
      kind: 'ok',
    });
  });
});

describe('time rule matching', () => {
  it('matches inside a normal window', () => {
    const parts = { day: 'mon' as const, minutes: 13 * 60, hour: 13 };
    expect(matchesTimeRule({ day: 'mon', start: '09:00', end: '17:00' }, parts)).toBe(true);
  });

  it('matches a window that crosses midnight', () => {
    const lateNight = { day: 'fri' as const, minutes: 1 * 60, hour: 1 };
    expect(matchesTimeRule({ day: 'fri', start: '22:00', end: '02:00' }, lateNight)).toBe(true);
  });

  it('rejects a different day', () => {
    const parts = { day: 'tue' as const, minutes: 10 * 60, hour: 10 };
    expect(matchesTimeRule({ day: 'mon', start: '09:00', end: '17:00' }, parts)).toBe(false);
  });

  it('rejects malformed times rather than matching everything', () => {
    const parts = { day: 'mon' as const, minutes: 600, hour: 10 };
    expect(matchesTimeRule({ day: 'mon', start: 'morning', end: '17:00' }, parts)).toBe(false);
  });
});

describe('zonedParts', () => {
  it('converts to the requested timezone', () => {
    const parts = zonedParts(new Date('2026-06-15T12:00:00Z'), 'Asia/Karachi');
    expect(parts.day).toBe('mon');
    expect(parts.hour).toBe(17);
  });

  it('falls back to UTC for an unknown timezone instead of throwing', () => {
    const parts = zonedParts(new Date('2026-06-15T12:00:00Z'), 'Not/AZone');
    expect(parts.hour).toBe(12);
    expect(parts.day).toBe('mon');
  });

  it('handles midnight without reporting hour 24', () => {
    const parts = zonedParts(new Date('2026-06-15T00:30:00Z'), 'UTC');
    expect(parts.hour).toBe(0);
    expect(parts.minutes).toBe(30);
  });
});
