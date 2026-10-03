import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Reset your password',
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-display text-[24px] font-bold tracking-[-0.025em]">Reset your password</h1>
        <p className="text-[13.5px] leading-6 text-muted-foreground">
          Enter the email on your account and we will send a link to choose a new password. Your QR codes keep working
          normally in the meantime.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-[12.5px] text-muted-foreground">
        Remembered it?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
