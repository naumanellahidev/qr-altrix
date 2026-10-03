'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Check, Copy, ExternalLink, KeyRound, Plus, Send, Terminal, Trash2, Webhook,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTriggerLine } from '@/components/ui/tabs';
import { Alert, EmptyState } from '@/components/ui/feedback';
import { SectionHeader } from '@/components/ui/page-header';
import { ConfirmDialog } from '@/components/ui/confirm';
import { CopyField } from '@/components/ui/copy-button';
import { toast } from 'sonner';

const SCOPES = [
  { value: 'qr:read', label: 'Read QR codes', hint: 'List and fetch codes and their designs' },
  { value: 'qr:write', label: 'Create and edit QR codes', hint: 'Includes pausing and deleting' },
  { value: 'stats:read', label: 'Read analytics', hint: 'Scan totals and breakdowns, plus exports' },
  { value: 'folders:write', label: 'Manage folders', hint: 'Create, rename and delete folders' },
  { value: 'bulk:write', label: 'Run bulk imports', hint: 'Create many codes from rows' },
  { value: 'webhooks:write', label: 'Manage webhooks', hint: 'Create and remove webhook endpoints' },
];

const EVENTS = [
  { value: 'qr.created', label: 'QR code created' },
  { value: 'qr.updated', label: 'QR code updated' },
  { value: 'qr.deleted', label: 'QR code deleted' },
  { value: 'qr.scanned', label: 'QR code scanned' },
  { value: 'bulk.completed', label: 'Bulk import finished' },
  { value: 'feedback.received', label: 'Feedback submitted' },
];

export interface ApiKeyRow {
  id: string;
  name: string;
  maskedKey: string;
  scopes: string[];
  rateLimit: number;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  createdBy: string | null;
}

export interface WebhookRow {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastStatus: number | null;
  lastFiredAt: string | null;
  failureCount: number;
  secret: string;
}

