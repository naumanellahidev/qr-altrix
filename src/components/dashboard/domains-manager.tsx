'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, Globe, Lock, Plus, RefreshCw, ShieldCheck, Star, Trash2, TriangleAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, EmptyState } from '@/components/ui/feedback';
import { ConfirmDialog } from '@/components/ui/confirm';
import { CopyField } from '@/components/ui/copy-button';
import { SectionHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';
import { useDateFormat, DATE, DATE_TIME, TIME } from '@/lib/hooks/use-date-format';

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  note?: string;
}

export interface DomainRow {
  id: string;
  host: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  sslStatus: 'NONE' | 'PENDING' | 'ACTIVE' | 'ERROR';
  isDefault: boolean;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  lastCheckError: string | null;
  codeCount: number;
  dns: { verification: DnsRecord; routing: DnsRecord; ssl: string };
}

export function DomainsManager({
  domains,
  fallbackShortDomain,
  canManage,
}: {
  domains: DomainRow[];
  fallbackShortDomain: string;
  canManage: boolean;
}) {
  const formatDate = useDateFormat();
  const router = useRouter();
  const [adding, setAdding] = React.useState(false);
  const [host, setHost] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<DomainRow | null>(null);

  async function addDomain() {
    setBusy('add');
    setError(null);
    try {
      const response = await fetch('/api/v1/domains', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ host: host.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? 'Could not add that domain');
        return;
      }
      toast.success('Domain added — add the DNS records to verify it');
      setAdding(false);
      setHost('');
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function act(domain: DomainRow, action: 'verify' | 'check-ssl' | 'make-default') {
    setBusy(`${domain.id}:${action}`);
    try {
      const response = await fetch(`/api/v1/domains/${domain.id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        data?: { verified?: boolean; dnsPointsHere?: boolean; sslActive?: boolean };
      };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'That action failed');
        return;
      }
      if (action === 'verify') {
        if (payload.data?.verified) toast.success('Domain verified');
        else
          toast.error(
            payload.data?.dnsPointsHere
              ? 'DNS points here, but the verification record was not found yet. It can take a few minutes.'
              : 'Not verified yet — check the DNS records and try again in a few minutes.',
          );
      }
      if (action === 'check-ssl') {
        toast[payload.data?.sslActive ? 'success' : 'error'](
          payload.data?.sslActive ? 'HTTPS is live' : 'HTTPS is not responding yet — run the certificate script.',
        );
      }
      if (action === 'make-default') toast.success('Default domain updated');
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function remove(domain: DomainRow) {
    const response = await fetch(`/api/v1/domains/${domain.id}`, { method: 'DELETE' });
    const payload = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      codesMovedToPlatformDomain?: number;
      error?: string;
    };
    if (!response.ok || !payload.ok) {
      toast.error(payload.error ?? 'Could not remove the domain');
      return;
    }
    toast.success(
      payload.codesMovedToPlatformDomain
        ? `Domain removed. ${payload.codesMovedToPlatformDomain} code(s) now use the default short link and keep working.`
        : 'Domain removed',
    );
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <Alert tone="success" title="Custom domains are free here">
        Point a subdomain at your server, verify it with one DNS record, and choose your own slug per code. There is no
        plan to upgrade.
      </Alert>

      {canManage ? (
        <div className="flex justify-end">
          <Button variant="brand" onClick={() => setAdding(true)}>
            <Plus /> Add a domain
          </Button>
        </div>
      ) : null}

      {domains.length === 0 ? (
        <EmptyState
          icon={<Globe />}
          title="No custom domains yet"
          description={`Your codes currently use ${fallbackShortDomain.replace(/^https?:\/\//, '')}. Add your own subdomain to put your brand in the link.`}
          action={
            canManage ? (
              <Button variant="brand" onClick={() => setAdding(true)}>
                Add your first domain
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <Card key={domain.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-display text-[16px] font-semibold">
                    {domain.host}
                    {domain.isDefault ? (
                      <Badge variant="primary">
                        <Star className="size-3" /> Default
                      </Badge>
                    ) : null}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
                    {domain.status === 'VERIFIED' ? (
                      <Badge variant="success">
                        <CheckCircle2 className="size-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <TriangleAlert className="size-3" /> Awaiting DNS
                      </Badge>
                    )}
                    {domain.sslStatus === 'ACTIVE' ? (
                      <Badge variant="success">
                        <Lock className="size-3" /> HTTPS active
                      </Badge>
                    ) : domain.sslStatus === 'PENDING' ? (
                      <Badge variant="outline">
                        <ShieldCheck className="size-3" /> Certificate pending
                      </Badge>
                    ) : domain.sslStatus === 'ERROR' ? (
                      <Badge variant="destructive">HTTPS error</Badge>
                    ) : null}
                    <span>{domain.codeCount} code(s)</span>
                    {domain.lastCheckedAt ? (
                      <span>Checked {formatDate(domain.lastCheckedAt, DATE_TIME)}</span>
                    ) : null}
                  </p>
                </div>

                {canManage ? (
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      loading={busy === `${domain.id}:verify`}
                      onClick={() => void act(domain, 'verify')}
                    >
                      <RefreshCw /> Check DNS
                    </Button>
                    {domain.status === 'VERIFIED' ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          loading={busy === `${domain.id}:check-ssl`}
                          onClick={() => void act(domain, 'check-ssl')}
                        >
                          <Lock /> Check HTTPS
                        </Button>
                        {!domain.isDefault ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            loading={busy === `${domain.id}:make-default`}
                            onClick={() => void act(domain, 'make-default')}
                          >
                            <Star /> Make default
                          </Button>
                        ) : null}
                      </>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleting(domain)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ) : null}
              </div>

              {domain.status !== 'VERIFIED' ? (
                <div className="mt-4 space-y-3 rounded-xl border border-border bg-surface-muted/40 p-4">
                  <SectionHeader
                    title="DNS records to add"
                    description="Add both at your DNS provider. Propagation usually takes a few minutes."
                    className="mb-0"
                  />
                  {[domain.dns.verification, domain.dns.routing].map((record) => (
                    <div key={`${record.type}-${record.name}`} className="grid grid-cols-1 gap-2 sm:grid-cols-[80px_1fr_1fr]">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Type</p>
                        <p className="font-mono text-[12.5px]">{record.type}</p>
                      </div>
                      <CopyField label="Name / host" value={record.name} />
                      <CopyField label="Value" value={record.value} />
                      {record.note ? (
                        <p className="text-[11.5px] text-muted-foreground sm:col-span-3">{record.note}</p>
                      ) : null}
                    </div>
                  ))}
                  {domain.lastCheckError ? (
                    <p className="text-[12px] text-warning">Last check: {domain.lastCheckError}</p>
                  ) : null}
                  <p className="text-[12px] leading-5 text-muted-foreground">{domain.dns.ssl}</p>
                </div>
              ) : (
                <p className="mt-3 text-[12.5px] text-muted-foreground">
                  Short links on this domain look like{' '}
                  <span className="font-mono">https://{domain.host}/your-slug</span>
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Add a custom domain</DialogTitle>
          </DialogHeader>
          <Field
            label="Domain or subdomain"
            required
            error={error}
            help="A subdomain such as links.yourbrand.com is easiest — it needs only a CNAME."
          >
            <Input
              value={host}
              onChange={(event) => setHost(event.target.value)}
              placeholder="links.yourbrand.com"
              autoFocus
              invalid={Boolean(error)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void addDomain();
              }}
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button variant="brand" loading={busy === 'add'} onClick={() => void addDomain()}>
              Add domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Remove this domain?"
        description={deleting ? `${deleting.host} will stop serving short links.` : ''}
        warning="Every QR code on this domain keeps working: they fall back to the platform short link, which still resolves by short code."
        confirmLabel="Remove domain"
        destructive
        onConfirm={async () => {
          if (deleting) await remove(deleting);
        }}
      />
    </div>
  );
}
