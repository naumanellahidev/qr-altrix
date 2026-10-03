import type { Metadata } from 'next';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { getAuthContext } from '@/lib/auth';
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/lib/rbac';
import { Alert } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { AcceptInvite } from '@/components/auth/accept-invite';
import { AuthForm } from '@/components/auth/auth-form';

export const metadata: Metadata = {
  title: 'Team invitation',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const member = await prisma.workspaceMember
    .findUnique({
      where: { inviteToken: token },
      include: { workspace: { select: { name: true } } },
    })
    .catch(() => null);

  if (!member) {
    return (
      <div className="space-y-5">
        <h1 className="font-display text-[23px] font-bold tracking-[-0.025em]">This invitation is no longer valid</h1>
        <Alert tone="warning">
          It may have been accepted already, or withdrawn. Ask whoever invited you to send a new one.
        </Alert>
        <p className="text-center text-[12.5px] text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in instead
          </Link>
        </p>
      </div>
    );
  }

  const auth = await getAuthContext().catch(() => null);
  const emailMatches = auth?.user.email.toLowerCase() === member.email.toLowerCase();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Users className="size-5" />
        </span>
        <h1 className="font-display text-[23px] font-bold tracking-[-0.025em]">
          Join {member.workspace.name}
        </h1>
        <p className="text-[13.5px] leading-6 text-muted-foreground">
          You were invited as <Badge variant="primary">{ROLE_LABELS[member.role]}</Badge>
        </p>
        <p className="text-[12.5px] leading-5 text-muted-foreground">{ROLE_DESCRIPTIONS[member.role]}</p>
      </div>

      {auth ? (
        emailMatches ? (
          <AcceptInvite token={token} workspaceName={member.workspace.name} />
        ) : (
          <Alert tone="warning" title="Different account signed in">
            This invitation was sent to <strong>{member.email}</strong>, but you are logged in as{' '}
            <strong>{auth.user.email}</strong>. Log out and sign in with the invited address.
          </Alert>
        )
      ) : (
        <>
          <Alert tone="info">
            Create an account with <strong>{member.email}</strong> — or log in if you already have one — and the
            invitation is accepted automatically.
          </Alert>
          <AuthForm
            mode="signup"
            next={`/invite/${token}`}
            googleEnabled={env.google.enabled}
            compact
          />
        </>
      )}
    </div>
  );
}
