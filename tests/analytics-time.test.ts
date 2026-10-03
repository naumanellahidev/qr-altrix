import { describe, expect, it } from 'vitest';
import { densifySeries, safeTimezone, toWallClock } from '@/lib/analytics';

describe('analytics time zones', () => {
  it('converts an instant to wall-clock time in the chosen zone', () => {
    const instant = new Date('2026-10-03T20:30:00Z');
    expect(toWallClock(instant, 'UTC').toISOString()).toBe('2026-10-03T20:30:00.000Z');
    // Karachi is UTC+5: half past eight in the evening UTC is half past one next morning.
    expect(toWallClock(instant, 'Asia/Karachi').toISOString()).toBe('2026-10-04T01:30:00.000Z');
    // Half-hour offsets survive too.
    expect(toWallClock(instant, 'Asia/Kolkata').toISOString()).toBe('2026-10-04T02:00:00.000Z');
  });

  it('falls back to UTC for zones the runtime does not know', () => {
    expect(safeTimezone('Asia/Karachi')).toBe('Asia/Karachi');
    expect(safeTimezone('Not/AZone')).toBe('UTC');
    expect(safeTimezone("UTC'; DROP TABLE x")).toBe('UTC');
    expect(safeTimezone(undefined)).toBe('UTC');
  });

  it('puts database buckets on the same grid as the filled-in gaps', () => {
    // A day range seen from Karachi; the database returned one wall-clock bucket.
    const range = { from: new Date('2026-10-01T19:00:00Z'), to: new Date('2026-10-04T18:59:59Z') };
    const series = densifySeries([{ bucket: '2026-10-03T00:00:00.000Z', scans: 4, unique: 3 }], range, 'day', 'Asia/Karachi');
    expect(series.map((p) => p.bucket.slice(0, 10))).toEqual(['2026-10-02', '2026-10-03', '2026-10-04']);
    expect(series.find((p) => p.bucket.startsWith('2026-10-03'))?.scans).toBe(4);
    expect(new Set(series.map((p) => p.bucket)).size).toBe(series.length);
  });

  it('aligns weeks to Monday the way date_trunc does', () => {
    // 2026-10-01 is a Thursday; its week starts Monday 2026-09-28.
    const range = { from: new Date('2026-10-01T00:00:00Z'), to: new Date('2026-10-20T00:00:00Z') };
    const series = densifySeries([{ bucket: '2026-10-05T00:00:00.000Z', scans: 2, unique: 2 }], range, 'week');
    expect(series[0].bucket).toBe('2026-09-28T00:00:00.000Z');
    expect(series.filter((p) => p.scans > 0)).toHaveLength(1);
    expect(new Set(series.map((p) => p.bucket)).size).toBe(series.length);
  });
});
