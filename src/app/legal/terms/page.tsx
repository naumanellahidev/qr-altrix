import type { Metadata } from 'next';
import { env } from '@/lib/env';
import { getAuthContext } from '@/lib/auth';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { LegalDocument } from '@/components/marketing/legal-document';
import { pageMeta } from '@/lib/seo/meta';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbSchema, graph } from '@/lib/seo/schema';

export const metadata: Metadata = pageMeta({
  path: '/legal/terms',
  title: 'Terms of Service',
  description: 'The terms for using QR ALTRIX: your account, the QR codes you create, acceptable use, and how codes and data are handled.',
});

export const dynamic = 'force-dynamic';

export default async function TermsPage() {
  const auth = await getAuthContext().catch(() => null);
  const host = new URL(env.appUrl).hostname;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader signedIn={Boolean(auth)} />
      <main className="flex-1">
        <LegalDocument
          title="Terms of service"
          updated="3 October 2026"
          intro={`These terms cover your use of the QR ALTRIX install at ${host}. QR ALTRIX is self-hosted software, so the operator of this server — not the software's authors — is your counterparty for anything below.`}
          sections={[
            {
              heading: 'What the service does',
              body: [
                'QR ALTRIX lets you create static and dynamic QR codes, design them, host certain content types, and measure scans of dynamic codes.',
                'A static code encodes its content directly and works without this service. A dynamic code encodes a short link that this server resolves, so it depends on this server staying online.',
              ],
            },
            {
              heading: 'Dynamic codes do not expire',
              body: [
                'This install applies no trial period, no subscription requirement and no scan cap to dynamic QR codes. A dynamic code stops resolving only when: you pause it, you delete it, a schedule or scan limit you enabled yourself applies, or an administrator disables it under the abuse section below.',
                'The operator may still need to take the service offline for maintenance, migration or at end of life. Where that is planned, reasonable notice will be given through the dashboard.',
              ],
            },
            {
              heading: 'Your account',
              body: [
                'Keep your password and API keys confidential. You are responsible for activity under your account, including activity by team members you invite.',
                'Turn on two-factor authentication if your codes matter to your business. Security events are logged and visible to you under Security history.',
              ],
            },
            {
              heading: 'Acceptable use',
              body: [
                'Do not use QR codes created here to deceive people about where a link leads, to distribute malware, to phish for credentials or payment details, to harass, or to break the law that applies to you or to the operator.',
                'Do not attempt to bypass rate limits, access other workspaces, or probe the server for weaknesses without written permission from the operator.',
                'Do not use the service to redirect to content that is illegal where it is served, or that infringes somebody else’s rights.',
              ],
            },
            {
              heading: 'Abuse handling',
              body: [
                'Anyone can report a code through the report form. A report never changes a code on its own: an administrator reviews it.',
                'If a code is found to be phishing, malware, or otherwise clearly abusive, an administrator may disable it. You will see the reason on the code, and you may reply to the notification to contest it.',
              ],
            },
            {
              heading: 'Your content',
              body: [
                'You keep ownership of everything you upload or link to. You grant the operator the technical permission needed to store it, serve it to people who scan your codes, and back it up.',
                'You are responsible for having the rights to the logos, images, documents and media you upload.',
              ],
            },
            {
              heading: 'Availability and liability',
              body: [
                'The service is provided as-is. The operator does not guarantee uninterrupted availability, and the software authors give no warranty of any kind.',
                'To the maximum extent the law allows, neither the operator nor the authors are liable for indirect or consequential loss, including lost revenue from a printed code that could not be scanned.',
                'If printed material depends on a code, keep your own record of its destination so it can be recreated.',
              ],
            },
            {
              heading: 'Ending your use',
              body: [
                'You may delete individual codes, or your whole account, from Settings. Deleting your account removes the workspaces you own and stops their dynamic codes resolving immediately.',
                'The operator may suspend an account that breaks these terms, and will say why where it is lawful to do so.',
              ],
            },
            {
              heading: 'Changes',
              body: [
                'These terms may change as the service changes. Material changes will be announced in the dashboard. Continuing to use the service after a change means you accept it.',
              ],
            },
          ]}
        />
      </main>
      <SiteFooter />
      <JsonLd data={graph(breadcrumbSchema(env.appUrl.replace(/\/+$/, ''), [{ name: 'Terms of service', path: '/legal/terms' }]))} />
    </div>
  );
}
