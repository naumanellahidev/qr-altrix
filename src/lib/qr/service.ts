import 'server-only';
import { Prisma, type QRCode, type QrKind, type QrType } from '@prisma/client';
import { prisma } from '../db';
import { hashPassword } from '../hash';
import { generateShortCode, slugify } from '../utils';
import { logActivity, logSecurity } from '../audit';
import { dynamicPayloadFor, shortLinkFor } from '../routing/resolve';
import { validateContentForType, type DesignInput } from '../validation';
import { buildStaticPayload } from './payload';
import { DEFAULT_DESIGN } from './types';
import { getTypeDef } from './catalog';
import { deliverWebhookEvent } from '../jobs/webhook';

/**
 * One place where QR codes are created and changed, used by the dashboard, the public
 * API and the bulk importer. Keeping it single-sourced is what makes "dynamic codes
 * never expire" a property of the system rather than of one code path.
 */

export const QR_LIST_INCLUDE = Prisma.validator<Prisma.QRCodeInclude>()({
  design: true,
  customDomain: { select: { id: true, host: true, status: true } },
  folder: { select: { id: true, name: true, color: true } },
  destinations: true,
});

/** Prisma needs an explicit DbNull for nullable Json columns. */
function jsonOrNull(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (value === null || value === undefined) return Prisma.DbNull;
  return value as Prisma.InputJsonValue;
}

export type QrWithRelations = Prisma.QRCodeGetPayload<{ include: typeof QR_LIST_INCLUDE }>;

export interface QrServiceContext {
  workspaceId: string;
  userId?: string | null;
  headers?: Headers | null;
  source?: 'dashboard' | 'api' | 'bulk' | 'homepage';
}

export interface SmartRuleInput {
  kind: 'COUNTRY' | 'LANGUAGE' | 'DEVICE' | 'TIME';
  matchValue: string;
  url: string;
  priority?: number;
}

export interface GatesInput {
  password?: string | null;
  scheduleEnabled?: boolean;
  scheduleStart?: string | Date | null;
  scheduleEnd?: string | Date | null;
  timeRules?: unknown;
  scanLimitEnabled?: boolean;
  scanLimitMax?: number | null;
}

export interface CreateQrInput {
  name: string;
  kind: QrKind;
  type: QrType;
  content: unknown;
  design?: Partial<DesignInput>;
  folderId?: string | null;
  templateId?: string | null;
  customDomainId?: string | null;
  slug?: string | null;
  utm?: Record<string, unknown> | null;
  smartRules?: SmartRuleInput[];
  gates?: GatesInput;
  isFavorite?: boolean;
}

export class QrValidationError extends Error {
  constructor(public readonly errors: Record<string, string>) {
    super('QR code content is invalid');
    this.name = 'QrValidationError';
  }
}

async function uniqueShortCode(): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateShortCode(attempt < 6 ? 7 : 9);
    const existing = await prisma.qRCode.findUnique({ where: { shortCode: code }, select: { id: true } });
    if (!existing) return code;
  }
  throw new Error('Could not allocate a short code — please try again');
}

async function assertSlugAvailable(slug: string, customDomainId: string | null, ignoreId?: string): Promise<void> {
  const clash = await prisma.qRCode.findFirst({
    where: {
      slug,
      customDomainId: customDomainId ?? null,
      id: ignoreId ? { not: ignoreId } : undefined,
      status: { not: 'DELETED' },
    },
    select: { id: true },
  });
  if (clash) {
    throw new QrValidationError({
      slug: customDomainId
        ? 'That link is already used on this domain. Pick another.'
        : 'That short link is already taken. Pick another.',
    });
  }
  const reserved = [
    'api', 'dashboard', 'admin', 'login', 'signup', 'logout', 'q', 'r', 'l', 'p', 'inactive',
    'verify-email', 'reset-password', 'forgot-password', 'invite', 'files', 'legal', 'privacy',
    'terms', 'docs', 'static', '_next', 'favicon.ico', 'robots.txt', 'sitemap.xml',
  ];
  if (!customDomainId && reserved.includes(slug.toLowerCase())) {
    throw new QrValidationError({ slug: 'That word is reserved. Pick another short link.' });
  }
}

