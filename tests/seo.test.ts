import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { ENGLISH_ROUTES, localizedRoutes } from '@/lib/seo/routes';
import { PUBLISHED_LOCALES } from '@/content';
import { DEFAULT_LOCALE, localePath } from '@/i18n/locales';

const APP_DIR = path.resolve(__dirname, '../src/app');

/**
 * The page file that serves a path, allowing for (group) folders and [param] segments.
 * `allowLocale` lets the first segment match the [locale] folder.
 */
function pageFileFor(route: string, allowLocale = false): string | null {
  const parts = route.split('/').filter(Boolean);
  function walk(dir: string, rest: string[], depth: number): string | null {
    if (rest.length === 0) {
      const file = path.join(dir, 'page.tsx');
      if (fs.existsSync(file)) return file;
    }
    if (!fs.existsSync(dir)) return null;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const full = path.join(dir, entry.name);
      if (entry.name.startsWith('(')) {
        const found = walk(full, rest, depth);
        if (found) return found;
        continue;
      }
      if (rest.length === 0) continue;
      const isLocaleDir = entry.name === '[locale]';
      const matches =
        entry.name === rest[0] ||
        (isLocaleDir && allowLocale && depth === 0) ||
        (!isLocaleDir && entry.name.startsWith('['));
      if (matches) {
        const found = walk(full, rest.slice(1), depth + 1);
        if (found) return found;
      }
    }
    return null;
  }
  return walk(APP_DIR, parts, 0);
}

describe('sitemap', () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);

  it('lists every page once per published language, with no duplicates', () => {
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toHaveLength(localizedRoutes().length * PUBLISHED_LOCALES.length + ENGLISH_ROUTES.length);
  });

  it('points only at pages that exist, in English and under a language prefix', () => {
    for (const route of [...localizedRoutes(), ...ENGLISH_ROUTES]) {
      expect(pageFileFor(route.path), `no page file for ${route.path}`).not.toBeNull();
    }
    for (const route of localizedRoutes()) {
      const prefixed = route.path === '/' ? '/xx' : `/xx${route.path}`;
      expect(pageFileFor(prefixed, true), `no [locale] page for ${route.path}`).not.toBeNull();
    }
  });

  it('uses real, stable content dates — not the time of the request', () => {
    const tomorrow = Date.now() + 864e5;
    for (const entry of entries) {
      const date = new Date(entry.lastModified as Date);
      expect(Number.isNaN(date.getTime())).toBe(false);
      expect(date.getTime()).toBeLessThanOrEqual(tomorrow);
      expect(date.toISOString().endsWith('T00:00:00.000Z')).toBe(true);
    }
    expect(JSON.stringify(sitemap())).toBe(JSON.stringify(entries));
  });

  it('gives each translated entry reciprocal language alternates and an English x-default', () => {
    if (PUBLISHED_LOCALES.length < 2) return;
    for (const entry of entries.filter((e) => e.alternates)) {
      const languages = entry.alternates!.languages as Record<string, string>;
      expect(Object.keys(languages).sort()).toEqual([...PUBLISHED_LOCALES, 'x-default'].sort());
      expect(Object.values(languages)).toContain(entry.url);
      expect(languages['x-default']).toBe(languages[DEFAULT_LOCALE]);
    }
  });

  it('keeps sign-in and account pages out', () => {
    const paths = urls.map((url) => new URL(url).pathname);
    for (const hidden of ['/login', '/forgot-password', '/reset-password', '/verify-email', '/dashboard', '/admin']) {
      expect(paths).not.toContain(hidden);
    }
  });
});

describe('automatic sitemap coverage', () => {
  // Any static, public page that can be indexed must be in the registry — otherwise it
  // would silently miss the sitemap and its canonical. This finds them on its own.
  const PRIVATE_DIRS = ['api', 'dashboard', 'admin', 'l', 'p', 'q', 'r', 'inactive', 'invite'];

  function publicPages(dir: string, prefix = ''): string[] {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const name = entry.name;
      if (name.startsWith('[') || name.startsWith('_') || name.includes('.')) continue;
      const segment = name.startsWith('(') ? '' : `/${name}`;
      if (!prefix && PRIVATE_DIRS.includes(name)) continue;
      const full = path.join(dir, name);
      const page = path.join(full, 'page.tsx');
      if (fs.existsSync(page)) {
        const source = fs.readFileSync(page, 'utf8');
        if (!/index:\s*false/.test(source)) out.push(`${prefix}${segment}` || '/');
      }
      out.push(...publicPages(full, `${prefix}${segment}`));
    }
    return out;
  }

  it('lists every indexable page the app serves', () => {
    const found = ['/', ...publicPages(APP_DIR)];
    const listed = [...localizedRoutes(), ...ENGLISH_ROUTES].map((route) => route.path);
    const missing = [...new Set(found)].filter((page) => !listed.includes(page));
    expect(missing, `add these to lib/seo/routes.ts (or mark them noindex): ${missing.join(', ')}`).toEqual([]);
  });
});

