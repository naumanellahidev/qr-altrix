import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { env } from '@/lib/env';
import { getAuthContext } from '@/lib/auth';
import { AuthForm } from '@/components/auth/auth-form';
import { Alert } from '@/components/ui/feedback';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to manage your QR codes, destinations and scan analytics.',
};

export const dynamic = 'force-dynamic';

const OAUTH_ERRORS: Record<string, string> = {
  google_disabled: 'Google sign-in is not enabled on this server. Use your email and password.',
  google_cancelled: 'Google sign-in was cancelled.',
  google_state: 'That sign-in attempt expired. Please try again.',
  google_token: 'Google did not confirm the sign-in. Please try again.',
  google_profile: 'We could not read your Google profile. Try email and password instead.',
  google_failed: 'Google sign-in failed. Please try again.',
  google_invalid: 'That sign-in link was incomplete. Please try again.',
  account_disabled: 'This account has been disabled. Contact support if that seems wrong.',
  signups_closed: 'New sign-ups are closed on this server.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const query = await searchParams;
  const auth = await getAuthContext().catch(() => null);
  if (auth) redirect(query.next && query.next.startsWith('/') ? query.next : '/dashboard');

  const error = query.error ? OAUTH_ERRORS[query.error] ?? 'Sign-in failed. Please try again.' : null;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-display text-[24px] font-bold tracking-[-0.025em]">Welcome back</h1>
        <p className="text-[13.5px] text-muted-foreground">Log in to manage your codes and see your scans.</p>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <AuthForm
        mode="login"
        next={query.next && query.next.startsWith('/') ? query.next : '/dashboard'}
        googleEnabled={env.google.enabled}
      />
    </div>
  );
}