function resolveDesign(design?: Partial<DesignInput>, templateDesign?: Partial<DesignInput> | null) {
  return { ...DEFAULT_DESIGN, ...(templateDesign ?? {}), ...(design ?? {}) };
}

function gatesToData(gates: GatesInput | undefined, passwordHash: string | null | undefined) {
  const scheduleEnabled = Boolean(gates?.scheduleEnabled);
  const scanLimitEnabled = Boolean(gates?.scanLimitEnabled);
  return {
    passwordHash: passwordHash ?? null,
    scheduleEnabled,
    scheduleStart: scheduleEnabled && gates?.scheduleStart ? new Date(gates.scheduleStart) : null,
    scheduleEnd: scheduleEnabled && gates?.scheduleEnd ? new Date(gates.scheduleEnd) : null,
    timeRules: jsonOrNull(scheduleEnabled && gates?.timeRules ? gates.timeRules : null),
    scanLimitEnabled,
    scanLimitMax: scanLimitEnabled && gates?.scanLimitMax ? Number(gates.scanLimitMax) : null,
  };
}

/** The string encoded into the symbol: the content for static codes, a short link for dynamic. */
export function encodedPayloadFor(qr: {
  kind: QrKind;
  type: QrType;
  content: unknown;
  shortCode: string | null;
  slug: string | null;
  customDomain?: { host: string; status: string } | null;
}): string {
  if (qr.kind === 'STATIC') {
    return buildStaticPayload(qr.type, (qr.content ?? {}) as Record<string, unknown>);
  }
  return dynamicPayloadFor(qr);
}

export async function createQrCode(input: CreateQrInput, ctx: QrServiceContext): Promise<QrWithRelations> {
  const def = getTypeDef(input.type);
  if (!def) throw new QrValidationError({ type: 'Unknown QR code type' });
  if (def.kind !== input.kind) {
    throw new QrValidationError({ kind: `${def.label} codes are ${def.kind.toLowerCase()} codes` });
  }

  const validated = validateContentForType(input.type, input.content);
  if (!validated.ok) throw new QrValidationError(validated.errors);

  let templateDesign: Partial<DesignInput> | null = null;
  if (input.templateId) {
    const template = await prisma.qRTemplate.findFirst({
      where: { id: input.templateId, workspaceId: ctx.workspaceId },
    });
    templateDesign = (template?.design as Partial<DesignInput> | undefined) ?? null;
  }

  if (input.folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: input.folderId, workspaceId: ctx.workspaceId },
      select: { id: true },
    });
    if (!folder) throw new QrValidationError({ folderId: 'That folder does not exist' });
  }

  let customDomainId: string | null = null;
  if (input.customDomainId) {
    const domain = await prisma.customDomain.findFirst({
      where: { id: input.customDomainId, workspaceId: ctx.workspaceId },
    });
    if (!domain) throw new QrValidationError({ customDomainId: 'That domain does not exist' });
    customDomainId = domain.id;
  }

  const isDynamic = input.kind === 'DYNAMIC';
  const shortCode = isDynamic ? await uniqueShortCode() : null;

  let slug: string | null = null;
  if (isDynamic && input.slug) {
    slug = slugify(input.slug, 64);
    if (!slug) throw new QrValidationError({ slug: 'That short link cannot be used' });
    await assertSlugAvailable(slug, customDomainId);
  }
  if (isDynamic && customDomainId && !slug) {
    slug = shortCode;
  }

  const passwordHash = input.gates?.password ? await hashPassword(input.gates.password) : null;
  const design = resolveDesign(input.design, templateDesign);

  const createdRow = await prisma.qRCode.create({
    data: {
      workspaceId: ctx.workspaceId,
      creatorId: ctx.userId ?? null,
      folderId: input.folderId ?? null,
      name: input.name.trim(),
      kind: input.kind,
      type: input.type,
      content: validated.content as Prisma.InputJsonValue,
      shortCode,
      slug,
      customDomainId,
      utm: jsonOrNull(input.utm),
      isFavorite: Boolean(input.isFavorite),
      ...gatesToData(input.gates, passwordHash),
      design: { create: { ...design, qrCodeId: undefined } as Prisma.QRDesignCreateWithoutQrCodeInput },
      destinations: isDynamic
        ? {
            create: [
              ...(typeof validated.content.url === 'string'
                ? [{ kind: 'DEFAULT' as const, url: validated.content.url, priority: 0 }]
                : []),
              ...(input.smartRules ?? []).map((rule) => ({
                kind: rule.kind,
                matchValue: rule.matchValue,
                url: rule.url,
                priority: rule.priority ?? 1,
              })),
            ],
          }
        : undefined,
    },
    select: { id: true },
  });

  const created = await prisma.qRCode.findUniqueOrThrow({
    where: { id: createdRow.id },
    include: QR_LIST_INCLUDE,
  });

  await logSecurity({
    type: 'QR_CREATED',
    userId: ctx.userId ?? null,
    workspaceId: ctx.workspaceId,
    headers: ctx.headers ?? null,
    meta: { qrCodeId: created.id, name: created.name, kind: created.kind, type: created.type, source: ctx.source ?? 'dashboard' },
  });
  await logActivity({
    workspaceId: ctx.workspaceId,
    userId: ctx.userId ?? null,
    action: 'qr.created',
    entityType: 'QRCode',
    entityId: created.id,
    meta: { name: created.name, type: created.type },
  });
  await deliverWebhookEvent(ctx.workspaceId, 'qr.created', {
    id: created.id,
    name: created.name,
    type: created.type,
    kind: created.kind,
    shortLink: created.kind === 'DYNAMIC' ? shortLinkFor(created) : null,
  }).catch(() => undefined);

  return created;
}

