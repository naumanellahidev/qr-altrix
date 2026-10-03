import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarClock, CircleSlash, Flag, PauseCircle, QrCode, ShieldAlert } from 'lucide-react';
import { BrandLogo } from '@/components/brand';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'This QR code is not active',
  robots: { index: false, follow: false },
};

const REASONS: Record<
  string,
  { icon: typeof PauseCircle; title: string; body: string; tone: string }
> = {
  paused: {
    icon: PauseCircle,
    title: 'This code is paused',
    body: 'The owner has temporarily switched it off. It will work again as soon as they resume it — the printed code does not need replacing.',
    tone: 'text-warning',
  },
  deleted: {
    icon: CircleSlash,
    title: 'This code was deleted',
    body: 'The owner removed this code. If you believe it should still work, get in touch with whoever gave you the code.',
    tone: 'text-muted-foreground',
  },
  admin_disabled: {
    icon: ShieldAlert,
    title: 'This code was disabled',
    body: 'A platform administrator disabled this code after a safety review. Nothing was changed on your device.',
    tone: 'text-destructive',
  },
  not_started: {
    icon: CalendarClock,
    title: 'This code is not live yet',
    body: 'The owner scheduled it to start later. Try again at the time printed on the material.',
    tone: 'text-primary',
  },
  ended: {
    icon: CalendarClock,
    title: 'This campaign has ended',
    body: 'The owner set an end date for this code and that date has passed.',
    tone: 'text-muted-foreground',
  },
  closed_now: {
    icon: CalendarClock,
    title: 'Outside opening hours',
    body: 'This code only works during the hours the owner set. Please try again later today.',
    tone: 'text-primary',
  },
  expired: {
    icon: CalendarClock,
    title: 'This code has expired',
    body: 'The owner of this service sets how long a code stays live, and this one has reached that limit. The owner can extend or renew it — the printed code does not need replacing.',
    tone: 'text-warning',
  },
  expired_inactive: {
    icon: CalendarClock,
    title: 'This code was retired',
    body: 'It had not been scanned for a long time, so it was retired automatically. The owner can bring it back at any time.',
    tone: 'text-muted-foreground',
  },
  scan_limit: {
    icon: CircleSlash,
    title: 'This code reached its scan limit',
    body: 'The owner chose to limit how many times this code could be used, and that limit has been reached.',
    tone: 'text-warning',
  },
  no_destination: {
    icon: QrCode,
    title: 'This code has no destination yet',
    body: 'The owner has not finished setting it up. The code itself is fine — it just needs a link.',
    tone: 'text-muted-foreground',
  },
  not_found: {
    icon: QrCode,
    title: 'We could not find this code',
    body: 'The link may have been typed incorrectly, or the code belongs to a different service.',
    tone: 'text-muted-foreground',
  },
  domain_root: {
    icon: QrCode,
    title: 'Nothing to see at this address',
    body: 'This domain is used for QR code short links. Scan a code, or follow a full link that includes its code.',
    tone: 'text-muted-foreground',
  },
};

function formatResumes(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default async function InactivePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ reason?: string; resumes?: string }>;
}) {
  const [{ code }, query] = await Promise.all([params, searchParams]);
  const reason = REASONS[query.reason ?? 'not_found'] ?? REASONS.not_found;
  const Icon = reason.icon;
  const resumesAt = formatResumes(query.resumes);

  return (
    <main className="qa-glow relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <BrandLogo href={null} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
          <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-muted">
            <Icon className={`size-6 ${reason.tone}`} />
          </span>
          <h1 className="font-display text-[20px] font-semibold tracking-[-0.015em]">{reason.title}</h1>
          <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-6 text-muted-foreground">{reason.body}</p>

          {resumesAt ? (
            <p className="mt-4 rounded-xl border border-border bg-surface-muted/60 px-3 py-2 text-[12.5px]">
              Scheduled to go live on <strong className="font-medium">{resumesAt}</strong>
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild variant="brand">
              <Link href="/">Make your own QR code — free</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/report-abuse?code=${encodeURIComponent(code)}`}>
                <Flag /> Report this code
              </Link>
            </Button>
          </div>
        </div>

        <p className="mt-5 text-[12px] text-muted-foreground">
          Reference: <span className="font-mono">{code}</span>
        </p>
      </div>
    </main>
  );
}
