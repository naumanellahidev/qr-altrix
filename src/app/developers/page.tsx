import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Code2, Download, KeyRound, Terminal, Webhook } from 'lucide-react';
import { env } from '@/lib/env';
import { getAuthContext } from '@/lib/auth';
import { QR_TYPES } from '@/lib/qr/catalog';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader, SectionHeader } from '@/components/ui/page-header';
import { CodeBlock } from '@/components/marketing/code-block';

export const metadata: Metadata = {
  title: 'Developers & API',
  description:
    'REST API for creating, editing, rendering and measuring QR codes. Scoped keys, signed webhooks and an OpenAPI description.',
};

export const dynamic = 'force-dynamic';

const ENDPOINTS: { method: string; path: string; description: string; scope: string }[] = [
  { method: 'POST', path: '/api/v1/qr', description: 'Create a QR code', scope: 'qr:write' },
  { method: 'GET', path: '/api/v1/qr', description: 'List codes with search, filters, sort and paging', scope: 'qr:read' },
  { method: 'GET', path: '/api/v1/qr/:id', description: 'Fetch one code', scope: 'qr:read' },
  { method: 'PATCH', path: '/api/v1/qr/:id', description: 'Change content, destination, design or state', scope: 'qr:write' },
  { method: 'DELETE', path: '/api/v1/qr/:id', description: 'Delete a code', scope: 'qr:write' },
  { method: 'POST', path: '/api/v1/qr/:id/duplicate', description: 'Duplicate a code', scope: 'qr:write' },
  { method: 'GET', path: '/api/v1/qr/:id/image', description: 'Render PNG, SVG, PDF, JPEG, WebP or EPS', scope: 'qr:read' },
  { method: 'GET', path: '/api/v1/qr/:id/stats', description: 'Scan analytics for one code', scope: 'stats:read' },
  { method: 'POST', path: '/api/v1/qr/:id/reset-scans', description: 'Clear analytics for one code', scope: 'qr:write' },
  { method: 'POST', path: '/api/v1/qr/bulk-action', description: 'Pause, resume, move, favourite or delete many', scope: 'qr:write' },
  { method: 'GET', path: '/api/v1/folders', description: 'List folders with code counts', scope: 'qr:read' },
  { method: 'POST', path: '/api/v1/folders', description: 'Create a folder', scope: 'folders:write' },
  { method: 'GET', path: '/api/v1/templates', description: 'List design templates', scope: 'qr:read' },
  { method: 'GET', path: '/api/v1/domains', description: 'List custom domains and their DNS records', scope: 'qr:read' },
  { method: 'GET', path: '/api/v1/stats', description: 'Workspace analytics, or a CSV/XLSX export', scope: 'stats:read' },
  { method: 'POST', path: '/api/v1/bulk', description: 'Start a bulk import', scope: 'bulk:write' },
  { method: 'GET', path: '/api/v1/bulk/:id', description: 'Import progress, failed rows, ZIP archive', scope: 'qr:read' },
  { method: 'POST', path: '/api/v1/webhooks', description: 'Create a signed webhook endpoint', scope: 'webhooks:write' },
];