export interface UpdateQrInput extends Partial<CreateQrInput> {
  status?: 'ACTIVE' | 'PAUSED';
}

export async function updateQrCode(
  qrId: string,
  input: UpdateQrInput,
  ctx: QrServiceContext,
): Promise<QrWithRelations> {
  const existing = await prisma.qRCode.findFirst({
    where: { id: qrId, workspaceId: ctx.workspaceId },
    include: QR_LIST_INCLUDE,
  });
  if (!existing) throw new QrValidationError({ id: 'QR code not found' });
  if (existing.status === 'ADMIN_DISABLED') {
    throw new QrValidationError({ id: 'This code was disabled by an administrator and cannot be edited.' });
  }

  const data: Prisma.QRCodeUpdateInput = {};

  if (input.name !== undefined) data.name = input.name.trim();
  if (input.status !== undefined) data.status = input.status;
  if (input.isFavorite !== undefined) data.isFavorite = input.isFavorite;
  if (input.folderId !== undefined) data.folder = input.folderId ? { connect: { id: input.folderId } } : { disconnect: true };
  if (input.utm !== undefined) data.utm = jsonOrNull(input.utm);

  if (input.content !== undefined) {
    const validated = validateContentForType(existing.type, input.content);
    if (!validated.ok) throw new QrValidationError(validated.errors);
    data.content = validated.content as Prisma.InputJsonValue;
  }

  if (input.customDomainId !== undefined) {
    if (input.customDomainId) {
      const domain = await prisma.customDomain.findFirst({
        where: { id: input.customDomainId, workspaceId: ctx.workspaceId },
      });
      if (!domain) throw new QrValidationError({ customDomainId: 'That domain does not exist' });
      data.customDomain = { connect: { id: domain.id } };
    } else {
      data.customDomain = { disconnect: true };
    }
  }

  if (input.slug !== undefined) {
    if (input.slug) {
      const slug = slugify(input.slug, 64);
      if (!slug) throw new QrValidationError({ slug: 'That short link cannot be used' });
      const domainId =
        input.customDomainId !== undefined ? input.customDomainId ?? null : existing.customDomainId;
      await assertSlugAvailable(slug, domainId, existing.id);
      data.slug = slug;
    } else {
      data.slug = existing.kind === 'DYNAMIC' && existing.customDomainId ? existing.shortCode : null;
    }
  }

  if (input.gates !== undefined) {
    const gates = input.gates;
    const passwordHash =
      gates.password === undefined
        ? existing.passwordHash
        : gates.password === null || gates.password === ''
          ? null
          : await hashPassword(gates.password);
    Object.assign(data, gatesToData(gates, passwordHash));
  }

  if (input.design !== undefined) {
    const design = resolveDesign(input.design, (existing.design ?? null) as Partial<DesignInput> | null);
    data.design = {
      upsert: {
        create: design as Prisma.QRDesignCreateWithoutQrCodeInput,
        update: design as Prisma.QRDesignUpdateWithoutQrCodeInput,
      },
    };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.qRCode.update({ where: { id: qrId }, data, include: QR_LIST_INCLUDE });

    // Dynamic destinations are replaced wholesale when the caller sends them.
    const nextUrl =
      input.content !== undefined ? (result.content as Record<string, unknown>).url : undefined;
    if (result.kind === 'DYNAMIC' && (input.smartRules !== undefined || typeof nextUrl === 'string')) {
      await tx.qRDestination.deleteMany({ where: { qrCodeId: qrId } });
      const rows: Prisma.QRDestinationCreateManyInput[] = [];
      const defaultUrl =
        typeof nextUrl === 'string'
          ? nextUrl
          : (result.destinations.find((d) => d.kind === 'DEFAULT')?.url ??
            ((result.content as Record<string, unknown>).url as string | undefined));
      if (typeof defaultUrl === 'string' && defaultUrl) {
        rows.push({ qrCodeId: qrId, kind: 'DEFAULT', url: defaultUrl, priority: 0 });
      }
      for (const rule of input.smartRules ?? []) {
        rows.push({
          qrCodeId: qrId,
          kind: rule.kind,
          matchValue: rule.matchValue,
          url: rule.url,
          priority: rule.priority ?? 1,
        });
      }
      if (rows.length > 0) await tx.qRDestination.createMany({ data: rows });
      return tx.qRCode.findUniqueOrThrow({ where: { id: qrId }, include: QR_LIST_INCLUDE });
    }

    return result;
  });

  const statusChanged = input.status !== undefined && input.status !== existing.status;
  await logSecurity({
    type: statusChanged ? (input.status === 'PAUSED' ? 'QR_PAUSED' : 'QR_UNPAUSED') : 'QR_EDITED',
    userId: ctx.userId ?? null,
    workspaceId: ctx.workspaceId,
    headers: ctx.headers ?? null,
    meta: { qrCodeId: qrId, name: updated.name, changed: Object.keys(input) },
  });
  await logActivity({
    workspaceId: ctx.workspaceId,
    userId: ctx.userId ?? null,
    action: statusChanged ? `qr.${input.status === 'PAUSED' ? 'paused' : 'resumed'}` : 'qr.updated',
    entityType: 'QRCode',
    entityId: qrId,
    meta: { name: updated.name },
  });
  await deliverWebhookEvent(ctx.workspaceId, 'qr.updated', {
    id: updated.id,
    name: updated.name,
    status: updated.status,
  }).catch(() => undefined);

  return updated;
}

