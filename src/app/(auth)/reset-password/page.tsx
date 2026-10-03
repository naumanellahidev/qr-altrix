import type { Metadata } from 'next';
import Link from 'next/link';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { Alert } from '@/components/ui/feedback';

export const metadata: Metadata = {
  title: 'Choose a new password',
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="space-y-5">
        <h1 className="font-display text-[24px] font-bold tracking-[-0.025em]">That link is incomplete</h1>
        <Alert tone="error">
          The reset link is missing its token. Request a new one from the{' '}
          <Link href="/forgot-password" className="font-medium underline">
            forgot password
          </Link>{' '}
          page.
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-display text-[24px] font-bold tracking-[-0.025em]">Choose a new password</h1>
        <p className="text-[13.5px] leading-6 text-muted-foreground">
          Setting a new password signs you out of every other device.
        </p>
      </div>

      <ResetPasswordForm token={token} />
    </div>
  );
}
