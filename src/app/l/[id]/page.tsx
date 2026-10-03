import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Script from 'next/script';
import { prisma } from '@/lib/db';
import { isHostedType } from '@/lib/qr/catalog';
import { evaluateAccess, type TimeRule } from '@/lib/routing/evaluate';
import { isPasswordVerified } from '@/lib/routing/password';
import { expiryPolicyFromSettings } from '@/lib/qr/expiry';
import { getSettings } from '@/lib/settings';
import { LandingView } from '@/components/landing/views';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadQr(id: string) {
  return prisma.qRCode.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      type: true,
      kind: true,
      status: true,
      content: true,
      deletedAt: true,
      passwordHash: true,
      scheduleEnabled: true,
      scheduleStart: true,
      scheduleEnd: true,
      timeRules: true,
      scanLimitEnabled: true,
      scanLimitMax: true,
      scanCount: true,
      shortCode: true,
      createdAt: true,
      lastScanAt: true,
      workspace: { select: { isDisabled: true, tracking: true } },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const qr = await loadQr(id).catch(() => null);
  if (!qr) return { title: 'Not found', robots: { index: false } };

  const content = (qr.content ?? {}) as Record<string, unknown>;
  const title =
    (typeof content.title === 'string' && content.title) ||
    (typeof content.name === 'string' && content.name) ||
    (typeof content.headline === 'string' && content.headline) ||
    qr.name;
  const description =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.about === 'string' && content.about) ||
    (typeof content.subheadline === 'string' && content.subheadline) ||
    undefined;

  return {
    title: String(title),
    description: description ? String(description).slice(0, 200) : undefined,
    // Landing pages belong to the owner's campaign, not to our search footprint.
    robots: { index: false, follow: true },
  };
}

interface TrackingConfig {
  ga4?: string;
  metaPixel?: string;
  gtm?: string;
}

/** Owner-configured analytics tags, injected only when an id is actually set. */
function TrackingScripts({ tracking }: { tracking: TrackingConfig }) {
  const ga4 = /^G-[A-Z0-9]{4,20}$/i.test(tracking.ga4 ?? '') ? tracking.ga4 : null;
  const gtm = /^GTM-[A-Z0-9]{4,20}$/i.test(tracking.gtm ?? '') ? tracking.gtm : null;
  const pixel = /^\d{6,20}$/.test(tracking.metaPixel ?? '') ? tracking.metaPixel : null;

  return (
    <>
      {ga4 ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
          <Script id="qra-ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`}
          </Script>
        </>
      ) : null}
      {gtm ? (
        <Script id="qra-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      ) : null}
      {pixel ? (
        <Script id="qra-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}

export default async function LandingPage({ params }: PageProps) {
  const { id } = await params;
  const qr = await loadQr(id);

  if (!qr || qr.kind !== 'DYNAMIC' || !isHostedType(qr.type)) notFound();
  if (qr.workspace.isDisabled) redirect(`/inactive/${qr.shortCode ?? id}?reason=admin_disabled`);

  const [passwordVerified, settings] = await Promise.all([
    isPasswordVerified(qr.id, qr.passwordHash),
    getSettings().catch(() => null),
  ]);

  const access = evaluateAccess(
    {
      status: qr.status,
      deletedAt: qr.deletedAt,
      passwordHash: qr.passwordHash,
      scheduleEnabled: qr.scheduleEnabled,
      scheduleStart: qr.scheduleStart,
      scheduleEnd: qr.scheduleEnd,
      timeRules: (qr.timeRules as TimeRule[] | null) ?? null,
      scanLimitEnabled: qr.scanLimitEnabled,
      scanLimitMax: qr.scanLimitMax,
      scanCount: qr.scanCount,
      createdAt: qr.createdAt,
      lastScanAt: qr.lastScanAt,
    },
    { passwordVerified, expiry: expiryPolicyFromSettings(settings) },
  );

  // Visitors always arrive through /q, but a direct hit must honour the same rules.
  if (access.kind === 'password') redirect(`/p/${qr.shortCode ?? id}`);
  if (access.kind === 'inactive') redirect(`/inactive/${qr.shortCode ?? id}?reason=${access.reason}`);

  const tracking = (qr.workspace.tracking ?? {}) as TrackingConfig;

  return (
    <>
      <TrackingScripts tracking={tracking} />
      <LandingView
        qrId={qr.id}
        type={qr.type}
        name={qr.name}
        content={(qr.content ?? {}) as Record<string, unknown>}
      />
    </>
  );
}
