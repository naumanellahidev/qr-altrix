import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { AdminLiveAnalytics } from '@/components/dashboard/admin/admin-live-analytics';

export const metadata: Metadata = { title: 'Live analytics' };
export const dynamic = 'force-dynamic';

/** Platform-wide scan analytics: every workspace, every code, live. The admin layout checks access. */
export default function AdminAnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Live analytics"
        description="Scans of every QR code on the platform, the moment they happen, with reports for any period."
      />
      <AdminLiveAnalytics />
    </>
  );
}
