import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { fail, fileResponse, ok, withApi } from '@/lib/api/respond';
import { readFileBuffer } from '@/lib/storage';

type Context = { params: Promise<{ id: string }> };

/** GET /api/v1/bulk/:id — progress, failed rows and the archive link. */
export const GET = withApi(async (request: Request, context: Context) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  if (!actorCan(result.actor, 'qr.read')) return fail('This key cannot read import jobs', 403);

  const job = await prisma.bulkJob.findFirst({ where: { id, workspaceId: result.actor.workspaceId } });
  if (!job) return fail('Import job not found', 404);

  const url = new URL(request.url);

  // ?download=zip streams the generated archive.
  if (url.searchParams.get('download') === 'zip') {
    if (!job.zipPath) return fail('This job has no archive to download', 404);
    const buffer = await readFileBuffer(job.zipPath);
    if (!buffer) return fail('The archive is no longer available', 404);
    return fileResponse(buffer, {
      contentType: 'application/zip',
      filename: `qr-altrix-batch-${job.id.slice(0, 8)}.zip`,
    });
  }

  return ok({
    data: {
      id: job.id,
      status: job.status,
      kind: job.kind,
      type: job.type,
      totalRows: job.totalRows,
      processedRows: job.processedRows,
      successRows: job.successRows,
      failedRows: job.failedRows,
      progress: job.totalRows > 0 ? Math.round((job.processedRows / job.totalRows) * 100) : 0,
      errors: job.errors ?? [],
      createdQrIds: job.createdQrIds,
      hasArchive: Boolean(job.zipPath),
      note: job.error,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
      createdAt: job.createdAt,
    },
  });
});
