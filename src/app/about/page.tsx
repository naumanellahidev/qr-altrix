import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent } from '@/content';
import { SEO_KINDS } from '@/content/seo';
import { pageMeta } from '@/lib/seo/meta';
import { env } from '@/lib/env';
import { JsonLd } from '@/components/seo/json-ld';
import { graph } from '@/lib/seo/schema';
import { Breadcrumbs, MarketingShell } from '@/views/marketing-shell';
import { PageIntro } from '@/views/content-pages';
import { HELP_EMAIL, SUPPORT_EMAIL } from '@/lib/contact';

export const metadata: Metadata = pageMeta({
  path: '/about',
  title: 'About QR ALTRIX',
  description:
    'Who builds and runs QR ALTRIX, what the free QR code generator does, and how our guides and answers are written, checked and corrected.',
});

const LINK = 'font-medium text-primary underline-offset-4 hover:underline';

function Block({ id, h, children }: { id?: string; h: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 font-display text-[21px] font-bold tracking-[-0.02em] sm:text-[24px]">{h}</h2>
      <div className="space-y-3 text-[15px] leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  const { ui } = getContent('en');
  const base = env.appUrl.replace(/\/+$/, '');
  const page = {
    '@type': 'AboutPage',
    '@id': `${base}/about#page`,
    url: `${base}/about`,
    name: 'About QR ALTRIX',
    inLanguage: 'en',
    isPartOf: { '@id': `${base}/#website` },
    about: { '@id': `${base}/#organization` },
  };

  return (
    <MarketingShell locale="en" path="/about">
      <div className="container py-10 sm:py-14">
        <Breadcrumbs locale="en" home={ui.common.home} trail={[{ name: 'About', path: '/about' }]} />
        <PageIntro
          h1="About QR ALTRIX"
          intro="QR ALTRIX is a free QR code generator. You can make static and dynamic QR codes, add your logo and colours, see scan statistics and create codes in bulk, without a paid plan."
        />

        <div className="mt-10 max-w-[68ch] space-y-10">
          <Block h="Who is behind it">
            <p>
              QR ALTRIX is designed, built and maintained by{' '}
              <a href="https://naumanellahi.com" target="_blank" rel="noopener" className={LINK}>
                Nauman Ellahi
              </a>
              , a software developer. The same person runs the server, answers support email and decides what goes on this site.
            </p>
            <p>
              The site is paid for by the ads shown on its public pages, so the generator, dynamic codes and scan statistics can stay free.
              Ads are never shown in your dashboard, on sign-in pages or on the pages hosted for your QR codes.
            </p>
          </Block>

          <Block h="What the site offers">
            <ul className="list-disc space-y-1.5 ps-5 marker:text-primary">
              <li>
                A <Link href="/#generator" className={LINK}>QR code generator</Link> for links, Wi-Fi, contact cards, WhatsApp, PDFs, menus and many more{' '}
                <Link href="/qr-code-generator" className={LINK}>types</Link>.
              </li>
              <li>Dynamic codes whose destination you can change after printing, with scan statistics.</li>
              <li>
                <Link href={SEO_KINDS.guides.path} className={LINK}>Guides</Link>,{' '}
                <Link href={SEO_KINDS.answers.path} className={LINK}>answers</Link> and{' '}
                <Link href={SEO_KINDS.for.path} className={LINK}>ideas</Link> about making, designing and printing QR codes that scan.
              </li>
            </ul>
          </Block>

          <Block id="how-we-write" h="How our guides and answers are written">
            <p>
              Each article starts from a real question people search for. Drafts are written with the help of AI writing tools, then
              checked by hand against how QR codes work and how this generator behaves: sizes, scan distances, error correction and
              each setting described are things you can try on the site yourself.
            </p>
            <p>
              We do not copy other sites, we do not publish reviews or statistics we cannot back up, and where a feature depends on a
              setting (for example whether codes can expire), the pages describing it are shown only while that is true on this
              install.
            </p>
            <p>
              Pages show the date they were last updated. If you find a mistake, email{' '}
              <a href={`mailto:${HELP_EMAIL}`} className={LINK}>
                {HELP_EMAIL}
              </a>{' '}
              and we will correct it.
            </p>
          </Block>

          <Block h="Contact">
            <p>
              Questions about your account or a code:{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className={LINK}>
                {SUPPORT_EMAIL}
              </a>
              . More ways to reach us are on the <Link href="/support" className={LINK}>support page</Link>. To report a code used for
              phishing or spam, use the <Link href="/report-abuse" className={LINK}>abuse report form</Link>.
            </p>
            <p>
              Read our <Link href="/legal/privacy" className={LINK}>privacy policy</Link> and{' '}
              <Link href="/legal/terms" className={LINK}>terms</Link>.
            </p>
          </Block>
        </div>
      </div>
      <JsonLd data={graph(page)} />
    </MarketingShell>
  );
}