export async function deleteQrCode(qrId: string, ctx: QrServiceContext, hard = false): Promise<void> {
  const existing = await prisma.qRCode.findFirst({
    where: { id: qrId, workspaceId: ctx.workspaceId },
    select: { id: true, name: true },
  });
  if (!existing) throw new QrValidationError({ id: 'QR code not found' });

  if (hard) {
    await prisma.qRCode.delete({ where: { id: qrId } });
  } else {
    // Soft delete keeps analytics history and frees the short code for nothing else.
    await prisma.qRCode.update({
      where: { id: qrId },
      data: { status: 'DELETED', deletedAt: new Date() },
    });
  }

  await logSecurity({
    type: 'QR_DELETED',
    userId: ctx.userId ?? null,
    workspaceId: ctx.workspaceId,
    headers: ctx.headers ?? null,
    meta: { qrCodeId: qrId, name: existing.name, hard },
  });
  await logActivity({
    workspaceId: ctx.workspaceId,
    userId: ctx.userId ?? null,
    action: 'qr.deleted',
    entityType: 'QRCode',
    entityId: qrId,
    meta: { name: existing.name, hard },
  });
  await deliverWebhookEvent(ctx.workspaceId, 'qr.deleted', { id: qrId, name: existing.name }).catch(() => undefined);
}

