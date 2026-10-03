import { describe, expect, it } from 'vitest';
import {
  designSchema, domainSchema, inviteSchema, signupSchema, slugSchema, validateContentForType,
} from '@/lib/validation';

describe('signup', () => {
  it('accepts a sensible signup', () => {
    const result = signupSchema.safeParse({
      email: ' Person@Example.COM ',
      password: 'altrix1234',
      acceptTerms: true,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('person@example.com');
  });

  it('rejects a short password', () => {
    const result = signupSchema.safeParse({ email: 'a@b.co', password: 'short1', acceptTerms: true });
    expect(result.success).toBe(false);
  });

  it('rejects a password with no number', () => {
    const result = signupSchema.safeParse({ email: 'a@b.co', password: 'onlyletters', acceptTerms: true });
    expect(result.success).toBe(false);
  });

  it('requires the terms checkbox', () => {
    const result = signupSchema.safeParse({ email: 'a@b.co', password: 'altrix1234', acceptTerms: false });
    expect(result.success).toBe(false);
  });
});

describe('design schema', () => {
  it('fills in defaults for an empty object', () => {
    const design = designSchema.parse({});
    expect(design.bodyShape).toBe('rounded');
    expect(design.errorCorrection).toBe('M');
    expect(design.margin).toBe(4);
  });

  it('rejects a colour that is not hex', () => {
    expect(designSchema.safeParse({ fgColor: 'red' }).success).toBe(false);
    expect(designSchema.safeParse({ fgColor: '#ABC' }).success).toBe(true);
  });

  it('clamps nothing silently: an out-of-range logo size is rejected', () => {
    expect(designSchema.safeParse({ logoSize: 80 }).success).toBe(false);
  });
});

describe('slug and domain', () => {
  it('accepts a normal slug', () => {
    expect(slugSchema.safeParse('spring-sale_2026').success).toBe(true);
  });

  it('rejects slugs with slashes or spaces', () => {
    expect(slugSchema.safeParse('spring sale').success).toBe(false);
    expect(slugSchema.safeParse('a/b').success).toBe(false);
  });

  it('accepts a subdomain and strips case', () => {
    const result = domainSchema.safeParse({ host: 'Links.Example.COM' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.host).toBe('links.example.com');
  });

  it('rejects a URL rather than a host', () => {
    expect(domainSchema.safeParse({ host: 'https://links.example.com/path' }).success).toBe(false);
  });
});

describe('invitations', () => {
  it('does not allow inviting a second owner', () => {
    expect(inviteSchema.safeParse({ email: 'a@b.co', role: 'OWNER' }).success).toBe(false);
    expect(inviteSchema.safeParse({ email: 'a@b.co', role: 'EDITOR' }).success).toBe(true);
  });
});

describe('validateContentForType', () => {
  it('requires the fields the catalogue marks required', () => {
    const result = validateContentForType('WEBSITE', {});
    expect(result.ok).toBe(false);
    expect(result.errors.url).toContain('required');
  });

  it('normalises a bare domain to https', () => {
    const result = validateContentForType('WEBSITE', { url: 'example.com/offer' });
    expect(result.ok).toBe(true);
    expect(result.content.url).toBe('https://example.com/offer');
  });

  it('keeps a non-http scheme out', () => {
    const result = validateContentForType('WEBSITE', { url: 'javascript:alert(1)' });
    expect(result.ok).toBe(false);
  });

  it('coerces switches to booleans and keeps defaults', () => {
    const result = validateContentForType('WIFI', { ssid: 'Net', password: 'pw', hidden: 'yes' });
    expect(result.content.hidden).toBe(true);
    expect(result.content.encryption).toBe('WPA');
  });

  it('validates an email field', () => {
    expect(validateContentForType('EMAIL', { to: 'nope' }).ok).toBe(false);
    expect(validateContentForType('EMAIL', { to: 'a@b.co' }).ok).toBe(true);
  });

  it('keeps repeater rows and drops the empty ones', () => {
    const result = validateContentForType('LINK_LIST', {
      title: 'Links',
      links: [{ label: 'A', url: 'a.test' }, {}, { label: '', url: '' }],
    });
    expect(result.ok).toBe(true);
    expect(result.content.links).toHaveLength(1);
    expect((result.content.links as { url: string }[])[0].url).toBe('https://a.test');
  });

  it('requires at least one row in a required repeater', () => {
    const result = validateContentForType('LINK_LIST', { title: 'Links', links: [] });
    expect(result.ok).toBe(false);
    expect(result.errors.links).toBeTruthy();
  });

  it('requires a video link or an upload', () => {
    expect(validateContentForType('VIDEO', { title: 'Clip' }).ok).toBe(false);
    expect(validateContentForType('VIDEO', { title: 'Clip', videoUrl: 'https://v.test/a.mp4' }).ok).toBe(true);
  });

  it('requires at least one app store link', () => {
    expect(validateContentForType('APP_STORE', { appName: 'App' }).ok).toBe(false);
    expect(
      validateContentForType('APP_STORE', { appName: 'App', androidUrl: 'https://play.test/x' }).ok,
    ).toBe(true);
  });

  it('requires coordinates or a search query for a location', () => {
    expect(validateContentForType('LOCATION', {}).ok).toBe(false);
    expect(validateContentForType('LOCATION', { query: 'Mall Road' }).ok).toBe(true);
    expect(validateContentForType('LOCATION', { latitude: '31.5', longitude: '74.3' }).ok).toBe(true);
  });

  it('rejects an unknown type', () => {
    expect(validateContentForType('NOPE', {}).ok).toBe(false);
  });

  it('ignores unexpected extra keys instead of storing them', () => {
    const result = validateContentForType('WEBSITE', { url: 'https://a.test', evil: '<script>' });
    expect(result.content).not.toHaveProperty('evil');
  });
});

describe('builder payloads', () => {
  // The builder sends explicit nulls for "nothing set" (no UTMs, no folder, no slug).
  // A schema that only accepts undefined rejects the whole save with "Expected object,
  // received null" — which is exactly what users hit on a plain static code.
  it('accepts what the builder sends for a static code with nothing optional filled in', async () => {
    const { qrCreateSchema } = await import('@/lib/validation');
    const { DEFAULT_DESIGN } = await import('@/lib/qr/types');
    const body = {
      name: 'Plain text code',
      kind: 'STATIC',
      type: 'TEXT',
      content: { text: 'hello' },
      design: DEFAULT_DESIGN,
      folderId: null,
      customDomainId: null,
      slug: null,
      utm: null,
      smartRules: undefined,
      gates: {
        password: null,
        scheduleEnabled: false,
        scheduleStart: null,
        scheduleEnd: null,
        scanLimitEnabled: false,
        scanLimitMax: null,
      },
    };
    const result = qrCreateSchema.safeParse(body);
    expect(result.success ? 'ok' : result.error.issues).toBe('ok');
  });

  it('accepts the same shape as an edit, where null utm clears the parameters', async () => {
    const { qrUpdateSchema } = await import('@/lib/validation');
    const result = qrUpdateSchema.safeParse({ utm: null, folderId: null, slug: null });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.utm).toBeNull();
  });
});
