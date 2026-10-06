import { z } from 'zod';
import { getTypeDef, QR_TYPES } from './qr/catalog';
import { isValidHttpUrl } from './utils';

/** All request bodies are validated here — nothing reaches Prisma unvalidated. */

export const emailSchema = z
  .string()
  .trim()
  .min(3, 'Enter your email address')
  .max(200)
  .email('That email address does not look right')
  .transform((v) => v.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(200, 'That password is too long')
  .refine((v) => /[a-zA-Z]/.test(v) && /[0-9]/.test(v), {
    message: 'Mix letters and numbers so your account stays safe',
  });

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().max(80).optional(),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms to continue' }) }),
  draftSessionId: z.string().max(80).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password').max(200),
  code: z.string().trim().max(12).optional(),
  draftSessionId: z.string().max(80).optional(),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  token: z.string().min(16).max(200),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: passwordSchema,
});

// ---------------------------------------------------------------------- design

const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, 'Use a hex colour such as #4F46E5');

export const designSchema = z.object({
  bodyShape: z.enum(['square', 'dots', 'rounded', 'classy', 'extra-rounded', 'mosaic', 'diamond']).default('rounded'),
  eyeFrameShape: z
    .enum(['square', 'rounded', 'circle', 'leaf', 'leaf-flipped', 'shield', 'cut', 'frame-dots'])
    .default('rounded'),
  eyeBallShape: z.enum(['square', 'rounded', 'circle', 'diamond', 'leaf', 'flower', 'dot-grid']).default('rounded'),
  fgColor: hexColor.default('#0B1120'),
  bgColor: hexColor.default('#FFFFFF'),
  transparentBg: z.boolean().default(false),
  invert: z.boolean().default(false),
  gradientEnabled: z.boolean().default(false),
  gradientType: z.enum(['linear', 'radial']).default('linear'),
  gradientFrom: hexColor.default('#4F46E5'),
  gradientTo: hexColor.default('#0EA5E9'),
  gradientRotation: z.number().int().min(0).max(360).default(45),
  eyeColor: hexColor.nullable().optional(),
  eyeBallColor: hexColor.nullable().optional(),
  margin: z.number().int().min(0).max(12).default(4),
  errorCorrection: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  logoUrl: z.string().max(2000).nullable().optional(),
  logoPreset: z.string().max(60).nullable().optional(),
  logoSize: z.number().int().min(8).max(34).default(22),
  logoPadding: z.number().int().min(0).max(24).default(6),
  logoShape: z.enum(['none', 'circle', 'square', 'rounded', 'ribbon']).default('none'),
  frame: z.string().max(40).default('none'),
  frameColor: hexColor.default('#4F46E5'),
  frameTextColor: hexColor.default('#FFFFFF'),
  ctaText: z.string().max(40).nullable().optional(),
  ctaPosition: z.enum(['bottom', 'top']).default('bottom'),
});

export type DesignInput = z.infer<typeof designSchema>;

// -------------------------------------------------------------------- content

const QR_TYPE_VALUES = QR_TYPES.map((t) => t.type) as [string, ...string[]];
export const qrTypeSchema = z.enum(QR_TYPE_VALUES);

export const utmSchema = z
  .object({
    source: z.string().trim().max(120).optional(),
    medium: z.string().trim().max(120).optional(),
    campaign: z.string().trim().max(120).optional(),
    term: z.string().trim().max(120).optional(),
    content: z.string().trim().max(120).optional(),
    custom: z
      .array(z.object({ key: z.string().trim().min(1).max(60), value: z.string().trim().max(200) }))
      .max(12)
      .optional(),
  })
  // null means "no UTM parameters" (the builder sends it when every field is empty, and
  // on an edit it clears them); undefined leaves the stored value alone.
  .nullable()
  .optional();

export const smartRuleSchema = z.object({
  kind: z.enum(['COUNTRY', 'LANGUAGE', 'DEVICE', 'TIME']),
  matchValue: z.string().trim().min(1).max(120),
  url: z.string().trim().max(2000).refine(isValidHttpUrl, 'Enter a full URL starting with https://'),
  priority: z.number().int().min(0).max(999).default(0),
});

