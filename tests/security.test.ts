import { describe, expect, it, beforeEach } from 'vitest';
import { hashPassword, hashToken, hashIp, verifyPassword, visitorFingerprint, safeCompare } from '@/lib/hash';
import { base32Decode, generateRecoveryCodes, generateTotpSecret, totpCode, totpUri, verifyTotp } from '@/lib/totp';
import { apiKeyGrants, parseApiKey } from '@/lib/api/actor';
import { signWebhookPayload } from '@/lib/jobs/webhook';
import { rateLimit, resetRateLimitMemory } from '@/lib/rate-limit';
import { isSafeKey, sanitizeSvg, validateUpload, buildStorageKey } from '@/lib/storage';

describe('passwords', () => {
  it('hashes and verifies', async () => {
    const hash = await hashPassword('altrix1234');
    expect(hash).not.toContain('altrix1234');
    expect(await verifyPassword('altrix1234', hash)).toBe(true);
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('treats a missing hash as a failure rather than a pass', async () => {
    expect(await verifyPassword('anything', null)).toBe(false);
    expect(await verifyPassword('anything', '')).toBe(false);
  });

  it('never returns the same hash twice for the same password', async () => {
    const [a, b] = await Promise.all([hashPassword('same-password1'), hashPassword('same-password1')]);
    expect(a).not.toBe(b);
  });
});

describe('tokens and fingerprints', () => {
  it('hashes tokens deterministically and irreversibly', () => {
    const hash = hashToken('reset-token-value');
    expect(hash).toHaveLength(64);
    expect(hash).toBe(hashToken('reset-token-value'));
    expect(hash).not.toContain('reset-token-value');
  });

  it('hashes IP addresses to a short, stable, non-reversible value', () => {
    const hash = hashIp('203.0.113.7');
    expect(hash).toHaveLength(40);
    expect(hash).not.toContain('203.0.113');
    expect(hashIp('203.0.113.7')).toBe(hash);
    expect(hashIp('203.0.113.8')).not.toBe(hash);
  });

  it('returns null for a missing IP', () => {
    expect(hashIp(null)).toBeNull();
    expect(hashIp(undefined)).toBeNull();
  });

  it('separates visitors per QR code so one scan cannot be linked across codes', () => {
    const a = visitorFingerprint(['hashed-ip', 'ua', 'qr-1']);
    const b = visitorFingerprint(['hashed-ip', 'ua', 'qr-2']);
    expect(a).not.toBe(b);
  });

  it('compares strings without leaking length-independent timing', () => {
    expect(safeCompare('abc', 'abc')).toBe(true);
    expect(safeCompare('abc', 'abd')).toBe(false);
    expect(safeCompare('abc', 'abcd')).toBe(false);
  });
});

describe('two-factor authentication', () => {
  it('generates a base32 secret that decodes', () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
    expect(base32Decode(secret).length).toBeGreaterThan(10);
  });

  it('verifies the code it generates', () => {
    const secret = generateTotpSecret();
    const code = totpCode(secret);
    expect(code).toMatch(/^\d{6}$/);
    expect(verifyTotp(secret, code)).toBe(true);
  });

  it('accepts the previous step to tolerate clock drift', () => {
    const secret = generateTotpSecret();
    const previous = totpCode(secret, Date.now() - 30_000);
    expect(verifyTotp(secret, previous)).toBe(true);
  });

  it('rejects a code from far in the past', () => {
    const secret = generateTotpSecret();
    const stale = totpCode(secret, Date.now() - 10 * 60_000);
    expect(verifyTotp(secret, stale)).toBe(false);
  });

  it('rejects malformed input', () => {
    const secret = generateTotpSecret();
    expect(verifyTotp(secret, '12345')).toBe(false);
    expect(verifyTotp(secret, 'abcdef')).toBe(false);
  });

  it('builds an otpauth URI an authenticator app can read', () => {
    const uri = totpUri({ secret: 'JBSWY3DPEHPK3PXP', email: 'a@b.co', issuer: 'QR ALTRIX' });
    expect(uri.startsWith('otpauth://totp/')).toBe(true);
    expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
    expect(uri).toContain('issuer=QR+ALTRIX');
  });

  it('issues distinct single-use recovery codes', () => {
    const codes = generateRecoveryCodes(8);
    expect(codes).toHaveLength(8);
    expect(new Set(codes).size).toBe(8);
    for (const code of codes) expect(code).toMatch(/^[0-9A-F]{5}-[0-9A-F]{5}$/);
  });
});

describe('API keys', () => {
  it('parses a well-formed key', () => {
    const parsed = parseApiKey('qra_abcd1234_0123456789abcdef0123456789abcdef');
    expect(parsed?.prefix).toBe('abcd1234');
  });

  it('rejects malformed keys', () => {
    expect(parseApiKey('nope')).toBeNull();
    expect(parseApiKey('qra_short_x')).toBeNull();
    expect(parseApiKey('')).toBeNull();
  });

  it('maps scopes to permissions and grants nothing extra', () => {
    const readOnly = apiKeyGrants(['qr:read']);
    expect(readOnly.has('qr.read')).toBe(true);
    expect(readOnly.has('qr.delete')).toBe(false);
    expect(readOnly.has('domain.manage')).toBe(false);

    const writer = apiKeyGrants(['qr:write']);
    expect(writer.has('qr.update')).toBe(true);
    expect(writer.has('team.manage')).toBe(false);
  });

  it('ignores unknown scopes', () => {
    expect(apiKeyGrants(['not:a:scope']).size).toBe(0);
  });
});

describe('webhook signatures', () => {
  it('signs deterministically over timestamp and body', () => {
    const signature = signWebhookPayload('whsec_test', '{"a":1}', 1_700_000_000);
    expect(signature).toBe(signWebhookPayload('whsec_test', '{"a":1}', 1_700_000_000));
    expect(signature).toHaveLength(64);
  });

  it('changes when the body, timestamp or secret changes', () => {
    const base = signWebhookPayload('whsec_test', '{"a":1}', 1_700_000_000);
    expect(signWebhookPayload('whsec_test', '{"a":2}', 1_700_000_000)).not.toBe(base);
    expect(signWebhookPayload('whsec_test', '{"a":1}', 1_700_000_001)).not.toBe(base);
    expect(signWebhookPayload('whsec_other', '{"a":1}', 1_700_000_000)).not.toBe(base);
  });
});

describe('rate limiting', () => {
  beforeEach(() => resetRateLimitMemory());

  it('allows up to the limit and then blocks', async () => {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const result = await rateLimit('test-key', 3, 60);
      expect(result.allowed).toBe(true);
    }
    const blocked = await rateLimit('test-key', 3, 60);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('keeps separate buckets per key', async () => {
    await rateLimit('key-a', 1, 60);
    const other = await rateLimit('key-b', 1, 60);
    expect(other.allowed).toBe(true);
  });
});

describe('upload safety', () => {
  it('rejects traversal and absolute storage keys', () => {
    expect(isSafeKey('workspace/2026/06/abc.png')).toBe(true);
    expect(isSafeKey('../../etc/passwd')).toBe(false);
    expect(isSafeKey('/etc/passwd')).toBe(false);
    expect(isSafeKey('a\\b.png')).toBe(false);
    expect(isSafeKey('')).toBe(false);
  });

  it('builds keys that are safe and carry the right extension', () => {
    const key = buildStorageKey({ scope: 'ws_123', mimeType: 'image/png', originalName: 'Logo (1).PNG' });
    expect(isSafeKey(key)).toBe(true);
    expect(key.endsWith('.png')).toBe(true);
    expect(key.startsWith('ws_123/')).toBe(true);
  });

  it('refuses disallowed types, oversized files and executables', () => {
    expect(validateUpload({ size: 10, type: 'application/x-msdownload', name: 'a.exe' }).ok).toBe(false);
    expect(validateUpload({ size: 99 * 1024 * 1024, type: 'image/png', name: 'a.png' }, undefined, 15).ok).toBe(false);
    expect(validateUpload({ size: 0, type: 'image/png', name: 'a.png' }).ok).toBe(false);
    expect(validateUpload({ size: 1024, type: 'image/png', name: 'logo.php' }).ok).toBe(false);
    expect(validateUpload({ size: 1024, type: 'image/png', name: 'logo.png' }).ok).toBe(true);
  });

  it('strips scripts, handlers and javascript URLs from SVG uploads', () => {
    const dirty = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">
      <script>alert(2)</script>
      <a href="javascript:alert(3)"><rect width="10" height="10"/></a>
      <foreignObject><body>hi</body></foreignObject>
    </svg>`;
    const clean = sanitizeSvg(dirty);
    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('onload');
    expect(clean).not.toContain('javascript:');
    expect(clean).not.toContain('foreignObject');
    expect(clean).toContain('<rect');
  });
});
