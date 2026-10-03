import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Globe, KeyRound, LogIn, LogOut, QrCode, ShieldAlert, ShieldCheck, UserCog, Users,
} from 'lucide-react';
import type { SecurityEventType } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { SECURITY_EVENT_LABELS } from '@/lib/audit';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/feedback';
import { Alert } from '@/components/ui/feedback';

export const metadata: Metadata = { title: 'Security history' };
export const dynamic = 'force-dynamic';

const GROUPS: { id: string; label: string; types: SecurityEventType[] }[] = [
  { id: 'all', label: 'Everything', types: [] },
  {
    id: 'access',
    label: 'Sign-ins',
    types: ['LOGIN', 'LOGIN_FAILED', 'LOGOUT'],
  },
  {
    id: 'account',
    label: 'Account & password',
    types: [
      'PASSWORD_CHANGED', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'EMAIL_VERIFIED',
      'TWO_FACTOR_ENABLED', 'TWO_FACTOR_DISABLED', 'ACCOUNT_DELETED',
    ],
  },
  {
    id: 'codes',
    label: 'QR codes',
    types: ['QR_CREATED', 'QR_EDITED', 'QR_DELETED', 'QR_PAUSED', 'QR_UNPAUSED', 'QR_SCANS_RESET', 'BULK_IMPORT', 'TEMPLATE_CREATED'],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    types: [
      'API_KEY_CREATED', 'API_KEY_REVOKED', 'DOMAIN_ADDED', 'DOMAIN_REMOVED', 'DOMAIN_VERIFIED',
      'USER_INVITED', 'ROLE_CHANGED', 'MEMBER_DISABLED', 'WEBHOOK_CREATED',
    ],
  },
  { id: 'admin', label: 'Admin actions', types: ['ADMIN_ABUSE_DISABLE', 'ADMIN_ABUSE_ENABLE'] },
];

function iconFor(type: SecurityEventType) {
  if (type === 'LOGIN') return LogIn;
  if (type === 'LOGOUT') return LogOut;
  if (type === 'LOGIN_FAILED') return ShieldAlert;
  if (type.startsWith('QR_')) return QrCode;
  if (type.startsWith('API_KEY')) return KeyRound;
  if (type.startsWith('DOMAIN')) return Globe;
  if (type === 'USER_INVITED' || type === 'ROLE_CHANGED' || type === 'MEMBER_DISABLED') return Users;
  if (type.startsWith('ADMIN_')) return ShieldAlert;
  if (type.startsWith('TWO_FACTOR') || type.startsWith('PASSWORD')) return UserCog;
  return ShieldCheck;
}

function toneFor(type: SecurityEventType): 'default' | 'success' | 'warning' | 'destructive' {
  if (type === 'LOGIN_FAILED' || type === 'ADMIN_ABUSE_DISABLE' || type === 'ACCOUNT_DELETED') return 'destructive';
  if (type === 'QR_DELETED' || type === 'QR_PAUSED' || type === 'MEMBER_DISABLED' || type === 'API_KEY_REVOKED') {
    return 'warning';
  }
  if (type === 'LOGIN' || type === 'EMAIL_VERIFIED' || type === 'TWO_FACTOR_ENABLED' || type === 'DOMAIN_VERIFIED') {
    return 'success';
  }
  return 'default';
}

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; page?: string }>;
}) {
  const auth = await requireAuth('/dashboard/security');
  const query = await searchParams;

  const group = GROUPS.find((item) => item.id === (query.group ?? 'all')) ?? GROUPS[0];
  const page = Math.max(1, Number(query.page ?? '1') || 1);
  const perPage = 40;

  const where = {
    OR: [{ workspaceId: auth.workspace.id }, { userId: auth.user.id }],
    ...(group.types.length > 0 ? { type: { in: group.types } } : {}),
  };

  const [events, total, failedRecently] = await Promise.all([
    prisma.securityEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.securityEvent.count({ where }),
    prisma.securityEvent.count({
      where: {
        userId: auth.user.id,
        type: 'LOGIN_FAILED',
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <>
      <PageHeader
        title="Security history"
        description="Every security-relevant action on your account and workspace, newest first."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Security history' }]}
      />

      {failedRecently > 2 ? (
        <Alert tone="warning" className="mb-5" title={`${failedRecently} failed sign-in attempts this week`}>
          If none of those were you, change your password and turn on two-factor authentication in Settings.
        </Alert>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-1.5">
        {GROUPS.map((item) => (
          <Button
            key={item.id}
            asChild
            size="sm"
            variant={item.id === group.id ? 'subtle' : 'ghost'}
          >
            <Link href={item.id === 'all' ? '/dashboard/security' : `/dashboard/security?group=${item.id}`}>
              {item.label}
            </Link>
          </Button>
        ))}
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck />}
          title="Nothing recorded yet"
          description="Sign-ins, password changes and QR code edits will appear here as they happen."
        />
      ) : (
        <Card flush>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead className="hidden sm:table-cell">Who</TableHead>
                <TableHead className="hidden lg:table-cell">Details</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                const Icon = iconFor(event.type);
                const meta = (event.meta ?? {}) as Record<string, unknown>;
                const detail =
                  (typeof meta.name === 'string' && meta.name) ||
                  (typeof meta.host === 'string' && meta.host) ||
                  (typeof meta.email === 'string' && meta.email) ||
                  (typeof meta.via === 'string' && `via ${meta.via}`) ||
                  (typeof meta.reason === 'string' && String(meta.reason).replace(/_/g, ' ')) ||
                  null;

                return (
                  <TableRow key={event.id}>
                    <TableCell>
                      <span className="flex items-center gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
                          <Icon className="size-3.5" />
                        </span>
                        <span className="text-[13.5px] font-medium">{SECURITY_EVENT_LABELS[event.type]}</span>
                        {toneFor(event.type) !== 'default' ? (
                          <Badge variant={toneFor(event.type)}>
                            {toneFor(event.type) === 'destructive'
                              ? 'Attention'
                              : toneFor(event.type) === 'warning'
                                ? 'Changed'
                                : 'OK'}
                          </Badge>
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-[12.5px] text-muted-foreground sm:table-cell">
                      {event.user?.name ?? event.user?.email ?? event.email ?? 'System'}
                    </TableCell>
                    <TableCell className="hidden max-w-[18rem] truncate text-[12.5px] text-muted-foreground lg:table-cell">
                      {detail ?? '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-[12.5px] text-muted-foreground">
                      {event.createdAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[12.5px] text-muted-foreground">
            Page {page} of {totalPages} · {total} events
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" disabled={page <= 1}>
              <Link
                href={`/dashboard/security?${new URLSearchParams({
                  ...(group.id !== 'all' ? { group: group.id } : {}),
                  page: String(Math.max(1, page - 1)),
                }).toString()}`}
              >
                Previous
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
              <Link
                href={`/dashboard/security?${new URLSearchParams({
                  ...(group.id !== 'all' ? { group: group.id } : {}),
                  page: String(Math.min(totalPages, page + 1)),
                }).toString()}`}
              >
                Next
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      <p className="mt-5 text-[12px] text-muted-foreground">
        IP addresses in this log are stored as salted hashes, never in the clear.
      </p>
    </>
  );
}
