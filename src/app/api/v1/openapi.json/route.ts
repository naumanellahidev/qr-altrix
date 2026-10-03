import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { QR_TYPES } from '@/lib/qr/catalog';

// The server URL comes from the runtime environment, so this must not be baked in at
// build time — a self-hosted image is built once and configured per deployment.
export const dynamic = 'force-dynamic';

/**
 * OpenAPI 3.1 description of the public API, generated from the same constants the
 * server validates against, so the docs cannot drift from the implementation.
 */
export async function GET() {
  const qrTypes = QR_TYPES.map((type) => type.type);

  const errorResponse = {
    description: 'Problem with the request',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: false },
            error: { type: 'string' },
            fields: { type: 'object', additionalProperties: { type: 'string' } },
          },
        },
      },
    },
  };

  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'QR ALTRIX API',
      version: '1.0.0',
      description:
        'Create, edit, render and measure QR codes. Dynamic codes never expire: they resolve until the owner pauses or deletes them, an owner-enabled schedule or scan limit applies, or an administrator disables them for abuse.',
      license: { name: 'Self-hosted' },
    },
    servers: [{ url: env.appUrl, description: 'This install' }],
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'QR codes' },
      { name: 'Folders' },
      { name: 'Templates' },
      { name: 'Domains' },
      { name: 'Analytics' },
      { name: 'Bulk' },
      { name: 'Webhooks' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'An API key from Dashboard → Developers, sent as `Authorization: Bearer qra_<prefix>_<secret>`.',
        },
      },
      schemas: {
        Design: {
          type: 'object',
          description: 'Visual design. Every field is optional; omitted fields fall back to the workspace default.',
          properties: {
            bodyShape: { type: 'string', enum: ['square', 'dots', 'rounded', 'classy', 'extra-rounded', 'mosaic', 'diamond'] },
            eyeFrameShape: { type: 'string', enum: ['square', 'rounded', 'circle', 'leaf', 'leaf-flipped', 'shield', 'cut', 'frame-dots'] },
            eyeBallShape: { type: 'string', enum: ['square', 'rounded', 'circle', 'diamond', 'leaf', 'flower', 'dot-grid'] },
            fgColor: { type: 'string', example: '#0B1120' },
            bgColor: { type: 'string', example: '#FFFFFF' },
            transparentBg: { type: 'boolean' },
            invert: { type: 'boolean' },
            gradientEnabled: { type: 'boolean' },
            gradientType: { type: 'string', enum: ['linear', 'radial'] },
            gradientFrom: { type: 'string' },
            gradientTo: { type: 'string' },
            gradientRotation: { type: 'integer', minimum: 0, maximum: 360 },
            margin: { type: 'integer', minimum: 0, maximum: 12 },
            errorCorrection: { type: 'string', enum: ['L', 'M', 'Q', 'H'] },
            logoUrl: { type: 'string', nullable: true },
            logoPreset: { type: 'string', nullable: true },
            logoSize: { type: 'integer', minimum: 8, maximum: 34 },
            logoPadding: { type: 'integer', minimum: 0, maximum: 24 },
            logoShape: { type: 'string', enum: ['none', 'circle', 'square', 'rounded', 'ribbon'] },
            frame: { type: 'string', example: 'banner-bottom' },
            frameColor: { type: 'string' },
            frameTextColor: { type: 'string' },
            ctaText: { type: 'string', nullable: true, maxLength: 40 },
            ctaPosition: { type: 'string', enum: ['bottom', 'top'] },
          },
        },
        SmartRule: {
          type: 'object',
          required: ['kind', 'matchValue', 'url'],
          properties: {
            kind: { type: 'string', enum: ['COUNTRY', 'LANGUAGE', 'DEVICE', 'TIME'] },
            matchValue: { type: 'string', example: 'PK, AE' },
            url: { type: 'string', format: 'uri' },
            priority: { type: 'integer', default: 1 },
          },
        },
        Gates: {
          type: 'object',
          description: 'Owner-controlled limits. All default to off — nothing expires automatically.',
          properties: {
            password: { type: 'string', nullable: true },
            scheduleEnabled: { type: 'boolean', default: false },
            scheduleStart: { type: 'string', format: 'date-time', nullable: true },
            scheduleEnd: { type: 'string', format: 'date-time', nullable: true },
            scanLimitEnabled: { type: 'boolean', default: false },
            scanLimitMax: { type: 'integer', nullable: true },
          },
        },
        QrCode: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            kind: { type: 'string', enum: ['STATIC', 'DYNAMIC'] },
            type: { type: 'string', enum: qrTypes },
            status: { type: 'string', enum: ['ACTIVE', 'PAUSED', 'DELETED', 'ADMIN_DISABLED'] },
            shortCode: { type: 'string', nullable: true },
            slug: { type: 'string', nullable: true },
            shortLink: { type: 'string', nullable: true, description: 'The URL encoded in a dynamic code.' },
            content: { type: 'object', additionalProperties: true },
            design: { $ref: '#/components/schemas/Design' },
            scanCount: { type: 'integer' },
            uniqueScanCount: { type: 'integer' },
            firstScanAt: { type: 'string', format: 'date-time', nullable: true },
            lastScanAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            encodedPayload: { type: 'string', description: 'The exact string encoded in the symbol.' },
          },
        },
        CreateQrCode: {
          type: 'object',
          required: ['name', 'kind', 'type', 'content'],
          properties: {
            name: { type: 'string', maxLength: 120 },
            kind: { type: 'string', enum: ['STATIC', 'DYNAMIC'] },
            type: { type: 'string', enum: qrTypes },
            content: {
              type: 'object',
              additionalProperties: true,
              description: 'Type-specific fields. For WEBSITE and other redirect types this is `{ "url": "https://…" }`.',
            },
            design: { $ref: '#/components/schemas/Design' },
            folderId: { type: 'string', nullable: true },
            templateId: { type: 'string', nullable: true },
            customDomainId: { type: 'string', nullable: true },
            slug: { type: 'string', nullable: true, description: 'Custom short link segment.' },
            utm: {
              type: 'object',
              properties: {
                source: { type: 'string' },
                medium: { type: 'string' },
                campaign: { type: 'string' },
                term: { type: 'string' },
                content: { type: 'string' },
                custom: {
                  type: 'array',
                  items: { type: 'object', properties: { key: { type: 'string' }, value: { type: 'string' } } },
                },
              },
            },
            smartRules: { type: 'array', items: { $ref: '#/components/schemas/SmartRule' } },
            gates: { $ref: '#/components/schemas/Gates' },
            isFavorite: { type: 'boolean' },
          },
        },
      },
    },
    paths: {
      '/api/v1/qr': {
        get: {
          tags: ['QR codes'],
          summary: 'List QR codes',
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'filter', in: 'query', schema: { type: 'string', enum: ['all', 'static', 'dynamic', 'favorites', 'scheduled', 'paused', 'protected', 'deleted'] } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'scans', 'name', 'edited'] } },
            { name: 'folder_id', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'per_page', in: 'query', schema: { type: 'integer', default: 25, maximum: 200 } },
          ],
          responses: {
            200: {
              description: 'A page of QR codes',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/QrCode' } },
                      meta: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          perPage: { type: 'integer' },
                          total: { type: 'integer' },
                          totalPages: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: errorResponse,
          },
        },
        post: {
          tags: ['QR codes'],
          summary: 'Create a QR code',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateQrCode' } } },
          },
          responses: {
            201: {
              description: 'The created QR code',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { ok: { type: 'boolean' }, data: { $ref: '#/components/schemas/QrCode' } },
                  },
                },
              },
            },
            400: errorResponse,
            403: errorResponse,
          },
        },
      },
      '/api/v1/qr/{id}': {
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        get: { tags: ['QR codes'], summary: 'Fetch a QR code', responses: { 200: { description: 'The QR code' }, 404: errorResponse } },
        patch: {
          tags: ['QR codes'],
          summary: 'Update a QR code',
          description: 'Any subset of the create fields, plus `status` to pause or resume. The printed pattern never changes.',
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateQrCode' } } } },
          responses: { 200: { description: 'The updated QR code' }, 400: errorResponse, 404: errorResponse },
        },
        delete: {
          tags: ['QR codes'],
          summary: 'Delete a QR code',
          parameters: [{ name: 'permanent', in: 'query', schema: { type: 'boolean', default: false } }],
          responses: { 200: { description: 'Deleted' }, 404: errorResponse },
        },
      },
      '/api/v1/qr/{id}/duplicate': {
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        post: { tags: ['QR codes'], summary: 'Duplicate a QR code', responses: { 201: { description: 'The copy' } } },
      },
      '/api/v1/qr/{id}/image': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['png', 'svg', 'pdf', 'jpeg', 'webp', 'eps'], default: 'png' } },
          { name: 'size', in: 'query', schema: { type: 'integer', default: 1024, minimum: 64, maximum: 4096 } },
          { name: 'download', in: 'query', schema: { type: 'boolean', default: true } },
        ],
        get: {
          tags: ['QR codes'],
          summary: 'Render the code to a file',
          responses: { 200: { description: 'The rendered file', content: { 'image/png': {}, 'image/svg+xml': {}, 'application/pdf': {} } } },
        },
      },
      '/api/v1/qr/{id}/stats': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'timezone', in: 'query', schema: { type: 'string', default: 'UTC' } },
        ],
        get: { tags: ['Analytics'], summary: 'Scan analytics for one code', responses: { 200: { description: 'Analytics' } } },
      },
      '/api/v1/qr/{id}/reset-scans': {
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        post: { tags: ['Analytics'], summary: 'Clear analytics for one code', responses: { 200: { description: 'Reset' } } },
      },
      '/api/v1/qr/bulk-action': {
        post: {
          tags: ['QR codes'],
          summary: 'Apply one action to many codes',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['ids', 'action'],
                  properties: {
                    ids: { type: 'array', items: { type: 'string' }, maxItems: 2000 },
                    action: { type: 'string', enum: ['pause', 'resume', 'delete', 'favorite', 'unfavorite', 'move', 'resetScans'] },
                    folderId: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'How many were affected' }, 403: errorResponse },
        },
      },
      '/api/v1/folders': {
        get: { tags: ['Folders'], summary: 'List folders', responses: { 200: { description: 'Folders with code counts' } } },
        post: {
          tags: ['Folders'],
          summary: 'Create a folder',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, color: { type: 'string' } } },
              },
            },
          },
          responses: { 201: { description: 'The folder' }, 409: errorResponse },
        },
      },
      '/api/v1/folders/{id}': {
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        patch: { tags: ['Folders'], summary: 'Rename or recolour a folder', responses: { 200: { description: 'The folder' } } },
        delete: {
          tags: ['Folders'],
          summary: 'Delete a folder',
          description: 'QR codes inside the folder are kept and moved to "no folder".',
          responses: { 200: { description: 'Deleted' } },
        },
      },
      '/api/v1/templates': {
        get: { tags: ['Templates'], summary: 'List design templates', responses: { 200: { description: 'Templates' } } },
        post: { tags: ['Templates'], summary: 'Create a design template', responses: { 201: { description: 'The template' } } },
      },
      '/api/v1/domains': {
        get: { tags: ['Domains'], summary: 'List custom domains with their DNS records', responses: { 200: { description: 'Domains' } } },
        post: { tags: ['Domains'], summary: 'Add a custom domain', responses: { 201: { description: 'The domain' } } },
      },
      '/api/v1/stats': {
        get: {
          tags: ['Analytics'],
          summary: 'Workspace analytics, or a CSV/XLSX export',
          parameters: [
            { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'qr_code_id', in: 'query', schema: { type: 'string' } },
            { name: 'folder_id', in: 'query', schema: { type: 'string' } },
            { name: 'timezone', in: 'query', schema: { type: 'string', default: 'UTC' } },
            { name: 'format', in: 'query', schema: { type: 'string', enum: ['csv', 'xlsx'] } },
          ],
          responses: { 200: { description: 'Analytics or a file' } },
        },
        delete: { tags: ['Analytics'], summary: 'Reset analytics', responses: { 200: { description: 'How many rows were removed' } } },
      },
      '/api/v1/bulk': {
        get: { tags: ['Bulk'], summary: 'List recent import jobs', responses: { 200: { description: 'Jobs' } } },
        post: {
          tags: ['Bulk'],
          summary: 'Start a bulk import',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['kind', 'type', 'mapping', 'rows'],
                  properties: {
                    kind: { type: 'string', enum: ['STATIC', 'DYNAMIC'] },
                    type: { type: 'string', enum: qrTypes },
                    mapping: {
                      type: 'object',
                      additionalProperties: { type: 'string' },
                      description: 'Maps a content field name to a column name, plus optional `name`, `slug` and `folder`.',
                    },
                    rows: { type: 'array', items: { type: 'object', additionalProperties: { type: 'string' } } },
                    folderId: { type: 'string', nullable: true },
                    templateId: { type: 'string', nullable: true },
                    customDomainId: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'The queued job' }, 400: errorResponse },
        },
      },
      '/api/v1/bulk/{id}': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'download', in: 'query', schema: { type: 'string', enum: ['zip'] } },
        ],
        get: { tags: ['Bulk'], summary: 'Import progress, failed rows, or the ZIP archive', responses: { 200: { description: 'Job state' } } },
      },
      '/api/v1/bulk/validate': {
        post: { tags: ['Bulk'], summary: 'Dry-run a mapping and get every row problem', responses: { 200: { description: 'Validation result' } } },
      },
      '/api/v1/webhooks': {
        get: { tags: ['Webhooks'], summary: 'List webhooks', responses: { 200: { description: 'Webhooks' } } },
        post: {
          tags: ['Webhooks'],
          summary: 'Create a webhook',
          description:
            'Deliveries are signed: `x-qraltrix-signature: sha256=<hmac>` over `<timestamp>.<body>` using the webhook secret.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['url', 'events'],
                  properties: {
                    url: { type: 'string', format: 'uri' },
                    events: {
                      type: 'array',
                      items: {
                        type: 'string',
                        enum: ['qr.created', 'qr.updated', 'qr.deleted', 'qr.scanned', 'bulk.completed', 'feedback.received'],
                      },
                    },
                    isActive: { type: 'boolean', default: true },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'The webhook, including its signing secret' } },
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
    },
  });
}
