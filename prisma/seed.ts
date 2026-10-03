/**
 * Seed data for a fresh QR ALTRIX install.
 *
 *   npm run seed
 *
 * Creates a demo admin, a workspace, folders, a design template, one static and several
 * dynamic QR codes (including a hosted menu and a link list), a pending custom domain,
 * and about a month of realistic scan history so the analytics screens have something to
 * show. Safe to run more than once: everything is upserted by a stable key.
 */

import { PrismaClient, type Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createHmac, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

const DEMO_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@qraltrix.local';
const DEMO_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'altrix1234';
const SHORT_BASE = (process.env.SHORT_URL_BASE ?? process.env.APP_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

const DESIGN_DEFAULT = {
  bodyShape: 'rounded',
  eyeFrameShape: 'rounded',
  eyeBallShape: 'rounded',
  fgColor: '#0B1120',
  bgColor: '#FFFFFF',
  margin: 4,
  errorCorrection: 'M',
  logoSize: 22,
  logoPadding: 6,
  logoShape: 'none',
  frame: 'none',
  frameColor: '#4F46E5',
  frameTextColor: '#FFFFFF',
  ctaPosition: 'bottom',
} satisfies Partial<Prisma.QRDesignCreateWithoutQrCodeInput>;

const COUNTRIES = [
  { code: 'PK', cities: ['Lahore', 'Karachi', 'Islamabad'], weight: 34 },
  { code: 'AE', cities: ['Dubai', 'Abu Dhabi'], weight: 16 },
  { code: 'GB', cities: ['London', 'Manchester'], weight: 14 },
  { code: 'US', cities: ['New York', 'Austin', 'Seattle'], weight: 13 },
  { code: 'SA', cities: ['Riyadh', 'Jeddah'], weight: 9 },
  { code: 'IN', cities: ['Mumbai', 'Delhi'], weight: 8 },
  { code: 'DE', cities: ['Berlin'], weight: 6 },
];

const DEVICES = [
  { type: 'mobile', os: 'iOS', browser: 'Mobile Safari', weight: 48 },
  { type: 'mobile', os: 'Android', browser: 'Chrome', weight: 36 },
  { type: 'tablet', os: 'iOS', browser: 'Mobile Safari', weight: 6 },
  { type: 'desktop', os: 'Windows', browser: 'Chrome', weight: 6 },
  { type: 'desktop', os: 'macOS', browser: 'Safari', weight: 4 },
];

const LANGUAGES = ['en-gb', 'en-us', 'ur', 'ar', 'de', 'hi'];

function weightedPick<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Scans cluster around lunch and evening, which makes the hour chart look real. */
function scanHour(): number {
  const buckets = [
    { hour: 8, weight: 4 }, { hour: 9, weight: 6 }, { hour: 10, weight: 7 }, { hour: 11, weight: 9 },
    { hour: 12, weight: 14 }, { hour: 13, weight: 15 }, { hour: 14, weight: 9 }, { hour: 15, weight: 7 },
    { hour: 16, weight: 6 }, { hour: 17, weight: 7 }, { hour: 18, weight: 11 }, { hour: 19, weight: 13 },
    { hour: 20, weight: 12 }, { hour: 21, weight: 8 }, { hour: 22, weight: 5 }, { hour: 7, weight: 3 },
  ];
  return weightedPick(buckets).hour;
}

function shortCode(length = 7): string {
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

function hashValue(value: string): string {
  return createHmac('sha256', process.env.IP_HASH_SALT ?? 'qr-altrix-dev-ip-salt').update(value).digest('hex').slice(0, 40);
}

async function main() {
  console.log('▶ Seeding QR ALTRIX…');

  // ---------------------------------------------------------------- account ---
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { isPlatformAdmin: true, emailVerifiedAt: new Date() },
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      name: 'Demo',
      surname: 'Admin',
      emailVerifiedAt: new Date(),
      isPlatformAdmin: true,
      timezone: 'Asia/Karachi',
      locale: 'en',
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'altrix-demo' },
    update: {},
    create: {
      name: 'Altrix Demo',
      slug: 'altrix-demo',
      ownerId: user.id,
      brandColors: ['#4F46E5', '#0EA5E9', '#16A34A'],
      members: {
        create: { userId: user.id, email: user.email, role: 'OWNER', status: 'ACTIVE', acceptedAt: new Date() },
      },
    },
  });

  // Make sure the owner membership exists even if the workspace was already there.
  await prisma.workspaceMember.upsert({
    where: { workspaceId_email: { workspaceId: workspace.id, email: user.email } },
    update: { role: 'OWNER', status: 'ACTIVE', userId: user.id },
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      email: user.email,
      role: 'OWNER',
      status: 'ACTIVE',
      acceptedAt: new Date(),
    },
  });

  // A pending invitation, so the team screen has something to show.
  await prisma.workspaceMember.upsert({
    where: { workspaceId_email: { workspaceId: workspace.id, email: 'editor@qraltrix.local' } },
    update: {},
    create: {
      workspaceId: workspace.id,
      email: 'editor@qraltrix.local',
      role: 'EDITOR',
      status: 'PENDING',
      inviteToken: randomBytes(24).toString('hex'),
      invitedById: user.id,
    },
  });

  // ---------------------------------------------------------------- folders ---
  const campaigns = await prisma.folder.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: 'Campaigns' } },
    update: {},
    create: { workspaceId: workspace.id, name: 'Campaigns', color: '#4F46E5' },
  });
  await prisma.folder.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: 'Restaurant' } },
    update: {},
    create: { workspaceId: workspace.id, name: 'Restaurant', color: '#B45309' },
  });

  // --------------------------------------------------------------- template ---
  await prisma.qRTemplate.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: 'Altrix brand' } },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'Altrix brand',
      isDefault: true,
      design: {
        ...DESIGN_DEFAULT,
        bodyShape: 'extra-rounded',
        eyeFrameShape: 'leaf',
        eyeBallShape: 'circle',
        gradientEnabled: true,
        gradientFrom: '#4F46E5',
        gradientTo: '#0EA5E9',
        gradientRotation: 45,
        frame: 'banner-bottom',
        ctaText: 'SCAN ME',
      },
    },
  });

  // ---------------------------------------------------------------- domain ----
  await prisma.customDomain.upsert({
    where: { host: 'links.altrix-demo.test' },
    update: {},
    create: {
      workspaceId: workspace.id,
      host: 'links.altrix-demo.test',
      verifyToken: randomBytes(16).toString('hex'),
      status: 'PENDING',
    },
  });

  // --------------------------------------------------------------- QR codes ---
  interface SeedCode {
    key: string;
    name: string;
    kind: 'STATIC' | 'DYNAMIC';
    type: string;
    content: Prisma.InputJsonValue;
    folderId?: string | null;
    slug?: string;
    design?: Record<string, unknown>;
    destination?: string;
    utm?: Prisma.InputJsonValue;
    gates?: { scheduleEnabled?: boolean; scheduleStart?: Date; scheduleEnd?: Date; password?: string };
    popularity: number;
  }

  const seedCodes: SeedCode[] = [
    {
      key: 'spring-campaign',
      name: 'Spring campaign poster',
      kind: 'DYNAMIC',
      type: 'WEBSITE',
      content: { url: 'https://example.com/spring-2026' },
      destination: 'https://example.com/spring-2026',
      folderId: campaigns.id,
      slug: 'spring',
      utm: { source: 'poster', medium: 'print', campaign: 'spring-2026' },
      design: {
        ...DESIGN_DEFAULT,
        bodyShape: 'extra-rounded',
        gradientEnabled: true,
        gradientFrom: '#4F46E5',
        gradientTo: '#0EA5E9',
        frame: 'banner-bottom',
        ctaText: 'SCAN ME',
        logoPreset: 'spark',
        logoShape: 'circle',
      },
      popularity: 46,
    },
    {
      key: 'table-menu',
      name: 'Table menu — main room',
      kind: 'DYNAMIC',
      type: 'MENU',
      content: {
        name: 'Altrix Kitchen',
        currency: 'Rs',
        accentColor: '#B45309',
        note: 'Everything is cooked to order. Please tell us about allergies.',
        sections: [
          {
            name: 'Starters',
            items: 'Chicken malai boti | 850 | Char-grilled, mint yoghurt\nSeekh kebab | 790 | Beef, hand-minced\nHummus and warm naan | 550',
          },
          {
            name: 'Mains',
            items: 'Karahi chicken | 1,650 | For two\nNihari | 1,250 | Slow-cooked overnight\nPaneer tikka masala | 1,100 | Vegetarian',
          },
          { name: 'Sweet', items: 'Kheer | 420\nGulab jamun | 380 | Two pieces' },
        ],
      },
      design: {
        ...DESIGN_DEFAULT,
        fgColor: '#7C2D12',
        bodyShape: 'classy',
        frame: 'table-tent',
        frameColor: '#B45309',
        ctaText: 'SCAN TO ORDER',
        logoPreset: 'menu',
        logoShape: 'rounded',
      },
      popularity: 31,
    },
    {
      key: 'link-list',
      name: 'Link in bio',
      kind: 'DYNAMIC',
      type: 'LINK_LIST',
      content: {
        title: 'Altrix Demo',
        subtitle: 'Everything in one place',
        accentColor: '#4F46E5',
        links: [
          { label: 'Our website', url: 'https://example.com', description: 'Products and pricing' },
          { label: 'Book a table', url: 'https://example.com/book' },
          { label: 'Latest video', url: 'https://example.com/video' },
        ],
      },
      design: { ...DESIGN_DEFAULT, bodyShape: 'dots', eyeBallShape: 'circle', fgColor: '#4F46E5' },
      popularity: 14,
    },
    {
      key: 'wifi-guest',
      name: 'Guest Wi-Fi card',
      kind: 'STATIC',
      type: 'WIFI',
      content: { ssid: 'Altrix-Guest', encryption: 'WPA', password: 'welcome2026', hidden: false },
      design: { ...DESIGN_DEFAULT, bodyShape: 'mosaic', logoPreset: 'wifi', logoShape: 'square', frame: 'card' },
      popularity: 0,
    },
    {
      key: 'event-launch',
      name: 'Launch event invite',
      kind: 'DYNAMIC',
      type: 'EVENT_PAGE',
      content: {
        title: 'Altrix Spring Launch',
        start: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
        end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21 + 1000 * 60 * 60 * 3).toISOString(),
        venue: 'Alhamra Arts Council',
        address: 'The Mall, Lahore',
        accentColor: '#7C3AED',
        description: 'A short evening of demos, food and conversation.',
        agenda: [
          { time: '18:00', title: 'Doors open' },
          { time: '18:45', title: 'Product walkthrough' },
          { time: '19:30', title: 'Dinner' },
        ],
      },
      folderId: campaigns.id,
      design: { ...DESIGN_DEFAULT, fgColor: '#6D28D9', frame: 'ticket', frameColor: '#7C3AED', ctaText: 'ADMIT ONE' },
      gates: {
        scheduleEnabled: true,
        scheduleStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        scheduleEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
      popularity: 9,
    },
    {
      key: 'price-list',
      name: 'Wholesale price list (protected)',
      kind: 'DYNAMIC',
      type: 'WEBSITE',
      content: { url: 'https://example.com/wholesale' },
      destination: 'https://example.com/wholesale',
      design: { ...DESIGN_DEFAULT, bodyShape: 'square', frame: 'hairline' },
      gates: { password: 'trade2026' },
      popularity: 3,
    },
  ];

  const createdCodes: { id: string; popularity: number; createdAt: Date }[] = [];

  for (const seed of seedCodes) {
    const existing = await prisma.qRCode.findFirst({
      where: { workspaceId: workspace.id, name: seed.name },
      select: { id: true, createdAt: true },
    });

    if (existing) {
      createdCodes.push({ id: existing.id, popularity: seed.popularity, createdAt: existing.createdAt });
      continue;
    }

    const createdAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * (30 + Math.floor(Math.random() * 20)));
    const code = await prisma.qRCode.create({
      data: {
        workspaceId: workspace.id,
        creatorId: user.id,
        folderId: seed.folderId ?? null,
        name: seed.name,
        kind: seed.kind,
        type: seed.type as never,
        content: seed.content,
        shortCode: seed.kind === 'DYNAMIC' ? shortCode() : null,
        slug: seed.slug ?? null,
        utm: seed.utm ?? undefined,
        createdAt,
        scheduleEnabled: Boolean(seed.gates?.scheduleEnabled),
        scheduleStart: seed.gates?.scheduleStart ?? null,
        scheduleEnd: seed.gates?.scheduleEnd ?? null,
        passwordHash: seed.gates?.password ? await bcrypt.hash(seed.gates.password, 12) : null,
        design: { create: { ...DESIGN_DEFAULT, ...(seed.design ?? {}) } as never },
        destinations: seed.destination
          ? { create: [{ kind: 'DEFAULT', url: seed.destination, priority: 0 }] }
          : undefined,
      },
      select: { id: true, createdAt: true },
    });

    createdCodes.push({ id: code.id, popularity: seed.popularity, createdAt: code.createdAt });
  }

  // Smart routing on the campaign code, so the feature is visible in the builder.
  const campaignCode = createdCodes[0];
  const existingRules = await prisma.qRDestination.count({
    where: { qrCodeId: campaignCode.id, kind: { not: 'DEFAULT' } },
  });
  if (existingRules === 0) {
    await prisma.qRDestination.createMany({
      data: [
        { qrCodeId: campaignCode.id, kind: 'COUNTRY', matchValue: 'PK', url: 'https://example.com/spring-2026/pk', priority: 1 },
        { qrCodeId: campaignCode.id, kind: 'COUNTRY', matchValue: 'AE, SA', url: 'https://example.com/spring-2026/gulf', priority: 2 },
        { qrCodeId: campaignCode.id, kind: 'DEVICE', matchValue: 'desktop', url: 'https://example.com/spring-2026/desktop', priority: 3 },
      ],
    });
  }

  // ---------------------------------------------------------------- scans -----
  const alreadySeeded = await prisma.scanEvent.count({ where: { workspaceId: workspace.id } });
  if (alreadySeeded > 0) {
    console.log(`  · ${alreadySeeded} scan events already present, leaving analytics untouched`);
  } else {
    const rows: Prisma.ScanEventCreateManyInput[] = [];
    const visitors = new Map<string, Set<string>>();

    for (const code of createdCodes) {
      if (code.popularity === 0) continue;

      for (let day = 29; day >= 0; day -= 1) {
        // A gentle upward trend with weekend dips, then a little noise.
        const date = new Date();
        date.setDate(date.getDate() - day);
        const weekday = date.getDay();
        const weekendFactor = weekday === 0 || weekday === 6 ? 0.65 : 1;
        const trend = 0.6 + ((29 - day) / 29) * 0.8;
        const count = Math.max(0, Math.round(code.popularity * 0.12 * trend * weekendFactor * (0.6 + Math.random())));

        for (let index = 0; index < count; index += 1) {
          const country = weightedPick(COUNTRIES);
          const device = weightedPick(DEVICES);
          const at = new Date(date);
          at.setHours(scanHour(), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);

          const visitorHash = hashValue(`seed-${code.id}-${Math.floor(Math.random() * Math.max(4, count * 6))}`);
          const seen = visitors.get(code.id) ?? new Set<string>();
          const isUnique = !seen.has(visitorHash);
          seen.add(visitorHash);
          visitors.set(code.id, seen);

          rows.push({
            qrCodeId: code.id,
            workspaceId: workspace.id,
            kind: 'SCAN',
            createdAt: at,
            ipHash: hashValue(`seed-ip-${visitorHash}`),
            visitorHash,
            isUnique,
            country: country.code,
            city: pick(country.cities),
            deviceType: device.type,
            browser: device.browser,
            os: device.os,
            language: pick(LANGUAGES),
            referrer: Math.random() < 0.12 ? pick(['instagram.com', 'facebook.com', 'mail.google.com']) : null,
            hourOfDay: at.getUTCHours(),
            utmSource: Math.random() < 0.4 ? 'poster' : null,
            utmMedium: Math.random() < 0.4 ? 'print' : null,
            utmCampaign: Math.random() < 0.4 ? 'spring-2026' : null,
          });
        }
      }
    }

    // Insert in chunks so a large seed does not build one enormous statement.
    for (let index = 0; index < rows.length; index += 500) {
      await prisma.scanEvent.createMany({ data: rows.slice(index, index + 500) });
    }

    // Keep the denormalised counters on each code in step with the rows above.
    for (const code of createdCodes) {
      const [total, unique, bounds] = await Promise.all([
        prisma.scanEvent.count({ where: { qrCodeId: code.id, kind: 'SCAN' } }),
        prisma.scanEvent.count({ where: { qrCodeId: code.id, kind: 'SCAN', isUnique: true } }),
        prisma.scanEvent.aggregate({
          where: { qrCodeId: code.id, kind: 'SCAN' },
          _min: { createdAt: true },
          _max: { createdAt: true },
        }),
      ]);
      await prisma.qRCode.update({
        where: { id: code.id },
        data: {
          scanCount: total,
          uniqueScanCount: unique,
          firstScanAt: bounds._min.createdAt,
          lastScanAt: bounds._max.createdAt,
        },
      });
    }

    console.log(`  · ${rows.length} scan events created across ${createdCodes.length} codes`);
  }

  // --------------------------------------------------------------- activity ---
  await prisma.securityEvent.create({
    data: {
      type: 'LOGIN',
      userId: user.id,
      workspaceId: workspace.id,
      email: user.email,
      meta: { via: 'seed' },
    },
  });

  console.log('✔ Seed complete');
  console.log('');
  console.log('  Sign in at /login');
  console.log(`    email:    ${DEMO_EMAIL}`);
  console.log(`    password: ${DEMO_PASSWORD}`);
  console.log(`  Short links resolve from ${SHORT_BASE}/q/<code>`);
  console.log('');
  console.log('  Change that password immediately on a public server.');
}

main()
  .catch((error) => {
    console.error('✖ Seed failed');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
