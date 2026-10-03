import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Lock } from 'lucide-react';
import { resolveQr } from '@/lib/routing/resolve';
import { requestHost } from '@/lib/request';
import { BrandLogo } from '@/components/brand';
import { PasswordForm } from '@/components/landing/password-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Protected QR code',
  robots: { index: false, follow: false },
};

export default async function PasswordPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const headerList = await headers();
  const qr = await resolveQr({ host: requestHost(headerList), code });

  if (!qr || !qr.passwordHash) notFound();

  return (
    <main className="qa-glow relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <BrandLogo href={null} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-5 flex flex-col items-center text-center">
            <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Lock className="size-5" />
            </span>
            <h1 className="font-display text-[19px] font-semibold tracking-[-0.01em]">This code is protected</h1>
            <p className="mt-1 text-[13.5px] leading-6 text-muted-foreground">
              Enter the password the owner gave you to continue.
            </p>
          </div>

          <PasswordForm code={code} />
        </div>

        <p className="mt-5 text-center text-[12px] text-muted-foreground">
          Protected by QR ALTRIX · the owner can change this password any time.
        </p>
      </div>
    </main>
  );
}
