'use client';

import * as React from 'react';
import {
  Activity, CheckCircle2, Database, HardDrive, Layers, Mail, PlayCircle, RefreshCw, Server, XCircle,
} from 'lucide-react';
import { bytesToSize, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/feedback';
import { SectionHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { toast } from 'sonner';

export interface BackupFile {
  name: string;
  sizeBytes: number;
  modifiedAt: string;
  ageHours: number;
}

export interface HealthPayload {
  database: { ok: boolean; latencyMs: number | null };
  redis: { ok: boolean; latencyMs?: number; error?: string };
  queue: { enabled: boolean; waiting: number; active: number; completed: number; failed: number; delayed: number } | null;
  storage: { bytes: number; files: number };
  backups: {
    directory: string;
    exists: boolean;
    latestDatabase: BackupFile | null;
    latestStorage: BackupFile | null;
    count: number;
    totalBytes: number;
    state: 'ok' | 'stale' | 'missing';
    staleAfterHours: number;
  };
  config: {
    appUrl: string;
    shortUrlBase: string;
    storageDriver: string;
    smtpConfigured: boolean;
    googleOauth: boolean;
    workerConcurrency: number;
  };
}

function jump(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function SystemView({ initial }: { initial: HealthPayload }) {
  const [health, setHealth] = React.useState(initial);
  const [loading, setLoading] = React.useState(false);
  const [running, setRunning] = React.useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/maintenance');
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; data?: HealthPayload };
      if (payload.data) setHealth(payload.data);
    } finally {
      setLoading(false);
    }
  }

  async function runMaintenance() {
    setRunning(true);
    try {
      const response = await fetch('/api/admin/maintenance', { method: 'POST' });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; data?: { mode: string } };
      if (payload.ok) {
        toast.success(
          payload.data?.mode === 'queued'
            ? 'Housekeeping queued — the worker will run it shortly'
            : 'Housekeeping finished',
        );
        await refresh();
      } else {
        toast.error('Could not run housekeeping');
      }
    } finally {
      setRunning(false);
    }
  }

  const queue = health.queue;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" loading={loading} onClick={() => void refresh()}>
          <RefreshCw /> Refresh
        </Button>
        <Button variant="brand" loading={running} onClick={() => void runMaintenance()}>
          <PlayCircle /> Run housekeeping now
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Database"
          value={health.database.ok ? 'Healthy' : 'Down'}
          hint={health.database.latencyMs !== null ? `${health.database.latencyMs} ms round trip` : 'No response'}
          icon={<Database />}
          tone={health.database.ok ? 'primary' : undefined}
          onClick={() => jump('system-config')}
        />
        <StatCard
          label="Redis / queue"
          value={health.redis.ok ? 'Connected' : queue?.enabled ? 'Error' : 'Not configured'}
          hint={
            health.redis.ok
              ? `${health.redis.latencyMs} ms ping`
              : 'Jobs run inline in the web process — fine for small installs'
          }
          icon={<Server />}
          onClick={() => jump('system-queue')}
        />
        <StatCard
          label="Storage used"
          value={bytesToSize(health.storage.bytes)}
          hint={`${formatNumber(health.storage.files)} files on ${health.config.storageDriver === 's3' ? 'object storage' : 'local disk'}`}
          icon={<HardDrive />}
          onClick={() => jump('system-backups')}
        />
        <StatCard
          label="Jobs waiting"
          value={queue ? formatNumber(queue.waiting + queue.delayed) : '0'}
          hint={queue?.enabled ? `${queue.active} running · ${queue.failed} failed` : 'Inline processing'}
          icon={<Layers />}
          tone="accent"
          onClick={() => jump('system-queue')}
        />
      </div>

      {!health.database.ok ? (
        <Alert tone="error" title="The database is not responding">
          Check <code>DATABASE_URL</code> and that PostgreSQL is running. Scans cannot be recorded while this is down,
          though cached redirects may still work.
        </Alert>
      ) : null}

      {!health.redis.ok && queue?.enabled ? (
        <Alert tone="warning" title="Redis is configured but unreachable">
          {health.redis.error ?? 'The queue cannot be reached.'} Scan logging falls back to inline processing, which is
          slower but does not lose data.
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="scroll-mt-20 p-5" id="system-queue">
          <SectionHeader title="Background queue" description="Scan logging, bulk imports, webhooks and housekeeping." />
          {queue?.enabled ? (
            <ul className="space-y-2 text-[13px]">
              {[
                ['Waiting', queue.waiting],
                ['Active', queue.active],
                ['Delayed', queue.delayed],
                ['Completed', queue.completed],
                ['Failed', queue.failed],
              ].map(([label, value]) => (
                <li key={label as string} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{label as string}</span>
                  <span className="font-semibold tabular-nums">{formatNumber(Number(value))}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Alert tone="info">
              No Redis connection, so jobs run inline inside the web request. Everything still works — set{' '}
              <code>REDIS_URL</code> and run the worker container to move scan logging off the request path.
            </Alert>
          )}
        </Card>

        <Card className="scroll-mt-20 p-5" id="system-config">
          <SectionHeader title="Configuration" description="Read from the environment at runtime." />
          <ul className="space-y-2 text-[13px]">
            <li className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">App URL</span>
              <span className="truncate font-mono text-[12px]">{health.config.appUrl}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Short link base</span>
              <span className="truncate font-mono text-[12px]">{health.config.shortUrlBase}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">File storage</span>
              <Badge variant="outline">{health.config.storageDriver === 's3' ? 'S3-compatible' : 'Local disk'}</Badge>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="size-3.5" /> Outbound email
              </span>
              {health.config.smtpConfigured ? (
                <Badge variant="success">
                  <CheckCircle2 className="size-3" /> SMTP
                </Badge>
              ) : (
                <Badge variant="warning">
                  <XCircle className="size-3" /> Logged only
                </Badge>
              )}
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Google sign-in</span>
              <Badge variant={health.config.googleOauth ? 'success' : 'outline'}>
                {health.config.googleOauth ? 'Enabled' : 'Off'}
              </Badge>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Activity className="size-3.5" /> Worker concurrency
              </span>
              <span className="font-semibold tabular-nums">{health.config.workerConcurrency}</span>
            </li>
          </ul>
        </Card>
      </div>

      <Card className="scroll-mt-20 p-5" id="system-backups">
        <SectionHeader
          title="Backups"
          description="Taken on the host by scripts/backup.sh — the app only reads the directory."
          actions={
            health.backups.state === 'ok' ? (
              <Badge variant="success">
                <CheckCircle2 className="size-3" /> Fresh
              </Badge>
            ) : health.backups.state === 'stale' ? (
              <Badge variant="warning">Stale</Badge>
            ) : (
              <Badge variant="destructive">None found</Badge>
            )
          }
        />

        {health.backups.state === 'missing' ? (
          <Alert tone="error" title="No backups found">
            Nothing matching <code>db-*.dump</code> in{' '}
            <code className="break-all">{health.backups.directory}</code>. A dynamic QR code is only as permanent as
            its last good dump — set up the cron job from the README:
            <br />
            <code className="mt-1 inline-block">30 2 * * * cd /opt/qr-altrix &amp;&amp; ./scripts/backup.sh</code>
          </Alert>
        ) : health.backups.state === 'stale' ? (
          <Alert tone="warning" title="The last backup is old">
            The newest database dump is {health.backups.latestDatabase?.ageHours} hours old, past the{' '}
            {health.backups.staleAfterHours}-hour warning window. Check that the cron job is still running.
          </Alert>
        ) : null}

        {health.backups.latestDatabase || health.backups.latestStorage ? (
          <ul className="mt-3 space-y-2 text-[13px]">
            {health.backups.latestDatabase ? (
              <li className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Database className="size-3.5" /> Latest database dump
                </span>
                <span className="font-mono text-[12px]">
                  {health.backups.latestDatabase.name} · {bytesToSize(health.backups.latestDatabase.sizeBytes)} ·{' '}
                  {health.backups.latestDatabase.ageHours}h ago
                </span>
              </li>
            ) : null}
            {health.backups.latestStorage ? (
              <li className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <HardDrive className="size-3.5" /> Latest uploads archive
                </span>
                <span className="font-mono text-[12px]">
                  {health.backups.latestStorage.name} · {bytesToSize(health.backups.latestStorage.sizeBytes)} ·{' '}
                  {health.backups.latestStorage.ageHours}h ago
                </span>
              </li>
            ) : null}
            <li className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">Kept on disk</span>
              <span>
                {health.backups.count} file(s) · {bytesToSize(health.backups.totalBytes)}
              </span>
            </li>
          </ul>
        ) : null}

        <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
          Restore with <code>./scripts/restore.sh backups/db-….dump backups/storage-….tar.gz</code>. Copy these files
          off the machine — a backup on the same disk is not a backup.
        </p>
      </Card>

      <Card className="p-5">
        <SectionHeader
          title="What housekeeping does"
          description="Safe to run at any time; it never touches QR codes."
        />
        <ul className="space-y-1.5 text-[13px] text-muted-foreground">
          <li>Deletes anonymous homepage drafts that were never claimed and have expired.</li>
          <li>Deletes used and expired password-reset and email-verification tokens.</li>
          <li>Deletes scan rows older than the retention period, if an administrator has set one.</li>
        </ul>
      </Card>
    </div>
  );
}
