import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';

/**
 * Database-backed tests for the paths that matter most: creating codes, resolving a scan,
 * recording analytics, and the owner-controlled gates.
 *
 * They are skipped unless DATABASE_URL is set, so `npm test` stays fast and dependency
 * free. Point it at a disposable database:
 *
 *   DATABASE_URL=postgresql://localhost:5432/qraltrix_test npm test
 */

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDatabase)('database integration', () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let prisma: any;
  let service: any;
  let resolveModule: any;
  let scanModule: any;
  let analytics: any;
  let hash: any;

  let userId = '';
  let workspaceId = '';
  const slug = `t-${randomUUID().slice(0, 8)}`;

  beforeAll(async () => {
    ({ prisma } = await import('@/lib/db'));
    service = await import('@/lib/qr/service');
    resolveModule = await import('@/lib/routing/resolve');
    scanModule = await import('@/lib/jobs/scan');
    analytics = await import('@/lib/analytics');
    hash = await import('@/lib/hash');

    const email = `test-${randomUUID().slice(0, 8)}@qraltrix.test`;
    const user = await prisma.user.create({
      data: { email, passwordHash: await hash.hashPassword('altrix1234'), name: 'Test' },
    });
    userId = user.id;

    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test workspace',
        slug: `test-${randomUUID().slice(0, 8)}`,
        ownerId: user.id,
        members: { create: { userId: user.id, email, role: 'OWNER', status: 'ACTIVE', acceptedAt: new Date() } },
      },
    });
    workspaceId = workspace.id;
  });

  afterAll(async () => {
    if (!prisma) return;
    if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  // ------------------------------------------------------------------ creation

  it('creates a dynamic code with a short code, design and default destination', async () => {
    const qr = await service.createQrCode(
      {
        name: 'Integration dynamic',
        kind: 'DYNAMIC',
        type: 'WEBSITE',
        content: { url: 'https://example.com/landing' },
        design: { bodyShape: 'dots', fgColor: '#112233' },
        slug,
      },
      { workspaceId, userId },
    );

    expect(qr.shortCode).toBeTruthy();
    expect(qr.slug).toBe(slug);
    expect(qr.design?.bodyShape).toBe('dots');
    expect(qr.destinations.some((d: any) => d.kind === 'DEFAULT' && d.url === 'https://example.com/landing')).toBe(true);
    expect(service.encodedPayloadFor(qr)).toContain(qr.slug);
  });

  it('creates a static code that encodes its content directly', async () => {
    const qr = await service.createQrCode(
      {
        name: 'Integration wifi',
        kind: 'STATIC',
        type: 'WIFI',
        content: { ssid: 'Test-Net', encryption: 'WPA', password: 'hunter22' },
      },
      { workspaceId, userId },
    );

    expect(qr.shortCode).toBeNull();
    expect(service.encodedPayloadFor(qr)).toBe('WIFI:T:WPA;S:Test-Net;P:hunter22;;');
  });

  it('refuses a duplicate slug on the same domain', async () => {
    await expect(
      service.createQrCode(
        { name: 'Clash', kind: 'DYNAMIC', type: 'WEBSITE', content: { url: 'https://example.com' }, slug },
        { workspaceId, userId },
      ),
    ).rejects.toThrow();
  });

  it('refuses a reserved slug', async () => {
    await expect(
      service.createQrCode(
        { name: 'Reserved', kind: 'DYNAMIC', type: 'WEBSITE', content: { url: 'https://example.com' }, slug: 'dashboard' },
        { workspaceId, userId },
      ),
    ).rejects.toThrow();
  });

  it('rejects content that does not pass validation', async () => {
    await expect(
      service.createQrCode(
        { name: 'Bad', kind: 'DYNAMIC', type: 'WEBSITE', content: {} },
        { workspaceId, userId },
      ),
    ).rejects.toThrow();
  });

  // ----------------------------------------------------------------- resolving

  it('resolves a code by its short code and by its slug', async () => {
    const created = await prisma.qRCode.findFirst({ where: { workspaceId, name: 'Integration dynamic' } });
    const byShortCode = await resolveModule.resolveQr({ host: null, code: created.shortCode });
    expect(byShortCode?.id).toBe(created.id);

    const bySlug = await resolveModule.resolveQr({ host: null, code: created.slug });
    expect(bySlug?.id).toBe(created.id);
  });

  it('returns null for an unknown code', async () => {
    expect(await resolveModule.resolveQr({ host: null, code: 'definitely-not-real' })).toBeNull();
  });

  it('does not resolve a custom-domain slug until the domain is verified', async () => {
    const host = `links-${randomUUID().slice(0, 6)}.test`;
    const domain = await prisma.customDomain.create({
      data: { workspaceId, host, verifyToken: 'tok', status: 'PENDING' },
    });
    const qr = await service.createQrCode(
      {
        name: 'Domain code',
        kind: 'DYNAMIC',
        type: 'WEBSITE',
        content: { url: 'https://example.com/d' },
        customDomainId: domain.id,
        slug: 'promo',
      },
      { workspaceId, userId },
    );

    expect(await resolveModule.resolveQr({ host, code: 'promo' })).toBeNull();

    await prisma.customDomain.update({ where: { id: domain.id }, data: { status: 'VERIFIED' } });
    const resolved = await resolveModule.resolveQr({ host, code: 'promo' });
    expect(resolved?.id).toBe(qr.id);
    expect(resolveModule.shortLinkFor(resolved)).toBe(`https://${host}/promo`);
  });

  // ------------------------------------------------------------------ scanning

  it('records a scan, counts it once per visitor, and updates the counters', async () => {
    const qr = await prisma.qRCode.findFirst({ where: { workspaceId, name: 'Integration dynamic' } });

    const payload = {
      qrCodeId: qr.id,
      workspaceId,
      kind: 'SCAN' as const,
      ipHash: 'hash-1',
      visitorHash: 'visitor-1',
      country: 'PK',
      city: 'Lahore',
      deviceType: 'mobile',
      browser: 'Mobile Safari',
      os: 'iOS',
      language: 'en-gb',
      referrer: null,
      destinationUrl: 'https://example.com/landing',
      scannedAt: new Date().toISOString(),
    };

    await scanModule.recordScan(payload);
    await scanModule.recordScan({ ...payload, scannedAt: new Date().toISOString() });
    await scanModule.recordScan({ ...payload, visitorHash: 'visitor-2', scannedAt: new Date().toISOString() });

    const after = await prisma.qRCode.findUnique({ where: { id: qr.id } });
    expect(after.scanCount).toBe(3);
    expect(after.uniqueScanCount).toBe(2);
    expect(after.firstScanAt).toBeTruthy();
    expect(after.lastScanAt).toBeTruthy();
  });

  it('sets firstScanAt only once', async () => {
    const qr = await prisma.qRCode.findFirst({ where: { workspaceId, name: 'Integration dynamic' } });
    const first = qr.firstScanAt;

    await scanModule.recordScan({
      qrCodeId: qr.id,
      workspaceId,
      kind: 'SCAN',
      ipHash: 'hash-9',
      visitorHash: 'visitor-9',
      scannedAt: new Date().toISOString(),
    });

    const after = await prisma.qRCode.findUnique({ where: { id: qr.id } });
    expect(after.firstScanAt?.toISOString()).toBe(first?.toISOString());
  });

  it('keeps blocked scans out of the scan counter', async () => {
    const qr = await prisma.qRCode.findFirst({ where: { workspaceId, name: 'Integration dynamic' } });
    const before = qr.scanCount;

    await scanModule.recordScan({
      qrCodeId: qr.id,
      workspaceId,
      kind: 'BLOCKED',
      ipHash: 'hash-b',
      visitorHash: 'visitor-b',
      scannedAt: new Date().toISOString(),
    });

    const after = await prisma.qRCode.findUnique({ where: { id: qr.id } });
    expect(after.scanCount).toBe(before);
  });

  // ----------------------------------------------------------------- analytics

  it('aggregates analytics for the workspace', async () => {
    const overview = await analytics.analyticsOverview({
      workspaceId,
      range: analytics.defaultRange(30),
      timezone: 'UTC',
    });

    expect(overview.totalScans).toBeGreaterThanOrEqual(3);
    expect(overview.uniqueScans).toBeGreaterThanOrEqual(2);
    expect(overview.countries.some((row: any) => row.label === 'PK')).toBe(true);
    expect(overview.devices.some((row: any) => row.label === 'mobile')).toBe(true);
    expect(overview.series.length).toBeGreaterThan(0);
    expect(overview.hours).toHaveLength(24);
  });

  it('exports rows for CSV without exposing raw IPs', async () => {
    const rows = await analytics.analyticsExportRows({
      workspaceId,
      range: analytics.defaultRange(30),
      timezone: 'UTC',
    });
    expect(rows.length).toBeGreaterThan(0);
    expect(Object.keys(rows[0])).not.toContain('ipHash');
    const csv = analytics.rowsToCsv(rows as any);
    expect(csv.split('\n')[0]).toContain('scanned_at');
  });

  // --------------------------------------------------------------------- gates

  it('stores a password as a hash and never in the clear', async () => {
    const qr = await service.createQrCode(
      {
        name: 'Protected',
        kind: 'DYNAMIC',
        type: 'WEBSITE',
        content: { url: 'https://example.com/secret' },
        gates: { password: 'open-sesame' },
      },
      { workspaceId, userId },
    );

    const row = await prisma.qRCode.findUnique({ where: { id: qr.id } });
    expect(row.passwordHash).toBeTruthy();
    expect(row.passwordHash).not.toContain('open-sesame');
    expect(await hash.verifyPassword('open-sesame', row.passwordHash)).toBe(true);
    expect(service.serializeQr(qr).passwordProtected).toBe(true);
  });

  it('persists a schedule and a scan limit only when they are switched on', async () => {
    const scheduled = await service.createQrCode(
      {
        name: 'Scheduled',
        kind: 'DYNAMIC',
        type: 'WEBSITE',
        content: { url: 'https://example.com/s' },
        gates: {
          scheduleEnabled: true,
          scheduleStart: new Date('2026-01-01T00:00:00Z').toISOString(),
          scheduleEnd: new Date('2026-12-31T00:00:00Z').toISOString(),
          scanLimitEnabled: false,
          scanLimitMax: 500,
        },
      },
      { workspaceId, userId },
    );

    expect(scheduled.scheduleEnabled).toBe(true);
    expect(scheduled.scheduleStart).toBeTruthy();
    // The limit was supplied but not enabled, so it must not be stored.
    expect(scheduled.scanLimitEnabled).toBe(false);
    expect(scheduled.scanLimitMax).toBeNull();
  });

  // -------------------------------------------------------------------- edits

  it('changes the destination without changing the short code', async () => {
    const before = await prisma.qRCode.findFirst({ where: { workspaceId, name: 'Integration dynamic' } });

    const updated = await service.updateQrCode(
      before.id,
      { content: { url: 'https://example.com/changed' } },
      { workspaceId, userId },
    );

    expect(updated.shortCode).toBe(before.shortCode);
    expect(updated.slug).toBe(before.slug);
    expect(updated.destinations.find((d: any) => d.kind === 'DEFAULT')?.url).toBe('https://example.com/changed');
  });

  it('pauses and resumes', async () => {
    const qr = await prisma.qRCode.findFirst({ where: { workspaceId, name: 'Integration dynamic' } });
    const paused = await service.updateQrCode(qr.id, { status: 'PAUSED' }, { workspaceId, userId });
    expect(paused.status).toBe('PAUSED');
    const resumed = await service.updateQrCode(qr.id, { status: 'ACTIVE' }, { workspaceId, userId });
    expect(resumed.status).toBe('ACTIVE');
  });

  it('duplicates a code with a new short code and the same design', async () => {
    const source = await prisma.qRCode.findFirst({ where: { workspaceId, name: 'Integration dynamic' } });
    const copy = await service.duplicateQrCode(source.id, { workspaceId, userId });

    expect(copy.id).not.toBe(source.id);
    expect(copy.shortCode).not.toBe(source.shortCode);
    expect(copy.name).toContain('(copy)');
    expect(copy.design?.bodyShape).toBe('dots');
  });

  it('soft-deletes so history survives and the short code is never reused', async () => {
    const qr = await service.createQrCode(
      { name: 'To delete', kind: 'DYNAMIC', type: 'WEBSITE', content: { url: 'https://example.com/x' } },
      { workspaceId, userId },
    );

    await service.deleteQrCode(qr.id, { workspaceId, userId });

    const row = await prisma.qRCode.findUnique({ where: { id: qr.id } });
    expect(row.status).toBe('DELETED');
    expect(row.deletedAt).toBeTruthy();
    expect(row.shortCode).toBe(qr.shortCode);
  });

  it('resets scan statistics without touching the code', async () => {
    const qr = await prisma.qRCode.findFirst({ where: { workspaceId, name: 'Integration dynamic' } });
    await service.resetQrScans(qr.id, { workspaceId, userId });

    const after = await prisma.qRCode.findUnique({ where: { id: qr.id } });
    expect(after.scanCount).toBe(0);
    expect(after.uniqueScanCount).toBe(0);
    expect(after.firstScanAt).toBeNull();
    expect(after.status).toBe('ACTIVE');
    expect(await prisma.scanEvent.count({ where: { qrCodeId: qr.id } })).toBe(0);
  });

  // ------------------------------------------------------------------ listing

  it('lists, searches and filters', async () => {
    const all = await service.listQrCodes({ workspaceId, take: 100 });
    expect(all.total).toBeGreaterThan(3);

    const search = await service.listQrCodes({ workspaceId, search: 'Protected', take: 10 });
    expect(search.items.every((item: any) => item.name.includes('Protected'))).toBe(true);

    const statics = await service.listQrCodes({ workspaceId, filter: 'static', take: 50 });
    expect(statics.items.every((item: any) => item.kind === 'STATIC')).toBe(true);

    const protectedOnly = await service.listQrCodes({ workspaceId, filter: 'protected', take: 50 });
    expect(protectedOnly.items.every((item: any) => item.passwordHash !== null)).toBe(true);

    // Deleted codes are excluded from the default listing.
    expect(all.items.some((item: any) => item.name === 'To delete')).toBe(false);
  });

  it('writes an audit trail for every change', async () => {
    const events = await prisma.securityEvent.findMany({ where: { workspaceId } });
    const types = events.map((event: any) => event.type);
    expect(types).toContain('QR_CREATED');
    expect(types).toContain('QR_EDITED');
    expect(types).toContain('QR_DELETED');
    expect(types).toContain('QR_SCANS_RESET');
  });
});
