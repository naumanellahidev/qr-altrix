import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { PUBLIC_ROUTES } from '@/lib/seo/routes';

/** The page file that serves a public path, allowing for (group) folders. */
function pageFileFor(route: string): string | null {
  const appDir = path.resolve(__dirname, '../src/app');
  const parts = route.split('/').filter(Boolean);
  const candidates = [path.join(appDir, ...parts, 'page.tsx')];
  for (const entry of fs.readdirSync(appDir)) {
    if (entry.startsWith('(')) candidates.push(path.join(appDir, entry, ...parts, 'page.tsx'));
  }
  return candidates.find((file) => fs.existsSync(file)) ?? null;
}

describe('sitemap', () => {
  const entries = sitemap();

  it('lists every public route exactly once', () => {
    const urls = entries.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toHaveLength(PUBLIC_ROUTES.length);
  });

  it('points only at pages that exist', () => {
    for (const route of PUBLIC_ROUTES) {
      expect(pageFileFor(route.path), `no page file for ${route.path}`).not.toBeNull();
    }
  });

  it('uses real, stable content dates — not the time of the request', () => {
    const today = Date.now() + 864e5;
    for (const entry of entries) {
      const date = new Date(entry.lastModified as Date);
      expect(Number.isNaN(date.getTime())).toBe(false);
      expect(date.getTime()).toBeLessThanOrEqual(today);
      expect(date.toISOString().endsWith('T00:00:00.000Z')).toBe(true);
    }
    // Two calls agree: lastmod must not drift between crawls.
    expect(JSON.stringify(sitemap())).toBe(JSON.stringify(entries));
  });

  it('gives each page a canonical that matches its sitemap URL', () => {
    for (const route of PUBLIC_ROUTES) {
      const source = fs.readFileSync(pageFileFor(route.path)!, 'utf8');
      const declares =
        source.includes(`canonical('${route.path}')`) ||
        source.includes(`path: '${route.path}'`) ||
        (route.path === '/' && source.includes('homeMeta('));
      expect(declares, `${route.path} should set its canonical via pageMeta/canonical`).toBe(true);
    }
  });

  it('keeps sign-in and account pages out', () => {
    const urls = entries.map((entry) => new URL(entry.url).pathname);
    for (const hidden of ['/login', '/forgot-password', '/reset-password', '/verify-email', '/dashboard', '/admin']) {
      expect(urls).not.toContain(hidden);
    }
  });
});

describe('automatic sitemap coverage', () => {
  // Any static, public page that can be indexed must be in PUBLIC_ROUTES — otherwise it
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
    const appDir = path.resolve(__dirname, '../src/app');
    const found = ['/', ...publicPages(appDir)];
    const listed = PUBLIC_ROUTES.map((route) => route.path as string);
    const missing = [...new Set(found)].filter((page) => !listed.includes(page));
    expect(missing, `add these to lib/seo/routes.ts (or mark them noindex): ${missing.join(', ')}`).toEqual([]);
  });
});

describe('robots.txt', () => {
  const rules = robots();
  const disallow = [rules.rules].flat().flatMap((rule) => [rule.disallow ?? []].flat());

  it('never blocks a page the sitemap lists', () => {
    for (const route of PUBLIC_ROUTES) {
      const blocked = disallow.filter((prefix) => route.path.startsWith(prefix));
      expect(blocked, `${route.path} is blocked by ${blocked.join(', ')}`).toEqual([]);
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

describe('llms.txt', () => {
  const facts = {
    baseUrl: 'https://qr.altrixcore.com',
    expiryEnabled: false,
    brandingEnabled: true,
    guestStaticDownload: true,
    bulkMaxRows: 20000,
    apiRateLimitPerMin: 120,
    maxUploadMb: 15,
  };

  it('follows the llmstxt.org shape and links every public page', async () => {
    const { buildLlmsTxt } = await import('@/lib/seo/llms');
    const text = buildLlmsTxt(facts);
    expect(text.startsWith('# QR ALTRIX\n\n> ')).toBe(true);
    for (const route of PUBLIC_ROUTES) {
      expect(text).toContain(route.path === '/' ? 'https://qr.altrixcore.com/)' : `https://qr.altrixcore.com${route.path})`);
    }
    expect(text).toContain('never expire');
    expect(text).toContain('/llms-full.txt');
  });

  it('never claims "never expire" when the operator has switched expiry on', async () => {
    const { buildLlmsTxt, buildLlmsFullTxt } = await import('@/lib/seo/llms');
    const on = { ...facts, expiryEnabled: true };
    expect(buildLlmsTxt(on)).not.toMatch(/never expire/i);
    expect(buildLlmsFullTxt(on)).not.toMatch(/never expire/i);
  });

  it('lists every QR type in the full briefing', async () => {
    const { buildLlmsFullTxt } = await import('@/lib/seo/llms');
    const { QR_TYPES } = await import('@/lib/qr/catalog');
    const text = buildLlmsFullTxt(facts);
    for (const type of QR_TYPES) expect(text).toContain(`- ${type.label} (`);
  });
});

describe('homepage FAQ and structured data', () => {
  it('only promises sign-up-free downloads when guests may download', async () => {
    const { homeFaqs } = await import('@/lib/seo/faq');
    const { buildLlmsTxt } = await import('@/lib/seo/llms');
    const closed = homeFaqs({ expiryEnabled: false, guestStaticDownload: false });
    expect(closed.find((f) => f.q.startsWith('Do I need an account'))!.a).toMatch(/needed to download/);
    const facts = { baseUrl: 'https://x.test', expiryEnabled: false, brandingEnabled: true, guestStaticDownload: false, bulkMaxRows: 1, apiRateLimitPerMin: 1, maxUploadMb: 1 };
    expect(buildLlmsTxt(facts)).not.toMatch(/no sign-up/i);
  });

  it('builds valid FAQPage and WebApplication JSON-LD from the same items the page shows', async () => {
    const { homeFaqs } = await import('@/lib/seo/faq');
    const { applicationSchema, faqSchema, graph } = await import('@/lib/seo/schema');
    const items = homeFaqs({ expiryEnabled: false, guestStaticDownload: true });
    const data = JSON.parse(JSON.stringify(graph(faqSchema('https://x.test', items), applicationSchema('https://x.test', { expiryEnabled: false }))));
    expect(data['@context']).toBe('https://schema.org');
    const faq = data['@graph'][0];
    expect(faq.mainEntity).toHaveLength(items.length);
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe(items[0].a);
    const app = data['@graph'][1];
    expect(app.offers.price).toBe('0');
    expect(app.aggregateRating).toBeUndefined(); // never invent ratings
  });
});
