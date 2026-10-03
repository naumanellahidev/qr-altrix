import { csvTemplateFor } from '@/lib/bulk/csv';
import { getTypeDef } from '@/lib/qr/catalog';
import { fail, fileResponse, withApi } from '@/lib/api/respond';

/** GET /api/v1/bulk/template?type=WEBSITE — a ready-to-fill CSV for that QR type. */
export const GET = withApi(async (request: Request) => {
  const url = new URL(request.url);
  const type = (url.searchParams.get('type') ?? 'WEBSITE').toUpperCase();
  const def = getTypeDef(type);
  if (!def) return fail('Unknown QR code type', 400);

  return fileResponse(Buffer.from(csvTemplateFor(type), 'utf8'), {
    contentType: 'text/csv; charset=utf-8',
    filename: `qr-altrix-${type.toLowerCase()}-template.csv`,
  });
});
