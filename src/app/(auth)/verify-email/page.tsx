import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, MailWarning } from 'lucide-react';
import { prisma } from '@/lib/db';
import { hashToken } from '@/lib/hash';
import { logSecurity } from '@/lib/audit';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { ResendVerification } from '@/components/auth/resend-verification';

export const metadata: Metadata = {
  title: 'Confirm your email',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * Verification happens on page load so the link in the email works with one click, with
 * no extra button to press.
 */
async function consumeToken(token: string): Promise<{ ok: boolean; email?: string }> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date()) return { ok: false };
  if (record.usedAt) return { ok: true, email: record.user.email };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: record.user.emailVerifiedAt ?? new Date() },
    }),
    prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  await logSecurity({ type: 'EMAIL_VERIFIED', userId: record.userId, email: record.user.email });

  return { ok: true, email: record.user.email };
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await consumeToken(token).catch(() => ({ ok: false })) : { ok: false };

  return (
    <div className="space-y-6">
      {result.ok ? (
        <>
          <div className="flex flex-col items-center text-center">
            <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-success/12 text-success">
              <CheckCircle2 className="size-5" />
            </span>
            <h1 className="font-display text-[23px] font-bold tracking-[-0.025em]">Email confirmed</h1>
            <p className="mt-1.5 text-[13.5px] leading-6 text-muted-foreground">
              Thanks — your account is fully set up. You can recover it with your email if you ever lose your password.
            </p>
          </div>
          <Button asChild variant="brand" size="lg" className="w-full">
            <Link href="/dashboard">Go to the dashboard</Link>
          </Button>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center text-center">
            <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-warning/15 text-warning">
              <MailWarning className="size-5" />
            </span>
            <h1 className="font-display text-[23px] font-bold tracking-[-0.025em]">This link has expired</h1>
          </div>
          <Alert tone="warning">
            Verification links last 48 hours and work once. Your QR codes are unaffected — you can send yourself a new
            link below.
          </Alert>
          <ResendVerification />
          <p className="text-center text-[12.5px] text-muted-foreground">
            <Link href="/dashboard" className="font-medium text-primary hover:underline">
              Continue to the dashboard
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