export default async function DevelopersDocsPage() {
  const auth = await getAuthContext().catch(() => null);
  const base = env.appUrl;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader signedIn={Boolean(auth)} />

      <main className="container flex-1 py-10">
        <PageHeader
          title="Developers & API"
          description="Everything the dashboard can do, your code can do too. Scoped bearer keys, predictable JSON, signed webhooks."
          actions={
            <>
              <Button asChild variant="outline">
                <a href="/api/v1/openapi.json" target="_blank" rel="noopener noreferrer">
                  <Download /> OpenAPI JSON
                </a>
              </Button>
              <Button asChild variant="brand">
                <Link href={auth ? '/dashboard/developers' : '/signup'}>
                  <KeyRound /> {auth ? 'Get an API key' : 'Create a free account'}
                </Link>
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-5">
            <Card className="p-5">
              <SectionHeader
                title="Authentication"
                description="Create a key in Dashboard → Developers. It is shown once; store it in your secret manager."
              />
              <CodeBlock
                language="bash"
                code={`curl ${base}/api/v1/qr \\
  -H "Authorization: Bearer qra_xxxxxxxx_your_secret"`}
              />
              <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
                Keys carry scopes, so an integration that only reads cannot delete. Rate limits are per key and reported
                in <code>X-RateLimit-*</code> headers; a limited request returns <code>429</code> with{' '}
                <code>Retry-After</code>. These limits exist to stop abuse — there is no cap on how many codes you own.
              </p>
            </Card>

            <Card className="p-5">
              <SectionHeader title="Create a dynamic code" description="One call. The short link comes back in the response." />
              <CodeBlock
                language="bash"
                code={`curl -X POST ${base}/api/v1/qr \\
  -H "Authorization: Bearer $QR_ALTRIX_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Spring poster",
    "kind": "DYNAMIC",
    "type": "WEBSITE",
    "content": { "url": "https://example.com/spring" },
    "slug": "spring",
    "design": {
      "bodyShape": "rounded",
      "gradientEnabled": true,
      "gradientFrom": "#4F46E5",
      "gradientTo": "#0EA5E9",
      "frame": "banner-bottom",
      "ctaText": "SCAN ME"
    },
    "utm": { "source": "poster", "medium": "print", "campaign": "spring-2026" }
  }'`}
              />
              <CodeBlock
                className="mt-3"
                language="json"
                code={`{
  "ok": true,
  "data": {
    "id": "clz1a2b3c4d5e6f7g8h9",
    "name": "Spring poster",
    "kind": "DYNAMIC",
    "status": "ACTIVE",
    "shortLink": "${base.replace(/^https?:\/\//, 'https://')}/q/spring",
    "encodedPayload": "${base.replace(/^https?:\/\//, 'https://')}/q/spring",
    "scanCount": 0
  }
}`}
              />
            </Card>

            <Card className="p-5">
              <SectionHeader
                title="Change where a printed code points"
                description="The pattern never changes, so nothing needs reprinting."
              />
              <CodeBlock
                language="bash"
                code={`curl -X PATCH ${base}/api/v1/qr/$ID \\
  -H "Authorization: Bearer $QR_ALTRIX_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "content": { "url": "https://example.com/summer" } }'`}
              />
            </Card>

            <Card className="p-5">
              <SectionHeader title="Render a file" description="Raster or vector, any size up to 4096 px." />
              <CodeBlock
                language="bash"
                code={`curl -L "${base}/api/v1/qr/$ID/image?format=svg" \\
  -H "Authorization: Bearer $QR_ALTRIX_KEY" -o code.svg

curl -L "${base}/api/v1/qr/$ID/image?format=pdf&size=2048" \\
  -H "Authorization: Bearer $QR_ALTRIX_KEY" -o code.pdf`}
              />
            </Card>

            <Card className="p-5">
              <SectionHeader
                title="Webhooks"
                description="Verify the signature before trusting a delivery."
                actions={<Badge variant="outline">HMAC-SHA256</Badge>}
              />
              <CodeBlock
                language="javascript"
                code={`import { createHmac, timingSafeEqual } from 'node:crypto';

export function verify(req, secret) {
  const timestamp = req.headers['x-qraltrix-timestamp'];
  const signature = String(req.headers['x-qraltrix-signature'] ?? '').replace('sha256=', '');
  const expected = createHmac('sha256', secret)
    .update(\`\${timestamp}.\${req.rawBody}\`)
    .digest('hex');

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}`}
              />
              <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
                Events: <code>qr.created</code>, <code>qr.updated</code>, <code>qr.deleted</code>,{' '}
                <code>qr.scanned</code>, <code>bulk.completed</code>, <code>feedback.received</code>.
              </p>
            </Card>

            <Card className="p-5">
              <SectionHeader title="Endpoints" />
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2 pr-3 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Method
                      </th>
                      <th className="py-2 pr-3 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Path
                      </th>
                      <th className="py-2 pr-3 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                        What it does
                      </th>
                      <th className="py-2 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Scope
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENDPOINTS.map((endpoint) => (
                      <tr key={endpoint.method + endpoint.path} className="border-b border-border last:border-0">
                        <td className="py-2 pr-3">
                          <Badge variant={endpoint.method === 'GET' ? 'outline' : 'primary'} className="font-mono">
                            {endpoint.method}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap py-2 pr-3 font-mono text-[12.5px]">{endpoint.path}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{endpoint.description}</td>
                        <td className="whitespace-nowrap py-2 font-mono text-[11.5px] text-muted-foreground">
                          {endpoint.scope}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="p-5">
              <SectionHeader title="On this page" className="mb-3" />
              <ul className="space-y-1.5 text-[13px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <KeyRound className="size-3.5" /> Authentication
                </li>
                <li className="flex items-center gap-2">
                  <Terminal className="size-3.5" /> Create a code
                </li>
                <li className="flex items-center gap-2">
                  <Code2 className="size-3.5" /> Change a destination
                </li>
                <li className="flex items-center gap-2">
                  <Download className="size-3.5" /> Render a file
                </li>
                <li className="flex items-center gap-2">
                  <Webhook className="size-3.5" /> Webhooks
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="size-3.5" /> Endpoints
                </li>
              </ul>
            </Card>

            <Card className="p-5">
              <SectionHeader title="QR types" description={`${QR_TYPES.length} values for the \`type\` field.`} className="mb-3" />
              <div className="flex max-h-72 flex-wrap gap-1 overflow-y-auto">
                {QR_TYPES.map((type) => (
                  <code key={type.type} className="rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[11px]">
                    {type.type}
                  </code>
                ))}
              </div>
            </Card>

            <Card className="border-success/25 bg-success/8 p-5">
              <p className="text-[13px] font-semibold text-success">Codes created by the API never expire</p>
              <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">
                The only things that stop a dynamic code are the owner pausing or deleting it, an owner-enabled schedule
                or scan limit, or an administrator disabling it for abuse.
              </p>
            </Card>

            <Button asChild variant="brand" className="w-full">
              <Link href={auth ? '/dashboard/developers' : '/signup'}>
                {auth ? 'Manage API keys' : 'Start free'} <ArrowRight />
              </Link>
            </Button>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