describe('robots.txt', () => {
  const rules = robots();
  const disallow = [rules.rules].flat().flatMap((rule) => [rule.disallow ?? []].flat());

  it('never blocks a page the sitemap lists', () => {
    for (const route of [...localizedRoutes(), ...ENGLISH_ROUTES]) {
      for (const locale of PUBLISHED_LOCALES) {
        const p = localePath(locale, route.path);
        const blocked = disallow.filter((prefix) => p.startsWith(prefix));
        expect(blocked, `${p} is blocked by ${blocked.join(', ')}`).toEqual([]);
      }
    }
  });

  it('welcomes AI crawlers but keeps them out of private paths', () => {
    const groups = [rules.rules].flat();
    const ai = groups.find((group) => [group.userAgent].flat().includes('GPTBot'));
    expect(ai).toBeDefined();
    expect([ai!.userAgent].flat()).toEqual(expect.arrayContaining(['ClaudeBot', 'PerplexityBot', 'Google-Extended']));
    expect([ai!.disallow].flat()).toEqual(expect.arrayContaining(['/dashboard', '/api/', '/admin']));
  });

  it('lets crawlers fetch scripts and styles, and points at the sitemap', () => {
    expect(disallow.some((prefix) => '/_next/static/x.js'.startsWith(prefix))).toBe(false);
    expect(rules.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});

const FACTS = {
  baseUrl: 'https://qr.altrixcore.com',
  expiryEnabled: false,
  brandingEnabled: true,
  guestStaticDownload: true,
  bulkMaxRows: 20000,
  apiRateLimitPerMin: 120,
  maxUploadMb: 15,
  languages: ['en'],
};

describe('llms.txt', () => {
  it('follows the llmstxt.org shape and links the main pages', async () => {
    const { buildLlmsTxt } = await import('@/lib/seo/llms');
    const text = buildLlmsTxt(FACTS);
    expect(text.startsWith('# QR ALTRIX\n\n> ')).toBe(true);
    for (const p of ['/', '/qr-code-generator', '/use-cases', '/guides', '/developers', '/legal/privacy']) {
      expect(text).toContain(p === '/' ? 'https://qr.altrixcore.com/)' : `https://qr.altrixcore.com${p})`);
    }
    expect(text).toContain('never expire');
    expect(text).toContain('/llms-full.txt');
  });

  it('never claims "never expire" when the operator has switched expiry on', async () => {
    const { buildLlmsTxt, buildLlmsFullTxt } = await import('@/lib/seo/llms');
    const on = { ...FACTS, expiryEnabled: true };
    expect(buildLlmsTxt(on)).not.toMatch(/never expire/i);
    // Linked page descriptions are quoted from those pages; check the briefing's own words.
    expect(buildLlmsFullTxt(on).replace(/^- \[.*$/gm, '')).not.toMatch(/never expire/i);
  });

  it('lists every QR type and every type page in the full briefing', async () => {
    const { buildLlmsFullTxt } = await import('@/lib/seo/llms');
    const { QR_TYPES } = await import('@/lib/qr/catalog');
    const { TYPE_KEYS, TYPE_SLUGS } = await import('@/content/registry');
    const text = buildLlmsFullTxt(FACTS);
    for (const type of QR_TYPES) expect(text).toContain(`- ${type.label} (`);
    for (const key of TYPE_KEYS) expect(text).toContain(`/qr-code-generator/${TYPE_SLUGS[key]})`);
  });
});

describe('homepage FAQ and structured data', () => {
  it('only promises sign-up-free downloads when guests may download', async () => {
    const { homeFaqs } = await import('@/lib/seo/faq');
    const { buildLlmsTxt } = await import('@/lib/seo/llms');
    const closed = homeFaqs({ expiryEnabled: false, guestStaticDownload: false });
    expect(closed.find((f) => f.q.startsWith('Do I need an account'))!.a).toMatch(/needed to download/);
    expect(buildLlmsTxt({ ...FACTS, guestStaticDownload: false })).not.toMatch(/no sign-up/i);
  });

  it('builds valid FAQPage and WebApplication JSON-LD from the same items the page shows', async () => {
    const { homeFaqs } = await import('@/lib/seo/faq');
    const { applicationSchema, faqSchema, graph } = await import('@/lib/seo/schema');
    const items = homeFaqs({ expiryEnabled: false, guestStaticDownload: true });
    const data = JSON.parse(JSON.stringify(graph(faqSchema('https://x.test', items), applicationSchema('https://x.test', { expiryEnabled: false }))));
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@graph'][0].mainEntity).toHaveLength(items.length);
    expect(data['@graph'][1].offers.price).toBe('0');
    expect(data['@graph'][1].aggregateRating).toBeUndefined();
  });
});