export function DevelopersView({
  apiKeys,
  webhooks,
  appUrl,
}: {
  apiKeys: ApiKeyRow[];
  webhooks: WebhookRow[];
  appUrl: string;
}) {
  const router = useRouter();

  const [creatingKey, setCreatingKey] = React.useState(false);
  const [keyName, setKeyName] = React.useState('');
  const [keyScopes, setKeyScopes] = React.useState<string[]>(['qr:read', 'qr:write', 'stats:read']);
  const [rateLimit, setRateLimit] = React.useState('600');
  const [newKey, setNewKey] = React.useState<string | null>(null);

  const [creatingHook, setCreatingHook] = React.useState(false);
  const [hookUrl, setHookUrl] = React.useState('');
  const [hookEvents, setHookEvents] = React.useState<string[]>(['qr.scanned']);

  const [busy, setBusy] = React.useState(false);
  const [revoking, setRevoking] = React.useState<ApiKeyRow | null>(null);
  const [deletingHook, setDeletingHook] = React.useState<WebhookRow | null>(null);

  async function createKey() {
    if (!keyName.trim()) {
      toast.error('Name the key so you know where it is used');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/v1/apikeys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: keyName.trim(), scopes: keyScopes, rateLimit: Number(rateLimit) || 600 }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        data?: { key: string };
      };
      if (!response.ok || !payload.ok || !payload.data) {
        toast.error(payload.error ?? 'Could not create the key');
        return;
      }
      setNewKey(payload.data.key);
      setKeyName('');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function revoke(key: ApiKeyRow) {
    const response = await fetch(`/api/v1/apikeys/${key.id}`, { method: 'DELETE' });
    if (!response.ok) {
      toast.error('Could not revoke that key');
      return;
    }
    toast.success('Key revoked');
    router.refresh();
  }

  async function createHook() {
    setBusy(true);
    try {
      const response = await fetch('/api/v1/webhooks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: hookUrl.trim(), events: hookEvents, isActive: true }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not create the webhook');
        return;
      }
      toast.success('Webhook created');
      setCreatingHook(false);
      setHookUrl('');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function testHook(hook: WebhookRow) {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/webhooks/${hook.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        data?: { lastStatus: number | null };
      };
      if (payload.data?.lastStatus && payload.data.lastStatus < 400) {
        toast.success(`Endpoint replied ${payload.data.lastStatus}`);
      } else {
        toast.error(`Endpoint replied ${payload.data?.lastStatus ?? 'nothing'}`);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const curlExample = `curl -X POST ${appUrl}/api/v1/qr \\
  -H "Authorization: Bearer qra_xxxxxxxx_your_secret" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Spring poster",
    "kind": "DYNAMIC",
    "type": "WEBSITE",
    "content": { "url": "https://example.com/spring" },
    "design": { "bodyShape": "rounded", "frame": "banner-bottom", "ctaText": "SCAN ME" }
  }'`;

  return (
    <Tabs defaultValue="keys">
      <TabsList variant="underline" className="mb-6">
        <TabsTriggerLine value="keys">
          <KeyRound /> API keys
        </TabsTriggerLine>
        <TabsTriggerLine value="webhooks">
          <Webhook /> Webhooks
        </TabsTriggerLine>
        <TabsTriggerLine value="docs">
          <BookOpen /> Reference
        </TabsTriggerLine>
      </TabsList>

      {/* ------------------------------------------------------------- keys */}
      <TabsContent value="keys" className="space-y-5">
        <div className="flex justify-end">
          <Button variant="brand" onClick={() => setCreatingKey(true)}>
            <Plus /> Create API key
          </Button>
        </div>

        {apiKeys.length === 0 ? (
          <EmptyState
            icon={<KeyRound />}
            title="No API keys yet"
            description="Create a key to generate and manage QR codes from your own systems."
            action={
              <Button variant="brand" onClick={() => setCreatingKey(true)}>
                Create your first key
              </Button>
            }
          />
        ) : (
          <Card flush>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Key</TableHead>
                  <TableHead className="hidden lg:table-cell">Scopes</TableHead>
                  <TableHead className="hidden md:table-cell">Last used</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <p className="text-[13.5px] font-medium">{key.name}</p>
                      <p className="text-[11.5px] text-muted-foreground">
                        {key.rateLimit}/min · created {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell className="hidden font-mono text-[12px] text-muted-foreground sm:table-cell">
                      {key.maskedKey}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="flex flex-wrap gap-1">
                        {key.scopes.map((scope) => (
                          <Badge key={scope} variant="outline">
                            {scope}
                          </Badge>
                        ))}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-[12.5px] text-muted-foreground md:table-cell">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      {key.revokedAt ? <Badge variant="destructive">Revoked</Badge> : <Badge variant="success">Active</Badge>}
                    </TableCell>
                    <TableCell>
                      {!key.revokedAt ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setRevoking(key)}
                          aria-label={`Revoke ${key.name}`}
                        >
                          <Trash2 />
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </TabsContent>

      {/* --------------------------------------------------------- webhooks */}
      <TabsContent value="webhooks" className="space-y-5">
        <Alert tone="info" title="How delivery works">
          Every request is signed with HMAC-SHA256 in the <code>x-qraltrix-signature</code> header as{' '}
          <code>sha256=&lt;hex&gt;</code> over <code>{'<timestamp>.<body>'}</code>. An endpoint that keeps failing is
          parked rather than retried forever.
        </Alert>

        <div className="flex justify-end">
          <Button variant="brand" onClick={() => setCreatingHook(true)}>
            <Plus /> Add webhook
          </Button>
        </div>

        {webhooks.length === 0 ? (
          <EmptyState
            icon={<Webhook />}
            title="No webhooks yet"
            description="Receive scan events in your own systems as they happen."
            action={
              <Button variant="brand" onClick={() => setCreatingHook(true)}>
                Add your first webhook
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {webhooks.map((hook) => (
              <Card key={hook.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[13px]">{hook.url}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5">
                      {hook.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="warning">Parked</Badge>}
                      {hook.events.map((event) => (
                        <Badge key={event} variant="outline">
                          {event}
                        </Badge>
                      ))}
                    </p>
                    <p className="mt-1 text-[11.5px] text-muted-foreground">
                      {hook.lastFiredAt
                        ? `Last delivery ${new Date(hook.lastFiredAt).toLocaleString()} · status ${hook.lastStatus ?? 'none'}`
                        : 'Never delivered yet'}
                      {hook.failureCount > 0 ? ` · ${hook.failureCount} consecutive failures` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" loading={busy} onClick={() => void testHook(hook)}>
                      <Send /> Send test
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setDeletingHook(hook)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <CopyField label="Signing secret" value={hook.secret} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* ------------------------------------------------------------- docs */}
      <TabsContent value="docs" className="space-y-5">
        <Card className="p-5">
          <SectionHeader
            title="Quick start"
            description="Authenticate with a bearer token. Every response is JSON with an `ok` flag."
            actions={
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/developers" target="_blank">
                    <ExternalLink /> Full reference
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <a href="/api/v1/openapi.json" target="_blank" rel="noopener noreferrer">
                    OpenAPI JSON
                  </a>
                </Button>
              </div>
            }
          />
          <div className="relative">
            <pre className="overflow-x-auto rounded-xl border border-border bg-surface-muted/60 p-4 font-mono text-[12px] leading-6">
              {curlExample}
            </pre>
            <Button
              variant="outline"
              size="icon-sm"
              className="absolute right-2 top-2"
              onClick={() => {
                void navigator.clipboard.writeText(curlExample);
                toast.success('Example copied');
              }}
              aria-label="Copy example"
            >
              <Copy />
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader title="Endpoints" />
          <ul className="divide-y divide-border text-[13px]">
            {[
              ['POST', '/api/v1/qr', 'Create a QR code'],
              ['GET', '/api/v1/qr', 'List QR codes (search, filter, sort, paginate)'],
              ['GET', '/api/v1/qr/:id', 'Fetch one QR code'],
              ['PATCH', '/api/v1/qr/:id', 'Update content, design, destination or state'],
              ['DELETE', '/api/v1/qr/:id', 'Delete a QR code'],
              ['POST', '/api/v1/qr/:id/duplicate', 'Duplicate a QR code'],
              ['GET', '/api/v1/qr/:id/image', 'Render PNG, SVG, PDF, JPEG, WebP or EPS'],
              ['GET', '/api/v1/qr/:id/stats', 'Scan analytics for one code'],
              ['POST', '/api/v1/qr/:id/reset-scans', 'Clear analytics for one code'],
              ['POST', '/api/v1/qr/bulk-action', 'Pause, resume, move, favourite or delete many'],
              ['GET/POST', '/api/v1/folders', 'List or create folders'],
              ['GET', '/api/v1/stats', 'Workspace analytics, or CSV/XLSX export'],
              ['POST', '/api/v1/bulk', 'Start a bulk import'],
              ['GET', '/api/v1/bulk/:id', 'Import progress and failed rows'],
              ['GET/POST', '/api/v1/webhooks', 'List or create webhooks'],
              ['GET/POST', '/api/v1/templates', 'List or create design templates'],
              ['GET/POST', '/api/v1/domains', 'List or add custom domains'],
            ].map(([method, path, description]) => (
              <li key={path + method} className="flex flex-wrap items-center gap-3 py-2.5">
                <Badge variant={method.startsWith('GET') ? 'outline' : 'primary'} className="font-mono">
                  {method}
                </Badge>
                <code className="font-mono text-[12.5px]">{path}</code>
                <span className="text-muted-foreground">{description}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <SectionHeader title="Rate limits" description="Per key, per minute. Raise or lower it when you create the key." />
          <p className="text-[13px] leading-6 text-muted-foreground">
            Responses carry <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code> and{' '}
            <code>X-RateLimit-Reset</code>. A limited request returns <code>429</code> with <code>Retry-After</code>.
            These limits exist to stop abuse — they never cap how many QR codes you may own.
          </p>
        </Card>
      </TabsContent>

      {/* ---------------------------------------------------------- dialogs */}
      <Dialog
        open={creatingKey}
        onOpenChange={(open) => {
          setCreatingKey(open);
          if (!open) setNewKey(null);
        }}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{newKey ? 'Copy your API key now' : 'Create an API key'}</DialogTitle>
          </DialogHeader>

          {newKey ? (
            <div className="space-y-3">
              <Alert tone="warning" title="This is the only time the key is shown">
                Store it in your secret manager. If you lose it, revoke the key and create another.
              </Alert>
              <CopyField label="API key" value={newKey} />
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Key name" required help="For example: Website integration, Zapier, Print shop export.">
                <Input value={keyName} onChange={(event) => setKeyName(event.target.value)} maxLength={60} autoFocus />
              </Field>

              <Field label="Scopes" help="Grant only what the integration needs.">
                <div className="space-y-2 rounded-xl border border-border p-3">
                  {SCOPES.map((scope) => (
                    <label key={scope.value} className="flex cursor-pointer items-start gap-2.5">
                      <Checkbox
                        className="mt-0.5"
                        checked={keyScopes.includes(scope.value)}
                        onCheckedChange={(checked) =>
                          setKeyScopes((current) =>
                            checked === true ? [...current, scope.value] : current.filter((item) => item !== scope.value),
                          )
                        }
                      />
                      <span>
                        <span className="block text-[13px] font-medium">{scope.label}</span>
                        <span className="block text-[11.5px] text-muted-foreground">{scope.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Requests per minute" help="Between 10 and 10,000.">
                <Input
                  type="number"
                  min={10}
                  max={10000}
                  value={rateLimit}
                  onChange={(event) => setRateLimit(event.target.value)}
                  className="max-w-[9rem]"
                />
              </Field>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreatingKey(false);
                setNewKey(null);
              }}
            >
              {newKey ? 'Done' : 'Cancel'}
            </Button>
            {!newKey ? (
              <Button variant="brand" loading={busy} disabled={keyScopes.length === 0} onClick={() => void createKey()}>
                <Check /> Create key
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={creatingHook} onOpenChange={setCreatingHook}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Add a webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Endpoint URL" required help="Must be https in production.">
              <Input
                value={hookUrl}
                onChange={(event) => setHookUrl(event.target.value)}
                placeholder="https://your-app.com/hooks/qr-altrix"
                autoFocus
              />
            </Field>
            <Field label="Events" help="You can change these later.">
              <div className="space-y-2 rounded-xl border border-border p-3">
                {EVENTS.map((event) => (
                  <label key={event.value} className="flex cursor-pointer items-center gap-2.5 text-[13px]">
                    <Checkbox
                      checked={hookEvents.includes(event.value)}
                      onCheckedChange={(checked) =>
                        setHookEvents((current) =>
                          checked === true ? [...current, event.value] : current.filter((item) => item !== event.value),
                        )
                      }
                    />
                    <span className="flex-1">{event.label}</span>
                    <code className="font-mono text-[11.5px] text-muted-foreground">{event.value}</code>
                  </label>
                ))}
              </div>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatingHook(false)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              loading={busy}
              disabled={!hookUrl.trim() || hookEvents.length === 0}
              onClick={() => void createHook()}
            >
              <Terminal /> Create webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(revoking)}
        onOpenChange={(open) => !open && setRevoking(null)}
        title="Revoke this API key?"
        description={revoking ? `“${revoking.name}” will stop working immediately.` : ''}
        warning="Any integration using it will start getting 401 responses. QR codes already created are unaffected."
        confirmLabel="Revoke key"
        destructive
        onConfirm={async () => {
          if (revoking) await revoke(revoking);
        }}
      />

      <ConfirmDialog
        open={Boolean(deletingHook)}
        onOpenChange={(open) => !open && setDeletingHook(null)}
        title="Delete this webhook?"
        description={deletingHook ? `${deletingHook.url} will stop receiving events.` : ''}
        confirmLabel="Delete webhook"
        destructive
        onConfirm={async () => {
          if (!deletingHook) return;
          const response = await fetch(`/api/v1/webhooks/${deletingHook.id}`, { method: 'DELETE' });
          if (response.ok) {
            toast.success('Webhook deleted');
            router.refresh();
          } else {
            toast.error('Could not delete the webhook');
          }
        }}
      />
    </Tabs>
  );
}