export async function duplicateQrCode(qrId: string, ctx: QrServiceContext): Promise<QrWithRelations> {
  const source = await prisma.qRCode.findFirst({
    where: { id: qrId, workspaceId: ctx.workspaceId },
    include: QR_LIST_INCLUDE,
  });
  if (!source) throw new QrValidationError({ id: 'QR code not found' });

  const { design, destinations } = source;
  const isDynamic = source.kind === 'DYNAMIC';
  const shortCode = isDynamic ? await uniqueShortCode() : null;

  const copyRow = await prisma.qRCode.create({
    data: {
      workspaceId: ctx.workspaceId,
      creatorId: ctx.userId ?? null,
      folderId: source.folderId,
      name: `${source.name} (copy)`,
      kind: source.kind,
      type: source.type,
      content: source.content as Prisma.InputJsonValue,
      shortCode,
      slug: isDynamic && source.customDomainId ? shortCode : null,
      customDomainId: source.customDomainId,
      utm: jsonOrNull(source.utm),
      scheduleEnabled: source.scheduleEnabled,
      scheduleStart: source.scheduleStart,
      scheduleEnd: source.scheduleEnd,
      timeRules: jsonOrNull(source.timeRules),
      scanLimitEnabled: source.scanLimitEnabled,
      scanLimitMax: source.scanLimitMax,
      passwordHash: source.passwordHash,
      design: design
        ? {
            create: {
              ...Object.fromEntries(
                Object.entries(design).filter(([key]) => !['id', 'qrCodeId', 'createdAt', 'updatedAt'].includes(key)),
              ),
            } as Prisma.QRDesignCreateWithoutQrCodeInput,
          }
        : undefined,
      destinations: {
        create: destinations.map((d) => ({
          kind: d.kind,
          matchValue: d.matchValue,
          url: d.url,
          priority: d.priority,
          config: jsonOrNull(d.config),
        })),
      },
    },
    select: { id: true },
  });

  const copy = await prisma.qRCode.findUniqueOrThrow({
    where: { id: copyRow.id },
    include: QR_LIST_INCLUDE,
  });

  await logActivity({
    workspaceId: ctx.workspaceId,
    userId: ctx.userId ?? null,
    action: 'qr.duplicated',
    entityType: 'QRCode',
    entityId: copy.id,
    meta: { from: qrId, name: copy.name },
  });

  return copy;
}

export async function resetQrScans(qrId: string, ctx: QrServiceContext): Promise<void> {
  const qr = await prisma.qRCode.findFirst({
    where: { id: qrId, workspaceId: ctx.workspaceId },
    select: { id: true, name: true },
  });
  if (!qr) throw new QrValidationError({ id: 'QR code not found' });

  await prisma.$transaction([
    prisma.scanEvent.deleteMany({ where: { qrCodeId: qrId } }),
    prisma.qRCode.update({
      where: { id: qrId },
      data: { scanCount: 0, uniqueScanCount: 0, firstScanAt: null, lastScanAt: null },
    }),
  ]);

  await logSecurity({
    type: 'QR_SCANS_RESET',
    userId: ctx.userId ?? null,
    workspaceId: ctx.workspaceId,
    headers: ctx.headers ?? null,
    meta: { qrCodeId: qrId, name: qr.name },
  });
}

