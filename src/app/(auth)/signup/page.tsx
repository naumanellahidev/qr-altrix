import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { env } from '@/lib/env';
import { getAuthContext } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { readDraftSessionId } from '@/lib/auth/session';
import { getDraft } from '@/lib/drafts';
import { getTypeDef } from '@/lib/qr/catalog';
import { AuthForm } from '@/components/auth/auth-form';
import { Alert } from '@/components/ui/feedback';
import { canonical } from '@/lib/seo/routes';

export const metadata: Metadata = {
  alternates: canonical('/signup'),
  title: 'Create a free account',
  description: 'Create a free QR ALTRIX account. Dynamic QR codes never expire.',
};

export const dynamic = 'force-dynamic';

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const query = await searchParams;
  const auth = await getAuthContext().catch(() => null);
  if (auth) redirect('/dashboard');

  const [settings, draftSessionId] = await Promise.all([
    getSettings().catch(() => null),
    readDraftSessionId(),
  ]);
  const draft = await getDraft(draftSessionId).catch(() => null);
  const draftType = draft ? getTypeDef(draft.type) : null;

  if (settings && !settings.allowSignups) {
    return (
      <div className="space-y-5">
        <h1 className="font-display text-[24px] font-bold tracking-[-0.025em]">Sign-ups are closed</h1>
        <Alert tone="warning">
          This QR ALTRIX server is not accepting new accounts right now. Ask the administrator for an invitation.
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-display text-[24px] font-bold tracking-[-0.025em]">Create your free account</h1>
        <p className="text-[13.5px] text-muted-foreground">
          Unlimited QR codes, full analytics, and no expiry. No card needed.
        </p>
      </div>

      <AuthForm
        mode="signup"
        next={query.next && query.next.startsWith('/') ? query.next : '/dashboard?claim=1'}
        googleEnabled={env.google.enabled}
        draftNotice={
          draft ? (
            <Alert tone="success" title="Your design is waiting">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                The {draftType?.label.toLowerCase() ?? 'QR'} code you designed will be saved to your account
                automatically.
              </span>
            </Alert>
          ) : null
        }
      />
    </div>
  );
}
