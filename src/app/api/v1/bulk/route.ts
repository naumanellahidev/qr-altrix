import type { QrType } from '@prisma/client';
import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { created, fail, ok, readJson, withApi } from '@/lib/api/respond';
import { bulkImportSchema } from '@/lib/validation';
import { validateMapping } from '@/lib/bulk/csv';
import { getSettings } from '@/lib/settings';
import { putFile } from '@/lib/storage';
import { randomToken } from '@/lib/utils';
import { enqueueStrict } from '@/lib/queue';
import { getTypeDef } from '@/lib/qr/catalog';

/** GET /api/v1/bulk — recent import jobs. */
export const GET = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  if (!actorCan(result.actor, 'qr.read')) return fail('This key cannot read import jobs', 403);

  const jobs = await prisma.bulkJob.findMany({
    where: { workspaceId: result.actor.workspaceId },
    orderBy: { createdAt: 'desc' },
    take: 25,
  });

  return ok({
    data: jobs.map((job) => ({
      id: job.id,
      status: job.status,
      kind: job.kind,
      type: job.type,
      totalRows: job.totalRows,
      processedRows: job.processedRows,
      successRows: job.successRows,
      failedRows: job.failedRows,
      createdCount: job.createdQrIds.length,
      hasArchive: Boolean(job.zipPath),
      note: job.error,
      createdAt: job.createdAt,
      finishedAt: job.finishedAt,
    })),
  });
});

/** POST /api/v1/bulk — starts an import. Rows are validated before anything is written. */
export const POST = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'bulk.run')) return fail('This key cannot run bulk imports', 403);

  const parsed = bulkImportSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'The import request is not valid', 400);
  }
  const body = parsed.data;

  const def = getTypeDef(body.type);
  if (!def) return fail('Unknown QR code type', 400);
  if (def.kind !== body.kind) {
    return fail(`${def.label} codes are ${def.kind.toLowerCase()} codes`, 400);
  }

  const settings = await getSettings();
  if (body.rows.length > settings.bulkMaxRows) {
    return fail(
      `This server accepts up to ${settings.bulkMaxRows.toLocaleString()} rows per import. Split the file and run it again.`,
      400,
    );
  }

  const validation = validateMapping({ type: body.type, mapping: body.mapping, rows: body.rows });
  if (!validation.ok) {
    return fail(
      validation.missingRequired.length > 0
        ? `Map a column for: ${validation.missingRequired.join(', ')}`
        : `${validation.issues.length} row${validation.issues.length === 1 ? '' : 's'} need fixing before import`,
      400,
      { fields: {} },
    );
  }

  if (body.folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: body.folderId, workspaceId: actor.workspaceId },
      select: { id: true },
    });
    if (!folder) return fail('That folder does not exist', 400);
  }
  if (body.customDomainId) {
    const domain = await prisma.customDomain.findFirst({
      where: { id: body.customDomainId, workspaceId: actor.workspaceId },
      select: { id: true },
    });
    if (!domain) return fail('That domain does not exist', 400);
  }

  // Rows are parked in storage rather than the queue payload so very large files work.
  const rowsKey = `bulk/${actor.workspaceId}/${randomToken(12)}.json`;
  await putFile(rowsKey, Buffer.from(JSON.stringify(body.rows), 'utf8'), 'application/json');

  const job = await prisma.bulkJob.create({
    data: {
      workspaceId: actor.workspaceId,
      userId: actor.userId,
      kind: body.kind,
      type: body.type as QrType,
      folderId: body.folderId ?? null,
      templateId: body.templateId ?? null,
      customDomainId: body.customDomainId ?? null,
      totalRows: body.rows.length,
      mapping: { columns: body.mapping, rowsKey } as object,
    },
  });

  const mode = await enqueueStrict('bulk.process', { bulkJobId: job.id });

  return created({
    data: { id: job.id, status: job.status, totalRows: job.totalRows },
    meta: {
      // Without Redis the job already finished by the time this responds.
      processing: mode,
    },
  });
});