/** Shape returned to the dashboard and the public API. */
export function serializeQr(qr: QrWithRelations) {
  return {
    id: qr.id,
    name: qr.name,
    kind: qr.kind,
    type: qr.type,
    status: qr.status,
    shortCode: qr.shortCode,
    slug: qr.slug,
    shortLink: qr.kind === 'DYNAMIC' ? shortLinkFor(qr) : null,
    content: qr.content,
    design: qr.design,
    folder: qr.folder,
    customDomain: qr.customDomain,
    destinations: qr.destinations.map((d) => ({
      kind: d.kind,
      matchValue: d.matchValue,
      url: d.url,
      priority: d.priority,
    })),
    utm: qr.utm,
    isFavorite: qr.isFavorite,
    passwordProtected: Boolean(qr.passwordHash),
    scheduleEnabled: qr.scheduleEnabled,
    scheduleStart: qr.scheduleStart,
    scheduleEnd: qr.scheduleEnd,
    timeRules: qr.timeRules,
    scanLimitEnabled: qr.scanLimitEnabled,
    scanLimitMax: qr.scanLimitMax,
    scanCount: qr.scanCount,
    uniqueScanCount: qr.uniqueScanCount,
    firstScanAt: qr.firstScanAt,
    lastScanAt: qr.lastScanAt,
    createdAt: qr.createdAt,
    updatedAt: qr.updatedAt,
    adminDisabledReason: qr.adminDisabledReason,
    encodedPayload: encodedPayloadFor(qr),
  };
}

export type SerializedQr = ReturnType<typeof serializeQr>;

export async function findQrForWorkspace(qrId: string, workspaceId: string): Promise<QrWithRelations | null> {
  return prisma.qRCode.findFirst({ where: { id: qrId, workspaceId }, include: QR_LIST_INCLUDE });
}

export async function listQrCodes(options: {
  workspaceId: string;
  search?: string;
  folderId?: string | null;
  filter?: 'all' | 'static' | 'dynamic' | 'favorites' | 'scheduled' | 'paused' | 'protected' | 'deleted';
  sort?: 'newest' | 'oldest' | 'scans' | 'name' | 'edited';
  skip?: number;
  take?: number;
  folderScopes?: string[] | null;
}): Promise<{ items: QrWithRelations[]; total: number }> {
  const where: Prisma.QRCodeWhereInput = {
    workspaceId: options.workspaceId,
    status: options.filter === 'deleted' ? 'DELETED' : { not: 'DELETED' },
  };

  if (options.folderId !== undefined && options.folderId !== null) where.folderId = options.folderId;
  if (options.folderScopes && options.folderScopes.length > 0) {
    where.folderId = { in: options.folderScopes };
  }
  if (options.search) {
    where.OR = [
      { name: { contains: options.search, mode: 'insensitive' } },
      { shortCode: { contains: options.search, mode: 'insensitive' } },
      { slug: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  switch (options.filter) {
    case 'static':
      where.kind = 'STATIC';
      break;
    case 'dynamic':
      where.kind = 'DYNAMIC';
      break;
    case 'favorites':
      where.isFavorite = true;
      break;
    case 'scheduled':
      where.scheduleEnabled = true;
      break;
    case 'paused':
      where.status = 'PAUSED';
      break;
    case 'protected':
      where.passwordHash = { not: null };
      break;
    default:
      break;
  }

  const orderBy: Prisma.QRCodeOrderByWithRelationInput =
    options.sort === 'oldest'
      ? { createdAt: 'asc' }
      : options.sort === 'scans'
        ? { scanCount: 'desc' }
        : options.sort === 'name'
          ? { name: 'asc' }
          : options.sort === 'edited'
            ? { updatedAt: 'desc' }
            : { createdAt: 'desc' };

  const [items, total] = await Promise.all([
    prisma.qRCode.findMany({
      where,
      include: QR_LIST_INCLUDE,
      orderBy,
      skip: options.skip ?? 0,
      take: Math.min(options.take ?? 25, 200),
    }),
    prisma.qRCode.count({ where }),
  ]);

  return { items, total };
}

export type { QRCode };
