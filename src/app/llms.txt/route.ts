import { buildLlmsTxt } from '@/lib/seo/llms';
import { llmsFacts, textResponse } from '@/lib/seo/llms-response';

export const dynamic = 'force-dynamic';

/** Briefing for AI assistants (llmstxt.org). */
export async function GET() {
  return textResponse(buildLlmsTxt(await llmsFacts()));
}
