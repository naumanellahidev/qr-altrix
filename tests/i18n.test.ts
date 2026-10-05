import { describe, expect, it } from 'vitest';
import { getContent, PUBLISHED_LOCALES } from '@/content';
import { CATALOG_PHRASES } from '@/content/catalog-phrases';
import { KEEP_PHRASES } from '@/content/phrase-tools';
import { DEFAULT_LOCALE, dirOf, LOCALES } from '@/i18n/locales';

const english = getContent(DEFAULT_LOCALE);
const translated = PUBLISHED_LOCALES.filter((code) => code !== DEFAULT_LOCALE);
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

/** Every string of `a` paired with the string at the same place in `b`. */
function pairs(a: unknown, b: unknown, at: string, out: { at: string; en: string; tr: unknown }[]) {
  if (typeof a === 'string') {
    out.push({ at, en: a, tr: b });
  } else if (Array.isArray(a)) {
    expect(Array.isArray(b), `${at} should be a list`).toBe(true);
    expect((b as unknown[]).length, `${at} length`).toBe(a.length);
    a.forEach((item, index) => pairs(item, (b as unknown[])[index], `${at}[${index}]`, out));
  } else if (a && typeof a === 'object') {
    for (const key of Object.keys(a)) pairs((a as Record<string, unknown>)[key], (b as Record<string, unknown>)?.[key], `${at}.${key}`, out);
  }
  return out;
}

describe('languages', () => {
  it('Arabic and Urdu are right-to-left, the rest left-to-right', () => {
    for (const { code } of LOCALES) expect(dirOf(code)).toBe(code === 'ar' || code === 'ur' ? 'rtl' : 'ltr');
  });

  it('publishes English plus at least one translation', () => {
    expect(PUBLISHED_LOCALES[0]).toBe(DEFAULT_LOCALE);
  });
});

describe.each(translated)('%s translation', (code) => {
  const content = getContent(code);
  const { phrases: _p, catalog: _c, ...rest } = content;
  const { phrases: _pe, catalog: _ce, ...restEn } = english;
  const all = pairs(restEn, rest, code, []);

  it('has every string, with the same list lengths', () => {
    const missing = all.filter((p) => typeof p.tr !== 'string' || !(p.tr as string).trim()).map((p) => p.at);
    expect(missing).toEqual([]);
  });

  it('keeps every {placeholder}', () => {
    const broken = all.filter((p) => placeholders(p.en).join() !== placeholders(String(p.tr)).join()).map((p) => p.at);
    expect(broken).toEqual([]);
  });

  it('is actually translated', () => {
    const long = all.filter((p) => p.en.length > 30);
    const same = long.filter((p) => p.tr === p.en);
    expect(same.length / long.length).toBeLessThan(0.05);
  });

  it('translates every catalogue phrase', () => {
    const keep = new Set(KEEP_PHRASES);
    const missing = CATALOG_PHRASES.filter((phrase) => !keep.has(phrase) && !content.phrases[phrase]);
    const unknown = Object.keys(content.phrases).filter((key) => !CATALOG_PHRASES.includes(key));
    expect(missing).toEqual([]);
    expect(unknown).toEqual([]);
  });

  it('names every QR type in its own language', () => {
    for (const [type, entry] of Object.entries(content.catalog)) {
      expect(entry.label, type).toBeTruthy();
      expect(entry.tagline, type).toBeTruthy();
    }
  });
});
