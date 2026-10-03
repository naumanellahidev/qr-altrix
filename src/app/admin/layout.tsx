import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { requirePlatformAdmin } from '@/lib/auth';
import { BrandLogo } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-provider';
import { Badge } from '@/components/ui/badge';
import { AdminNav } from '@/components/dashboard/admin/admin-nav';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · QR ALTRIX admin' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requirePlatformAdmin();

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-destructive/20 bg-destructive/5 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <BrandLogo href="/dashboard" compact size={26} />
          <Badge variant="destructive">
            <ShieldAlert className="size-3" /> Platform admin
          </Badge>
          <p className="ml-1 hidden truncate text-[12.5px] text-muted-foreground sm:block">
            Signed in as {auth.user.email}
          </p>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Back to dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <AdminNav />
        <main className="mt-5">{children}</main>
      </div>
    </div>
  );
}