export const timeRuleSchema = z.object({
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM'),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM'),
  url: z.string().trim().max(2000).refine(isValidHttpUrl, 'Enter a full URL').optional(),
});

export const slugSchema = z
  .string()
  .trim()
  .min(2, 'Use at least 2 characters')
  .max(64)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, 'Letters, numbers, hyphen and underscore only');

/**
 * Content is type-specific, so it is validated against the catalogue instead of a
 * hand-written schema per type. That keeps a new QR type to a single declaration.
 */
export interface ContentValidationResult {
  ok: boolean;
  errors: Record<string, string>;
  content: Record<string, unknown>;
}

export function validateContentForType(type: string, raw: unknown): ContentValidationResult {
  const def = getTypeDef(type);
  const errors: Record<string, string> = {};
  if (!def) {
    return { ok: false, errors: { type: 'Unknown QR code type' }, content: {} };
  }
  const input = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const content: Record<string, unknown> = {};

  for (const field of def.fields) {
    const value = input[field.name];
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);

    if (isEmpty) {
      if (field.required) errors[field.name] = `${field.label} is required`;
      if (field.defaultValue !== undefined) content[field.name] = field.defaultValue;
      continue;
    }

    switch (field.type) {
      case 'url': {
        const str = String(value).trim();
        const normalized = /^[a-z][a-z0-9+.-]*:\/\//i.test(str) ? str : `https://${str}`;
        if (!isValidHttpUrl(normalized)) {
          errors[field.name] = `${field.label} must be a valid web address`;
        } else {
          content[field.name] = normalized;
        }
        break;
      }
      case 'email': {
        const parsed = z.string().email().safeParse(String(value).trim());
        if (!parsed.success) errors[field.name] = `${field.label} must be a valid email`;
        else content[field.name] = parsed.data;
        break;
      }
      case 'number': {
        const num = Number(value);
        if (!Number.isFinite(num)) errors[field.name] = `${field.label} must be a number`;
        else content[field.name] = num;
        break;
      }
      case 'switch':
        content[field.name] = Boolean(value);
        break;
      case 'repeater': {
        if (!Array.isArray(value)) {
          errors[field.name] = `${field.label} is invalid`;
          break;
        }
        const max = field.max ?? 100;
        const rows = value.slice(0, max).map((row) => {
          const source = (typeof row === 'object' && row !== null ? row : {}) as Record<string, unknown>;
          const out: Record<string, unknown> = {};
          for (const sub of field.itemFields ?? []) {
            const subValue = source[sub.name];
            if (subValue === undefined || subValue === null) continue;
            if (sub.type === 'url') {
              const str = String(subValue).trim();
              if (str === '') continue;
              out[sub.name] = /^[a-z][a-z0-9+.-]*:\/\//i.test(str) ? str : `https://${str}`;
            } else if (sub.type === 'switch') {
              out[sub.name] = Boolean(subValue);
            } else {
              out[sub.name] = String(subValue).slice(0, 2000);
            }
          }
          return out;
        });
        const nonEmpty = rows.filter((row) => Object.values(row).some((v) => v !== '' && v !== undefined));
        if (field.required && nonEmpty.length === 0) {
          errors[field.name] = `Add at least one ${field.label.toLowerCase().replace(/s$/, '')}`;
        }
        content[field.name] = nonEmpty;
        break;
      }
      case 'files': {
        if (!Array.isArray(value)) {
          errors[field.name] = `${field.label} is invalid`;
          break;
        }
        content[field.name] = value.slice(0, field.max ?? 40).map((item) => {
          if (typeof item === 'string') return { url: item };
          const source = (item ?? {}) as Record<string, unknown>;
          return {
            url: String(source.url ?? '').slice(0, 2000),
            name: source.name ? String(source.name).slice(0, 200) : undefined,
            caption: source.caption ? String(source.caption).slice(0, 300) : undefined,
          };
        });
        break;
      }
      case 'file': {
        if (typeof value === 'string') content[field.name] = { url: value.slice(0, 2000) };
        else {
          const source = (value ?? {}) as Record<string, unknown>;
          content[field.name] = {
            url: String(source.url ?? '').slice(0, 2000),
            name: source.name ? String(source.name).slice(0, 200) : undefined,
            size: typeof source.size === 'number' ? source.size : undefined,
          };
        }
        break;
      }
      case 'textarea':
        content[field.name] = String(value).slice(0, field.max ?? 5000);
        break;
      default:
        content[field.name] = String(value).slice(0, field.max && field.max > 100 ? field.max : 500);
    }
  }

  // A few types accept either of two fields; make sure at least one is present.
  if (type === 'VIDEO' && !content.videoUrl && !content.file) {
    errors.videoUrl = 'Add a video link or upload a file';
  }
  if (type === 'AUDIO' && !content.audioUrl && !content.file) {
    errors.audioUrl = 'Add an audio link or upload a file';
  }
  if (type === 'APP_STORE' && !content.iosUrl && !content.androidUrl && !content.otherUrl) {
    errors.iosUrl = 'Add at least one store link';
  }
  if (type === 'LOCATION' && !content.query && (!content.latitude || !content.longitude)) {
    errors.latitude = 'Add coordinates or an address to search';
  }

  return { ok: Object.keys(errors).length === 0, errors, content };
}

