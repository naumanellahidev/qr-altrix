import 'server-only';
import type { QrKind, QrType } from '@prisma/client';
import { prisma } from '../db';
import { logger } from '../logger';
import { putFile, readFileBuffer } from '../storage';
import { rowToContent } from '../bulk/csv';
import { createQrCode, encodedPayloadFor, QrValidationError } from '../qr/service';
import { exportQr } from '../qr/export';
import { logActivity, logSecurity } from '../audit';
import { deliverWebhookEvent } from './webhook';
import { DEFAULT_DESIGN } from '../qr/types';
import type { DesignInput } from '../validation';

/** How many PNGs are packed into the download archive before we stop (memory guard). */
const ZIP_LIMIT = 1000;
const PROGRESS_EVERY = 25;

interface BulkMapping {
  columns: Record<string, string>;
  rowsKey: string;
}

export async function processBulkJob({ bulkJobId }: { bulkJobId: string }): Promise<void> {
  const job = await prisma.bulkJob.findUnique({ where: { id: bulkJobId } });
  if (!job) return;
  if (job.status === 'RUNNING' || job.status === 'COMPLETED') return;

  const mapping = job.mapping as unknown as BulkMapping | null;
  if (!mapping?.rowsKey) {
    await prisma.bulkJob.update({
      where: { id: bulkJobId },
      data: { status: 'FAILED', error: 'The uploaded rows could not be found.', finishedAt: new Date() },
    });
    return;
  }

  const buffer = await readFileBuffer(mapping.rowsKey);
  if (!buffer) {
    await prisma.bulkJob.update({
      where: { id: bulkJobId },
      data: { status: 'FAILED', error: 'The uploaded rows expired before processing.', finishedAt: new Date() },
    });
    return;
  }

  let rows: Record<string, string>[] = [];
  try {
    rows = JSON.parse(buffer.toString('utf8')) as Record<string, string>[];
  } catch {
    await prisma.bulkJob.update({
      where: { id: bulkJobId },
      data: { status: 'FAILED', error: 'The uploaded rows were malformed.', finishedAt: new Date() },
    });
    return;
  }

  await prisma.bulkJob.update({
    where: { id: bulkJobId },
    data: { status: 'RUNNING', startedAt: new Date(), totalRows: rows.length, processedRows: 0 },
  });

  let templateDesign: Partial<DesignInput> | null = null;
  if (job.templateId) {
    const template = await prisma.qRTemplate.findFirst({
      where: { id: job.templateId, workspaceId: job.workspaceId },
    });
    templateDesign = (template?.design as Partial<DesignInput> | undefined) ?? null;
  }

  const workspaceId = job.workspaceId;
  const defaultFolderId = job.folderId ?? null;
  const folderCache = new Map<string, string>();

  /** Folder names in the CSV are matched case-insensitively and created on demand. */
  async function resolveFolder(name: string | undefined): Promise<string | null> {
    const trimmed = name?.trim();
    if (!trimmed) return defaultFolderId;
    const key = trimmed.toLowerCase();
    const cached = folderCache.get(key);
    if (cached) return cached;
    const existing = await prisma.folder.findFirst({
      where: { workspaceId, name: { equals: trimmed, mode: 'insensitive' } },
    });
    const folder =
      existing ?? (await prisma.folder.create({ data: { workspaceId, name: trimmed.slice(0, 60) } }));
    folderCache.set(key, folder.id);
    return folder.id;
  }

  const errors: { row: number; message: string; field?: string }[] = [];
  const createdIds: string[] = [];
  let success = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const rowNumber = index + 2;
    try {
      const content = rowToContent(job.type, mapping.columns, row);
      const name =
        (mapping.columns.name ? row[mapping.columns.name] : '') ||
        `Imported code ${index + 1}`;
      const slug = mapping.columns.slug ? row[mapping.columns.slug] : undefined;
      const folderId = await resolveFolder(mapping.columns.folder ? row[mapping.columns.folder] : undefined);

      const created = await createQrCode(
        {
          name: name.slice(0, 120),
          kind: job.kind as QrKind,
          type: job.type as QrType,
          content,
          design: { ...DEFAULT_DESIGN, ...(templateDesign ?? {}) },
          folderId,
          customDomainId: job.customDomainId,
          slug: slug || null,
        },
        { workspaceId: job.workspaceId, userId: job.userId, source: 'bulk' },
      );
      createdIds.push(created.id);
      success += 1;
    } catch (error) {
      if (error instanceof QrValidationError) {
        const [field, message] = Object.entries(error.errors)[0] ?? ['row', error.message];
        errors.push({ row: rowNumber, field, message });
      } else {
        errors.push({ row: rowNumber, message: (error as Error).message });
      }
    }

    if ((index + 1) % PROGRESS_EVERY === 0 || index === rows.length - 1) {
      await prisma.bulkJob.update({
        where: { id: bulkJobId },
        data: {
          processedRows: index + 1,
          successRows: success,
          failedRows: errors.length,
          errors: errors.slice(0, 500) as object,
        },
      });
    }
  }

  // Package the generated codes so the user gets printable files straight away.
  let zipPath: string | null = null;
  let zipNote: string | null = null;
  if (createdIds.length > 0) {
    if (createdIds.length <= ZIP_LIMIT) {
      try {
        zipPath = await buildZip(bulkJobId, job.workspaceId, createdIds);
      } catch (error) {
        logger.error('bulk zip failed', { bulkJobId, error: (error as Error).message });
        zipNote = 'The archive could not be built. Download codes individually from My QR codes.';
      }
    } else {
      zipNote = `Archive skipped: ${createdIds.length} codes were created. Download them from My QR codes, or re-run in batches of ${ZIP_LIMIT}.`;
    }
  }

  const status = errors.length === 0 ? 'COMPLETED' : success > 0 ? 'PARTIAL' : 'FAILED';

  await prisma.bulkJob.update({
    where: { id: bulkJobId },
    data: {
      status,
      processedRows: rows.length,
      successRows: success,
      failedRows: errors.length,
      errors: errors.slice(0, 500) as object,
      createdQrIds: createdIds,
      zipPath,
      error: zipNote,
      finishedAt: new Date(),
    },
  });

  await logSecurity({
    type: 'BULK_IMPORT',
    userId: job.userId,
    workspaceId: job.workspaceId,
    meta: { bulkJobId, created: success, failed: errors.length },
  });
  await logActivity({
    workspaceId: job.workspaceId,
    userId: job.userId,
    action: 'bulk.completed',
    entityType: 'BulkJob',
    entityId: bulkJobId,
    meta: { created: success, failed: errors.length },
  });
  await deliverWebhookEvent(job.workspaceId, 'bulk.completed', {
    bulkJobId,
    created: success,
    failed: errors.length,
    status,
  }).catch(() => undefined);
}

