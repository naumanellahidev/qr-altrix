'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart3, CalendarClock, Check, Copy, ExternalLink, Gauge, Heart, Lock, Pause, PencilLine, Play,
  RotateCcw, Save, Trash2,
} from 'lucide-react';
import type { QrDesign } from '@/lib/qr/types';
import { getTypeDef } from '@/lib/qr/catalog';
import { compactNumber, isValidHttpUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Alert } from '@/components/ui/feedback';
import { SectionHeader } from '@/components/ui/page-header';
import { QrPreview } from '@/components/qr/qr-preview';
import { DownloadMenu } from '@/components/qr/download-menu';
import { CopyField } from '@/components/ui/copy-button';
import { ConfirmDialog } from '@/components/ui/confirm';
import { ScanSafety } from '@/components/qr/scan-safety';
import { toast } from 'sonner';
import { useDateFormat, DATE, DATE_TIME, TIME } from '@/lib/hooks/use-date-format';
import { useLiveScans } from '@/lib/hooks/use-live-scans';
import { LiveIndicator } from '@/components/dashboard/live-indicator';

export interface CodeDetailProps {
  code: {
    id: string;
    name: string;
    kind: 'STATIC' | 'DYNAMIC';
    type: string;
    status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ADMIN_DISABLED';
    payload: string;
    shortLink: string | null;
    design: Partial<QrDesign>;
    destination: string | null;
    isFavorite: boolean;
    passwordProtected: boolean;
    scheduleEnabled: boolean;
    scheduleStart: string | null;
    scheduleEnd: string | null;
    scanLimitEnabled: boolean;
    scanLimitMax: number | null;
    scanCount: number;
    uniqueScanCount: number;
    firstScanAt: string | null;
    lastScanAt: string | null;
    createdAt: string;
    updatedAt: string;
    folderName: string | null;
    adminDisabledReason: string | null;
    hosted: boolean;
  };
  permissions: { canEdit: boolean; canDelete: boolean; canResetScans: boolean; canViewStats: boolean };
  /** Present when the operator has switched the expiry policy on. */
  expiry?: {
    applies: boolean;
    expired: boolean;
    expiresAt: string | null;
    daysLeft: number | null;
    reason: 'expired' | 'expired_inactive' | null;
  };
}


