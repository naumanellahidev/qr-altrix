import type { Metadata } from 'next';
import { env } from '@/lib/env';
import { getAuthContext } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { LegalDocument } from '@/components/marketing/legal-document';
import { pageMeta } from '@/lib/seo/meta';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbSchema, graph } from '@/lib/seo/schema';
import { isDeveloperApiEnabled } from '@/lib/settings';
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY } from '@/lib/contact';

export const metadata: Metadata = pageMeta({
  path: '/legal/privacy',
  title: 'Privacy Policy',
  description:
    'What QR ALTRIX stores about account holders and about people who scan QR codes, how scanner IP addresses are hashed, and how to delete your data.',
});

export const dynamic = 'force-dynamic';

export default async function PrivacyPage() {
  const [auth, settings] = await Promise.all([
    getAuthContext().catch(() => null),
    getSettings().catch(() => null),
  ]);
  const host = new URL(env.appUrl).hostname;
  const retention = settings?.analyticsRetentionDays ?? 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader signedIn={Boolean(auth)} showApi={await isDeveloperApiEnabled()} />
      <main className="flex-1">
        <LegalDocument
          title="Privacy policy"
          updated="3 October 2026"
          intro={`This policy describes what the QR ALTRIX install at ${host} stores, why, and for how long. The server is operated by whoever runs this install; they are the data controller for everything below.`}
          sections={[
            {
              heading: 'If you have an account',
              body: [
                'We store your email address, a hash of your password (never the password itself), your name and optional phone number, your display preferences, and your notification choices.',
                'We store security events: sign-ins, failed sign-ins, password and two-factor changes, and changes to your QR codes. These are visible to you under Security history.',
                'Uploaded files — logos, PDFs, images, audio and video — are stored on this server (or the operator’s object storage) and served to people who scan the related code.',
              ],
            },
            {
              heading: 'If you scan somebody’s QR code',
              body: [
                'For dynamic codes we record the scan so the owner can measure their campaign. That record contains: the time, the country, region and city reported by the operator’s proxy or CDN, your device type, browser and operating system, your browser’s preferred language, the referring host if any, and the UTM parameters on the link.',
                `We do not store your IP address in a readable form. ${
                  settings?.ipStorageMode === 'never'
                    ? 'On this install IP processing is switched off entirely.'
                    : 'It is salted and hashed with a server-side secret, which lets us count unique visitors without being able to identify you or reverse the value.'
                }`,
                'We do not use cookies to track you across sites. A short-lived cookie is set only when you unlock a password-protected code, so you are not asked again on every scan.',
                'Bot and crawler traffic is excluded from analytics rather than recorded.',
              ],
            },
            {
              heading: 'Owner-configured tracking',
              body: [
                'A code owner may add Google Analytics 4, Google Tag Manager or a Meta Pixel to the pages QR ALTRIX hosts for them. Those tools are operated by those companies under their own policies, and they load only when the owner has configured an id.',
                'Redirect-type codes do not inject any third-party script: they pass UTM parameters to the owner’s own site.',
              ],
            },
            {
              heading: 'How long data is kept',
              body: [
                retention > 0
                  ? `Scan records on this install are deleted automatically after ${retention} days.`
                  : 'Scan records on this install are kept until the code owner resets the statistics or deletes the code. The administrator can set an automatic retention period.',
                'Account data is kept until you delete your account. Deleting your account removes the workspaces you own, their QR codes, designs, uploads and scan history.',
                'Password-reset and email-verification tokens are deleted once used or expired.',
              ],
            },
            {
              heading: 'Who else sees it',
              body: [
                'Members of a workspace see the codes and analytics in that workspace, according to their role.',
                'A platform administrator for this install can see accounts, workspaces and codes in order to run the service and handle abuse reports.',
                'Nothing is sold, and nothing is shared with advertisers. Outbound email goes through the SMTP provider the operator configured.',
              ],
            },
            {
              heading: 'Your rights',
              body: [
                'You can see and correct your own data in Settings, export analytics to CSV or XLSX, and delete your account at any time.',
                `If you scanned a code and want the record removed, contact the operator of this install (${SUPPORT_EMAIL}, or call / WhatsApp ${SUPPORT_PHONE_DISPLAY}); because IPs are hashed, you will need to describe the scan (code, approximate time) so they can locate it.`,
              ],
            },
            {
              heading: 'Security',
              body: [
                'Passwords are hashed with bcrypt. API keys are stored only as hashes. Sessions are signed, HTTP-only cookies. Uploads are type-checked and SVG files are sanitised before they are served.',
                'Database queries go through a parameterised ORM, and every request body is schema-validated before it reaches the database.',
              ],
            },
          ]}
        />
      </main>
      <SiteFooter />
      <JsonLd data={graph(breadcrumbSchema(env.appUrl.replace(/\/+$/, ''), [{ name: 'Privacy policy', path: '/legal/privacy' }]))} />
    </div>
  );
}
