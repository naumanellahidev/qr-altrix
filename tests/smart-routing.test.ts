import { describe, expect, it } from 'vitest';
import { applyUtm, pickAppStoreUrl, pickDestination, type DestinationRule } from '@/lib/routing/evaluate';

const DEFAULT_RULE: DestinationRule = { kind: 'DEFAULT', url: 'https://example.com/default', priority: 0 };

describe('pickDestination', () => {
  it('falls back to the default when no rule matches', () => {
    const rules: DestinationRule[] = [
      DEFAULT_RULE,
      { kind: 'COUNTRY', matchValue: 'DE', url: 'https://example.com/de', priority: 1 },
    ];
    expect(pickDestination(rules, { country: 'PK' })).toBe('https://example.com/default');
  });

  it('returns null when there is no default and nothing matches', () => {
    expect(pickDestination([{ kind: 'COUNTRY', matchValue: 'DE', url: 'https://x.test', priority: 1 }], {})).toBeNull();
  });

  it('matches a single country code', () => {
    const rules = [DEFAULT_RULE, { kind: 'COUNTRY' as const, matchValue: 'PK', url: 'https://example.com/pk', priority: 1 }];
    expect(pickDestination(rules, { country: 'PK' })).toBe('https://example.com/pk');
  });

  it('matches a comma-separated country list, case-insensitively', () => {
    const rules = [DEFAULT_RULE, { kind: 'COUNTRY' as const, matchValue: 'ae, sa , qa', url: 'https://example.com/gulf', priority: 1 }];
    expect(pickDestination(rules, { country: 'SA' })).toBe('https://example.com/gulf');
  });

  it('matches a language prefix but not the other way round', () => {
    const rules = [DEFAULT_RULE, { kind: 'LANGUAGE' as const, matchValue: 'en', url: 'https://example.com/en', priority: 1 }];
    expect(pickDestination(rules, { language: 'en-GB' })).toBe('https://example.com/en');

    const strict = [DEFAULT_RULE, { kind: 'LANGUAGE' as const, matchValue: 'en-GB', url: 'https://example.com/gb', priority: 1 }];
    expect(pickDestination(strict, { language: 'en' })).toBe('https://example.com/default');
  });

  it('treats a tablet as mobile when the rule says mobile', () => {
    const rules = [DEFAULT_RULE, { kind: 'DEVICE' as const, matchValue: 'mobile', url: 'https://example.com/m', priority: 1 }];
    expect(pickDestination(rules, { deviceType: 'tablet' })).toBe('https://example.com/m');
    expect(pickDestination(rules, { deviceType: 'desktop' })).toBe('https://example.com/default');
  });

  it('prefers a device rule over a country rule', () => {
    const rules: DestinationRule[] = [
      DEFAULT_RULE,
      { kind: 'COUNTRY', matchValue: 'PK', url: 'https://example.com/pk', priority: 1 },
      { kind: 'DEVICE', matchValue: 'desktop', url: 'https://example.com/desktop', priority: 1 },
    ];
    expect(pickDestination(rules, { country: 'PK', deviceType: 'desktop' })).toBe('https://example.com/desktop');
  });

  it('honours priority order inside a rule kind', () => {
    const rules: DestinationRule[] = [
      DEFAULT_RULE,
      { kind: 'COUNTRY', matchValue: 'PK', url: 'https://example.com/second', priority: 5 },
      { kind: 'COUNTRY', matchValue: 'PK', url: 'https://example.com/first', priority: 1 },
    ];
    expect(pickDestination(rules, { country: 'PK' })).toBe('https://example.com/first');
  });

  it('matches a time rule with days and a window', () => {
    const rules: DestinationRule[] = [
      DEFAULT_RULE,
      { kind: 'TIME', matchValue: 'mon,tue 09:00-17:00', url: 'https://example.com/office', priority: 1 },
    ];
    // Monday 2026-06-15, 12:00 UTC
    const inHours = pickDestination(rules, { now: new Date('2026-06-15T12:00:00Z'), timeZone: 'UTC' });
    expect(inHours).toBe('https://example.com/office');

    const outOfHours = pickDestination(rules, { now: new Date('2026-06-15T22:00:00Z'), timeZone: 'UTC' });
    expect(outOfHours).toBe('https://example.com/default');
  });

  it('ignores rules with an empty match value', () => {
    const rules: DestinationRule[] = [DEFAULT_RULE, { kind: 'COUNTRY', matchValue: '  ', url: 'https://bad.test', priority: 1 }];
    expect(pickDestination(rules, { country: 'PK' })).toBe('https://example.com/default');
  });
});

describe('applyUtm', () => {
  it('adds the owner parameters', () => {
    const url = applyUtm('https://example.com/page', {
      source: 'poster',
      medium: 'print',
      campaign: 'spring-2026',
    });
    expect(url).toContain('utm_source=poster');
    expect(url).toContain('utm_medium=print');
    expect(url).toContain('utm_campaign=spring-2026');
  });

  it('keeps existing query parameters', () => {
    const url = applyUtm('https://example.com/page?ref=abc', { source: 'poster' });
    expect(url).toContain('ref=abc');
    expect(url).toContain('utm_source=poster');
  });

  it('adds custom parameters', () => {
    const url = applyUtm('https://example.com/p', { custom: [{ key: 'branch', value: 'lahore-01' }] });
    expect(url).toContain('branch=lahore-01');
  });

  it('returns the url untouched when there is no configuration', () => {
    expect(applyUtm('https://example.com/p', null)).toBe('https://example.com/p');
    expect(applyUtm('https://example.com/p', {})).toBe('https://example.com/p');
  });
});

describe('pickAppStoreUrl', () => {
  const content = {
    iosUrl: 'https://apps.apple.com/app/id1',
    androidUrl: 'https://play.google.com/store/apps/details?id=x',
    otherUrl: 'https://example.com/download',
  };

  it('sends iPhones to the App Store', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15';
    expect(pickAppStoreUrl(content, ua)).toBe(content.iosUrl);
  });

  it('sends Android phones to Play', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/131';
    expect(pickAppStoreUrl(content, ua)).toBe(content.androidUrl);
  });

  it('sends desktops to the fallback', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131';
    expect(pickAppStoreUrl(content, ua)).toBe(content.otherUrl);
  });

  it('uses whatever link exists when the preferred one is missing', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)';
    expect(pickAppStoreUrl({ iosUrl: null, androidUrl: content.androidUrl, otherUrl: null }, ua)).toBe(
      content.androidUrl,
    );
  });

  it('returns null when nothing is configured', () => {
    expect(pickAppStoreUrl({}, 'anything')).toBeNull();
  });
});
