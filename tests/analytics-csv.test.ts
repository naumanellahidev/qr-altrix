import { describe, expect, it } from 'vitest';
import { rowsToCsv } from '@/lib/analytics';

describe('CSV export', () => {
  it('writes a header row and quotes every cell, doubling embedded quotes', () => {
    const csv = rowsToCsv([{ name: 'Menu "spring"', city: 'Lahore, PK' }]);
    expect(csv.split('\n')).toEqual(['name,city', '"Menu ""spring""","Lahore, PK"']);
  });

  it('keeps cells that look like spreadsheet formulas as plain text', () => {
    const csv = rowsToCsv([{ a: '=HYPERLINK("http://x")', b: '+1', c: '-2', d: '@SUM(A1)', e: 'safe' }]);
    expect(csv.split('\n')[1]).toBe(`"'=HYPERLINK(""http://x"")","'+1","'-2","'@SUM(A1)","safe"`);
  });

  it('returns nothing for no rows', () => {
    expect(rowsToCsv([])).toBe('');
  });
});
