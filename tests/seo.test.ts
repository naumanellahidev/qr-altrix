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
      expect(source, `${route.path} should declare canonical('${route.path}')`).toContain(`canonical('${route.path}')`);
    }
  });

  it('keeps sign-in and account pages out', () => {
    const urls = entries.map((entry) => new URL(entry.url).pathname);
    for (const hidden of ['/login', '/forgot-password', '/reset-password', '/verify-email', '/dashboard', '/admin']) {
      expect(urls).not.toContain(hidden);
    }
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

  it('lets crawlers fetch scripts and styles, and points at the sitemap', () => {
    expect(disallow.some((prefix) => '/_next/static/x.js'.startsWith(prefix))).toBe(false);
    expect(rules.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});
