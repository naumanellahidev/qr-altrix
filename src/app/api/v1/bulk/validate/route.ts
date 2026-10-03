import { z } from 'zod';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { guessMapping, importableFields, validateMapping } from '@/lib/bulk/csv';
import { qrTypeSchema } from '@/lib/validation';
import { getSettings } from '@/lib/settings';

const schema = z.object({
  type: qrTypeSchema,
  headers: z.array(z.string().max(80)).max(200).optional(),
  mapping: z.record(z.string().max(60), z.string().max(60)).optional(),
  rows: z.array(z.record(z.string().max(60), z.string().max(4000))).max(100_000).default([]),
});

/**
 * Dry-run for the import wizard: suggests a column mapping and reports every row
 * problem, so nothing is written until the spreadsheet is clean.
 */
export const POST = withApi(async (request: Request) => {
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  if (!actorCan(result.actor, 'bulk.run')) return fail('This key cannot run bulk imports', 403);

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail('The validation request is not valid', 400);

  const settings = await getSettings();
  const headers = parsed.data.headers ?? Object.keys(parsed.data.rows[0] ?? {});
  const mapping = parsed.data.mapping ?? guessMapping(parsed.data.type, headers);
  const validation = validateMapping({ type: parsed.data.type, mapping, rows: parsed.data.rows });

  return ok({
    data: {
      mapping,
      fields: importableFields(parsed.data.type).map((field) => ({
        name: field.name,
        label: field.label,
        required: Boolean(field.required),
        type: field.type,
      })),
      ...validation,
      rowCount: parsed.data.rows.length,
      overLimit: parsed.data.rows.length > settings.bulkMaxRows,
      maxRows: settings.bulkMaxRows,
    },
  });
});