// ------------------------------------------------------------------- QR codes

export const qrGatesSchema = z.object({
  password: z.string().max(100).nullable().optional(),
  scheduleEnabled: z.boolean().default(false),
  scheduleStart: z.string().datetime({ offset: true }).nullable().optional(),
  scheduleEnd: z.string().datetime({ offset: true }).nullable().optional(),
  timeRules: z.array(timeRuleSchema).max(21).nullable().optional(),
  scanLimitEnabled: z.boolean().default(false),
  scanLimitMax: z.number().int().min(1).max(100_000_000).nullable().optional(),
});

export const qrCreateSchema = z.object({
  name: z.string().trim().min(1, 'Give the code a name you will recognise later').max(120),
  kind: z.enum(['STATIC', 'DYNAMIC']),
  type: qrTypeSchema,
  content: z.unknown(),
  design: designSchema.partial().optional(),
  folderId: z.string().cuid().nullable().optional(),
  templateId: z.string().cuid().nullable().optional(),
  customDomainId: z.string().cuid().nullable().optional(),
  slug: slugSchema.nullable().optional(),
  utm: utmSchema,
  smartRules: z.array(smartRuleSchema).max(60).optional(),
  gates: qrGatesSchema.partial().optional(),
  isFavorite: z.boolean().optional(),
});

export const qrUpdateSchema = qrCreateSchema.partial().extend({
  status: z.enum(['ACTIVE', 'PAUSED']).optional(),
});

export const bulkActionSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, 'Select at least one QR code').max(2000),
  action: z.enum(['pause', 'resume', 'delete', 'favorite', 'unfavorite', 'move', 'resetScans']),
  folderId: z.string().cuid().nullable().optional(),
});

// --------------------------------------------------------------- other models

export const folderSchema = z.object({
  name: z.string().trim().min(1, 'Name the folder').max(60),
  color: hexColor.nullable().optional(),
});

export const templateSchema = z.object({
  name: z.string().trim().min(1, 'Name the template').max(60),
  design: designSchema.partial(),
  isDefault: z.boolean().optional(),
});

export const domainSchema = z.object({
  host: z
    .string()
    .trim()
    .toLowerCase()
    .min(4, 'Enter a domain such as links.yourbrand.com')
    .max(253)
    .regex(
      /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/,
      'Enter a bare domain or subdomain, without https:// or a path',
    ),
});

export const apiKeySchema = z.object({
  name: z.string().trim().min(1, 'Name the key so you know where it is used').max(60),
  scopes: z
    .array(z.enum(['qr:read', 'qr:write', 'stats:read', 'folders:write', 'bulk:write', 'webhooks:write']))
    .min(1, 'Pick at least one scope'),
  rateLimit: z.number().int().min(10).max(10_000).default(600),
});

export const webhookSchema = z.object({
  url: z.string().trim().max(2000).refine(isValidHttpUrl, 'Enter an https:// endpoint'),
  events: z
    .array(z.enum(['qr.created', 'qr.updated', 'qr.deleted', 'qr.scanned', 'bulk.completed', 'feedback.received']))
    .min(1, 'Choose at least one event'),
  isActive: z.boolean().default(true),
});

