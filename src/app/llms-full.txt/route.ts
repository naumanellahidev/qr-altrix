import { buildLlmsFullTxt } from '@/lib/seo/llms';
import { llmsFacts, textResponse } from '@/lib/seo/llms-response';

export const dynamic = 'force-dynamic';

/** The long form of /llms.txt: every QR type, how-tos and FAQs. */
export async function GET() {
  return textResponse(buildLlmsFullTxt(await llmsFacts()));
}
