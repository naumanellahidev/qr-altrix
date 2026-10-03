import type { Metadata } from 'next';
import { requirePlatformAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { PageHeader } from '@/components/ui/page-header';
import { PlatformSettingsForm } from '@/components/dashboard/admin/platform-settings-form';

export const metadata: Metadata = { title: 'Platform settings' };
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requirePlatformAdmin();
  const settings = await getSettings();

  return (
    <>
      <PageHeader
        title="Platform settings"
        description="Install-wide behaviour: sign-ups, privacy, abuse limits and the dashboard notice."
      />
      <PlatformSettingsForm initial={settings} />
    </>
  );
}