export const inviteSchema = z.object({
  email: emailSchema,
  role: z.enum(['ADMIN', 'EDITOR', 'ANALYST', 'VIEWER', 'LIMITED']),
  folderScopes: z.array(z.string().cuid()).max(100).optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().max(80).optional(),
  surname: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(40).optional(),
  locale: z.string().trim().max(10).optional(),
  timezone: z.string().trim().max(60).optional(),
  dateFormat: z.enum(['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd', 'd MMM yyyy']).optional(),
  hour12: z.boolean().optional(),
  thousandsSep: z.enum([',', '.', 'space']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export const notificationSchema = z.object({
  notifyProduct: z.boolean(),
  notifySecurity: z.boolean(),
  notifyScanDigest: z.boolean(),
});

export const trackingSchema = z.object({
  ga4: z.string().trim().max(40).optional(),
  metaPixel: z.string().trim().max(40).optional(),
  gtm: z.string().trim().max(40).optional(),
});

export const platformSettingsSchema = z.object({
  allowGuestStaticDownload: z.boolean().optional(),
  allowSignups: z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),

  // Expiry policy. `expiryEnabledAt` is deliberately absent: the server stamps it so a
  // client cannot backdate the cut-off and sweep away existing codes.
  expiryEnabled: z.boolean().optional(),
  expireAfterDays: z.number().int().min(0).max(3650).optional(),
  expireInactiveAfterDays: z.number().int().min(0).max(3650).optional(),
  expiryAppliesToExisting: z.boolean().optional(),

  requireTwoFactorForAdmins: z.boolean().optional(),
  sessionIdleTimeoutMinutes: z.number().int().min(0).max(10_080).optional(),
  lockoutAfterFailedAttempts: z.number().int().min(3).max(100).optional(),
  brandingEnabled: z.boolean().optional(),
  brandingText: z.string().trim().max(60, 'Keep the credit line to 60 characters').optional(),
  analyticsRetentionDays: z.number().int().min(0).max(3650).optional(),
  maxUploadMb: z.number().int().min(1).max(500).optional(),
  bulkMaxRows: z.number().int().min(10).max(1_000_000).optional(),
  rateLimitApiPerMin: z.number().int().min(10).max(100_000).optional(),
  rateLimitAuthPerMin: z.number().int().min(3).max(1000).optional(),
  ipStorageMode: z.enum(['hashed', 'never']).optional(),
  abuseKeywords: z.array(z.string().trim().max(60)).max(200).optional(),
  maintenanceNote: z.string().trim().max(400).optional(),
  developerApiEnabled: z.boolean().optional(),
});

export const feedbackSubmissionSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
  email: z.string().trim().email().max(200).optional().or(z.literal('')),
});

export const abuseReportSchema = z.object({
  shortCode: z.string().trim().min(2).max(80),
  reason: z.enum(['phishing', 'malware', 'spam', 'illegal', 'adult', 'other']),
  details: z.string().trim().max(2000).optional(),
  reporterEmail: z.string().trim().email().max(200).optional().or(z.literal('')),
});

export const analyticsQuerySchema = z.object({
  qrCodeId: z.string().cuid().optional(),
  folderId: z.string().cuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  timezone: z.string().max(60).optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).optional(),
});

export const bulkImportSchema = z.object({
  kind: z.enum(['STATIC', 'DYNAMIC']),
  type: qrTypeSchema,
  mapping: z.record(z.string().max(60), z.string().max(60)),
  folderId: z.string().cuid().nullable().optional(),
  templateId: z.string().cuid().nullable().optional(),
  customDomainId: z.string().cuid().nullable().optional(),
  rows: z.array(z.record(z.string().max(60), z.string().max(4000))).min(1, 'The file has no rows'),
});

export const anonymousDraftSchema = z.object({
  type: qrTypeSchema,
  kind: z.enum(['STATIC', 'DYNAMIC']),
  name: z.string().trim().max(120).optional(),
  content: z.unknown(),
  design: designSchema.partial().optional(),
});

/** Flattens a ZodError into a field → message map for the UI. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