async function buildZip(bulkJobId: string, workspaceId: string, qrIds: string[]): Promise<string> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const used = new Set<string>();

  for (const id of qrIds) {
    const qr = await prisma.qRCode.findUnique({
      where: { id },
      include: { design: true, customDomain: { select: { host: true, status: true } } },
    });
    if (!qr) continue;

    const payload = encodedPayloadFor(qr);
    const result = await exportQr({
      data: payload,
      design: (qr.design ?? {}) as Partial<DesignInput>,
      format: 'png',
      size: 1024,
      filenameBase: qr.name,
    });

    let filename = result.filename;
    let counter = 2;
    while (used.has(filename)) {
      filename = result.filename.replace(/\.png$/, `-${counter}.png`);
      counter += 1;
    }
    used.add(filename);
    zip.file(filename, result.body);
  }

  const manifest = [
    'name,type,kind,short_link,encoded_payload',
    ...(
      await Promise.all(
        qrIds.map(async (id) => {
          const qr = await prisma.qRCode.findUnique({
            where: { id },
            include: { customDomain: { select: { host: true, status: true } } },
          });
          if (!qr) return null;
          const payload = encodedPayloadFor(qr);
          const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;
          return [cell(qr.name), qr.type, qr.kind, cell(qr.kind === 'DYNAMIC' ? payload : ''), cell(payload)].join(',');
        }),
      )
    ).filter(Boolean),
  ].join('\n');
  zip.file('qr-codes.csv', manifest);

  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const key = `bulk/${workspaceId}/${bulkJobId}.zip`;
  await putFile(key, content, 'application/zip');
  return key;
}
