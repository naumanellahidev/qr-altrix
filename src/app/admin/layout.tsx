import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from '@/components/admin-icons';
import { requirePlatformAdmin } from '@/lib/auth';
import { BrandLogo } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { AdminNav } from '@/components/dashboard/admin/admin-nav';
import { AdminRail } from '@/components/dashboard/admin/admin-rail';

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
        <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
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

      {/* Desktop: the side rail navigates (AdminRail); phones keep the pills under the header. */}
      <AdminRail>
        <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-4 lg:pl-0 lg:pr-5">
          <div className="lg:hidden">
            <AdminNav />
          </div>
          <main className="mt-3 lg:mt-0">{children}</main>
        </div>
      </AdminRail>
    </div>
  );
}
