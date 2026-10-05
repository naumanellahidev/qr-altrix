import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { findQrForWorkspace, encodedPayloadFor } from '@/lib/qr/service';
import { shortLinkFor } from '@/lib/routing/resolve';
import { isHostedType } from '@/lib/qr/catalog';
import { describeExpiry, expiryPolicyFromSettings } from '@/lib/qr/expiry';
import { getSettings } from '@/lib/settings';
import type { QrDesign } from '@/lib/qr/types';
import { PageHeader } from '@/components/ui/page-header';
import { CodeDetail } from '@/components/dashboard/code-detail';
import { prisma } from '@/lib/db';
import { FeedbackResponses, type FeedbackItem } from '@/components/dashboard/feedback-responses';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const auth = await requireAuth('/dashboard/codes');
  const qr = await findQrForWorkspace(id, auth.workspace.id);
  return { title: qr?.name ?? 'QR code' };
}

export default async function CodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireAuth('/dashboard/codes');
  const qr = await findQrForWorkspace(id, auth.workspace.id);
  if (!qr) notFound();

  const defaultDestination =
    qr.destinations.find((destination) => destination.kind === 'DEFAULT')?.url ??
    ((qr.content as Record<string, unknown>).url as string | undefined) ??
    null;

  // When the operator has switched expiry on, the owner must be able to see it here
  // rather than discover it from a scan that stopped working.
  const settings = await getSettings().catch(() => null);
  const expiry = describeExpiry(
    { createdAt: qr.createdAt, lastScanAt: qr.lastScanAt },
    expiryPolicyFromSettings(settings),
  );

  // Feedback-form codes: show what people actually said.
  let feedback: { items: FeedbackItem[]; total: number } | null = null;
  if (qr.type === 'FEEDBACK') {
    const where = { qrCodeId: qr.id, kind: 'FEEDBACK' as const };
    const [rows, total] = await Promise.all([
      prisma.scanEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: { id: true, createdAt: true, country: true, meta: true },
      }),
      prisma.scanEvent.count({ where }),
    ]);
    feedback = {
      total,
      items: rows.map((row) => {
        const data = ((row.meta as { feedback?: Record<string, unknown> } | null)?.feedback ?? {}) as Record<string, unknown>;
        return {
          id: row.id,
          at: row.createdAt.toISOString(),
          rating: Math.max(0, Math.min(5, Number(data.rating) || 0)),
          comment: typeof data.comment === 'string' && data.comment.trim() ? data.comment : null,
          email: typeof data.email === 'string' && data.email ? data.email : null,
          country: row.country,
        };
      }),
    };
  }

  return (
    <>
      <PageHeader
        title={qr.name}
        description={
          qr.kind === 'DYNAMIC'
            ? 'Dynamic code — edit the destination any time. It never expires on its own.'
            : 'Static code — the content is encoded in the pattern itself.'
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My QR codes', href: '/dashboard/codes' },
          { label: qr.name },
        ]}
      />

      <CodeDetail
        code={{
          id: qr.id,
          name: qr.name,
          kind: qr.kind,
          type: qr.type,
          status: qr.status,
          payload: encodedPayloadFor(qr),
          shortLink: qr.kind === 'DYNAMIC' ? shortLinkFor(qr) : null,
          design: (qr.design ?? {}) as Partial<QrDesign>,
          destination: defaultDestination,
          isFavorite: qr.isFavorite,
          passwordProtected: Boolean(qr.passwordHash),
          scheduleEnabled: qr.scheduleEnabled,
          scheduleStart: qr.scheduleStart?.toISOString() ?? null,
          scheduleEnd: qr.scheduleEnd?.toISOString() ?? null,
          scanLimitEnabled: qr.scanLimitEnabled,
          scanLimitMax: qr.scanLimitMax,
          scanCount: qr.scanCount,
          uniqueScanCount: qr.uniqueScanCount,
          firstScanAt: qr.firstScanAt?.toISOString() ?? null,
          lastScanAt: qr.lastScanAt?.toISOString() ?? null,
          createdAt: qr.createdAt.toISOString(),
          updatedAt: qr.updatedAt.toISOString(),
          folderName: qr.folder?.name ?? null,
          adminDisabledReason: qr.adminDisabledReason,
          hosted: isHostedType(qr.type),
        }}
        expiry={expiry}
        permissions={{
          canEdit: can(auth.role, 'qr.update'),
          canDelete: can(auth.role, 'qr.delete'),
          canResetScans: can(auth.role, 'stats.reset'),
          canViewStats: can(auth.role, 'stats.read'),
        }}
      />
      {feedback ? (
        <FeedbackResponses items={feedback.items} total={feedback.total} timeZone={auth.user.timezone || 'UTC'} />
      ) : null}
    </>
  );
}