export function CodeDetail({ code, permissions, expiry }: CodeDetailProps) {
  const formatDate = useDateFormat();
  const formatDateTime = (value: string | null) => formatDate(value, DATE_TIME);
  // New scans re-render the server data (counters, first/last scan) without a reload.
  const liveState = useLiveScans({ qrCodeId: code.id, onChange: () => router.refresh() });
  const router = useRouter();
  const params = useSearchParams();
  const def = getTypeDef(code.type);

  const [destination, setDestination] = React.useState(code.destination ?? '');
  const [savingDestination, setSavingDestination] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [confirm, setConfirm] = React.useState<'delete' | 'reset' | null>(null);
  const downloadRef = React.useRef<HTMLDivElement>(null);

  // Arriving from signup with ?download=1 should land on the download control.
  React.useEffect(() => {
    if (params.get('download') === '1') {
      downloadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.success('Your QR code is saved — download it below.');
    }
  }, [params]);

  const destinationChanged = destination.trim() !== (code.destination ?? '').trim();

  async function patch(body: Record<string, unknown>, message?: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/qr/${code.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not save the change');
        return false;
      }
      if (message) toast.success(message);
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function saveDestination() {
    const value = destination.trim();
    const normalized = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
    if (!isValidHttpUrl(normalized)) {
      toast.error('Enter a full web address, including https://');
      return;
    }
    setSavingDestination(true);
    try {
      await patch({ content: { url: normalized } }, 'Destination updated — the printed code is unchanged');
      setDestination(normalized);
    } finally {
      setSavingDestination(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        {code.status === 'ADMIN_DISABLED' ? (
          <Alert tone="error" title="Disabled by a platform administrator">
            {code.adminDisabledReason ?? 'This code was disabled after a safety review and cannot be edited.'}
          </Alert>
        ) : null}

        {expiry?.applies ? (
          expiry.expired ? (
            <Alert tone="error" title="This code has expired">
              {expiry.reason === 'expired_inactive'
                ? 'It went too long without a scan under this server’s expiry policy.'
                : 'It reached the end of the lifetime set by this server’s expiry policy.'}{' '}
              Anyone scanning it now sees a notice instead of your destination. Ask an administrator to extend the
              policy, or create a fresh code.
            </Alert>
          ) : expiry.daysLeft !== null && expiry.daysLeft <= 30 ? (
            <Alert tone="warning" title={`Expires in ${expiry.daysLeft} day${expiry.daysLeft === 1 ? '' : 's'}`}>
              This server has an expiry policy, and this code reaches the end of it on{' '}
              {formatDateTime(expiry.expiresAt)}. Plan a replacement, or ask an administrator to extend it.
            </Alert>
          ) : null
        ) : null}

        {code.status === 'PAUSED' ? (
          <Alert
            tone="warning"
            title="This code is paused"
            action={
              permissions.canEdit ? (
                <Button size="sm" variant="outline" loading={busy} onClick={() => void patch({ status: 'ACTIVE' }, 'Code resumed')}>
                  <Play /> Resume
                </Button>
              ) : null
            }
          >
            Anyone who scans it sees a friendly inactive page. Resume it whenever you like — nothing was lost.
          </Alert>
        ) : null}

        {/* ------------------------------------------------------- destination */}
        {code.kind === 'DYNAMIC' && !code.hosted ? (
          <Card className="p-5">
            <SectionHeader
              title="Destination"
              description="Change this any time. The printed pattern never needs reprinting."
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Field label="Where the code goes" className="flex-1">
                <Input
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="https://your-site.com/page"
                  disabled={!permissions.canEdit || code.status === 'ADMIN_DISABLED'}
                />
              </Field>
              <Button
                variant={destinationChanged ? 'brand' : 'outline'}
                loading={savingDestination}
                disabled={!destinationChanged || !permissions.canEdit}
                onClick={() => void saveDestination()}
              >
                {destinationChanged ? <Save /> : <Check />}
                {destinationChanged ? 'Save destination' : 'Saved'}
              </Button>
            </div>
          </Card>
        ) : null}

        {code.hosted ? (
          <Card className="p-5">
            <SectionHeader
              title="Hosted page"
              description="QR ALTRIX renders this content for you. Edit it in the builder."
            />
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={`/dashboard/codes/${code.id}/edit`}>
                  <PencilLine /> Edit content
                </Link>
              </Button>
              {code.shortLink ? (
                <Button asChild variant="ghost">
                  <a href={`${code.shortLink}?preview=1`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink /> Preview the page
                  </a>
                </Button>
              ) : null}
            </div>
          </Card>
        ) : null}

        {/* ------------------------------------------------------------- facts */}
        <Card className="p-5">
          <SectionHeader title="Details" />
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {[
              ['Type', `${def?.label ?? code.type} · ${code.kind === 'DYNAMIC' ? 'Dynamic' : 'Static'}`],
              ['Folder', code.folderName ?? 'No folder'],
              ['Created', formatDateTime(code.createdAt)],
              ['Last edited', formatDateTime(code.updatedAt)],
              ['First scan', formatDateTime(code.firstScanAt)],
              ['Last scan', formatDateTime(code.lastScanAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
                <dd className="min-w-0 break-words text-[13.5px]">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {code.passwordProtected ? (
              <Badge variant="outline">
                <Lock /> Password protected
              </Badge>
            ) : null}
            {code.scheduleEnabled ? (
              <Badge variant="outline">
                <CalendarClock /> Scheduled {code.scheduleStart ? `from ${formatDateTime(code.scheduleStart)}` : ''}
                {code.scheduleEnd ? ` until ${formatDateTime(code.scheduleEnd)}` : ''}
              </Badge>
            ) : null}
            {code.scanLimitEnabled ? (
              <Badge variant="outline">
                <Gauge /> Limit {compactNumber(code.scanCount)} / {compactNumber(code.scanLimitMax ?? 0)}
              </Badge>
            ) : null}
            {expiry?.applies && expiry.expiresAt ? (
              <Badge variant={expiry.expired ? 'destructive' : 'warning'}>
                <CalendarClock />
                {expiry.expired ? 'Expired' : `Expires ${formatDateTime(expiry.expiresAt)}`}
              </Badge>
            ) : null}
            {!code.passwordProtected && !code.scheduleEnabled && !code.scanLimitEnabled && !expiry?.applies ? (
              <Badge variant="success">No restrictions — resolves indefinitely</Badge>
            ) : null}
          </div>
        </Card>

        {/* ------------------------------------------------------------ actions */}
        <Card className="p-5">
          <SectionHeader title="Actions" />
          <div className="flex flex-wrap gap-2">
            {permissions.canEdit ? (
              <>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/codes/${code.id}/edit`}>
                    <PencilLine /> Edit everything
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  loading={busy}
                  disabled={code.status === 'ADMIN_DISABLED'}
                  onClick={() =>
                    void patch(
                      { status: code.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED' },
                      code.status === 'PAUSED' ? 'Code resumed' : 'Code paused',
                    )
                  }
                >
                  {code.status === 'PAUSED' ? <Play /> : <Pause />}
                  {code.status === 'PAUSED' ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="outline"
                  loading={busy}
                  onClick={() =>
                    void patch(
                      { isFavorite: !code.isFavorite },
                      code.isFavorite ? 'Removed from favourites' : 'Added to favourites',
                    )
                  }
                >
                  <Heart className={code.isFavorite ? 'fill-destructive text-destructive' : undefined} />
                  {code.isFavorite ? 'Unfavourite' : 'Favourite'}
                </Button>
                <Button
                  variant="outline"
                  loading={busy}
                  onClick={async () => {
                    const response = await fetch(`/api/v1/qr/${code.id}/duplicate`, { method: 'POST' });
                    const payload = (await response.json().catch(() => ({}))) as {
                      ok?: boolean;
                      data?: { id: string };
                      error?: string;
                    };
                    if (payload.ok && payload.data) {
                      toast.success('Duplicated');
                      router.push(`/dashboard/codes/${payload.data.id}`);
                    } else {
                      toast.error(payload.error ?? 'Could not duplicate');
                    }
                  }}
                >
                  <Copy /> Duplicate
                </Button>
              </>
            ) : null}

            {permissions.canViewStats ? (
              <Button asChild variant="outline">
                <Link href={`/dashboard/stats?qr=${code.id}`}>
                  <BarChart3 /> Analytics
                </Link>
              </Button>
            ) : null}

            {permissions.canResetScans ? (
              <Button variant="outline" onClick={() => setConfirm('reset')}>
                <RotateCcw /> Reset statistics
              </Button>
            ) : null}

            {permissions.canDelete ? (
              <Button variant="destructive-outline" onClick={() => setConfirm('delete')}>
                <Trash2 /> Delete
              </Button>
            ) : null}
          </div>
        </Card>
      </div>

      {/* ------------------------------------------------------------- preview */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <Card className="space-y-4 p-5" ref={downloadRef}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold">Your QR code</p>
            <Badge variant={code.status === 'ACTIVE' ? 'success' : code.status === 'PAUSED' ? 'warning' : 'outline'}>
              {code.status === 'ACTIVE' ? 'Active' : code.status === 'PAUSED' ? 'Paused' : code.status}
            </Badge>
          </div>

          <div className="flex justify-center rounded-2xl bg-surface-muted/60 p-4">
            <QrPreview data={code.payload} design={code.design} size={248} />
          </div>

          {code.shortLink ? <CopyField label="Short link" value={code.shortLink} /> : null}

          <DownloadMenu
            request={{ data: code.payload, design: code.design, name: code.name, qrCodeId: code.id }}
            label="Download"
            className="w-full"
          />

          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium text-muted-foreground">Scans</p>
            <LiveIndicator live={liveState.live} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border border-border p-2.5">
              <p className="text-[18px] font-semibold tabular-nums">{compactNumber(code.scanCount)}</p>
              <p className="text-[11px] text-muted-foreground">total scans</p>
            </div>
            <div className="rounded-xl border border-border p-2.5">
              <p className="text-[18px] font-semibold tabular-nums">{compactNumber(code.uniqueScanCount)}</p>
              <p className="text-[11px] text-muted-foreground">unique visitors</p>
            </div>
          </div>

          <ScanSafety design={code.design} compact />
        </Card>
      </div>

      <ConfirmDialog
        open={confirm === 'delete'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Delete this QR code?"
        description={`“${code.name}” will stop resolving for anyone who scans it.`}
        warning="Scan history is kept and the short code is never reused. Printed copies will show an inactive page."
        confirmLabel="Delete code"
        destructive
        onConfirm={async () => {
          const response = await fetch(`/api/v1/qr/${code.id}`, { method: 'DELETE' });
          if (response.ok) {
            toast.success('Code deleted');
            router.push('/dashboard/codes');
            router.refresh();
          } else {
            toast.error('Could not delete the code');
          }
        }}
      />

      <ConfirmDialog
        open={confirm === 'reset'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Reset statistics?"
        description={`All ${compactNumber(code.scanCount)} recorded scans will be removed.`}
        warning="This cannot be undone. The code itself keeps working exactly as before."
        confirmLabel="Reset statistics"
        destructive
        onConfirm={async () => {
          const response = await fetch(`/api/v1/qr/${code.id}/reset-scans`, { method: 'POST' });
          if (response.ok) {
            toast.success('Statistics reset');
            router.refresh();
          } else {
            toast.error('Could not reset the statistics');
          }
        }}
      />
    </div>
  );
}
