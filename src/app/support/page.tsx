import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Flag, LifeBuoy, Mail, MessageCircle, Phone } from 'lucide-react';
import { env } from '@/lib/env';
import { getAuthContext } from '@/lib/auth';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, SectionHeader } from '@/components/ui/page-header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/misc';
import { pageMeta } from '@/lib/seo/meta';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbSchema, graph } from '@/lib/seo/schema';
import { isDeveloperApiEnabled } from '@/lib/settings';
import { HELP_EMAIL, INFO_EMAIL, SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_TEL, supportWhatsApp } from '@/lib/contact';

export const metadata: Metadata = pageMeta({
  path: '/support',
  title: 'QR Code Help & Support',
  description:
    'Help with QR ALTRIX: fix a code that will not scan, set up a custom domain, read your scan analytics, or reach a person. Answers to common questions.',
});

export const dynamic = 'force-dynamic';

const FAQ = [
  {
    q: 'A code I printed has stopped working',
    a: 'A dynamic code stops for exactly five reasons: the owner paused it, deleted it, enabled a schedule or a scan limit that has been reached, or an administrator disabled it for abuse. Sign in and open the code — the state badge says which. Nothing expires on a timer here.',
  },
  {
    q: 'Can I edit a code after printing it?',
    a: 'Dynamic codes, yes — change the destination and the printed pattern stays valid. Static codes carry their content inside the pattern, so they cannot be changed; create a dynamic code next time if you need that freedom.',
  },
  {
    q: 'How do I use my own domain?',
    a: 'Add it under My domains, create the TXT record shown, and point an A or CNAME record at the server. Press "Check DNS", then issue the certificate on the server with the add-domain script. Custom domains cost nothing here.',
  },
  {
    q: 'Why do my scan numbers look low?',
    a: 'Bots and link previewers are excluded on purpose, and opening a destination from the dashboard does not count. Unique visitors are counted from a salted hash, so the same person scanning twice counts once.',
  },
  {
    q: 'Is there a paid plan?',
    a: 'No. QR ALTRIX is free and self-hostable. There is no trial, no subscription and no feature behind a paywall — including custom domains, bulk generation and the API.',
  },
  {
    q: 'I run the server myself — where do I start?',
    a: 'The repository README covers Docker Compose, Nginx, Certbot, backups and restores. The Admin panel shows queue health, storage use and platform settings.',
  },
];

export default async function PublicSupportPage() {
  const auth = await getAuthContext().catch(() => null);
  const developerApiEnabled = await isDeveloperApiEnabled();
  const faq = developerApiEnabled
    ? FAQ
    : FAQ.map((item) => ({ ...item, a: item.a.replace('custom domains, bulk generation and the API', 'custom domains and bulk generation') }));

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader signedIn={Boolean(auth)} showApi={await isDeveloperApiEnabled()} />

      <main className="container flex-1 py-12">
        <PageHeader
          title="Contact & support"
          description="Answers to the questions people actually ask, and how to reach a person."
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card className="p-5">
            <SectionHeader title="Frequently asked" />
            <Accordion type="single" collapsible>
              {faq.map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`}>
                  <AccordionTrigger className="text-[14px]">{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <SectionHeader title="Get in touch" />
              <div className="space-y-2">
                <Button asChild variant="brand" className="w-full justify-start">
                  <a href={`mailto:${SUPPORT_EMAIL}?subject=QR%20ALTRIX%20support`}>
                    <Mail /> Email support
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href={supportWhatsApp('Hi, I need help with QR ALTRIX.')} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /> WhatsApp {SUPPORT_PHONE_DISPLAY}
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href={SUPPORT_TEL}>
                    <Phone /> Call {SUPPORT_PHONE_DISPLAY}
                  </a>
                </Button>
                <p className="px-1 text-[12.5px] leading-5 text-muted-foreground">
                  Support: <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                  <br />
                  How-to questions: <a className="underline" href={`mailto:${HELP_EMAIL}`}>{HELP_EMAIL}</a>
                  <br />
                  Anything else: <a className="underline" href={`mailto:${INFO_EMAIL}`}>{INFO_EMAIL}</a>
                  <br />
                  The same number takes SMS.
                </p>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/report-abuse">
                    <Flag /> Report a harmful QR code
                  </Link>
                </Button>
                {developerApiEnabled ? (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/developers">
                      <BookOpen /> API reference
                    </Link>
                  </Button>
                ) : null}
                {auth ? (
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/dashboard/support">
                      <LifeBuoy /> Support inside your dashboard
                    </Link>
                  </Button>
                ) : null}
              </div>
            </Card>

            <Card className="p-5">
              <SectionHeader title="Before you write" description="Including these makes it much quicker to help." />
              <ul className="space-y-1.5 text-[13px] text-muted-foreground">
                <li className="flex items-start gap-2">
                  <MessageCircle className="mt-0.5 size-3.5 shrink-0" /> The short link of the code
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="mt-0.5 size-3.5 shrink-0" /> What you expected, and what happened instead
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="mt-0.5 size-3.5 shrink-0" /> The phone or scanner app you used
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="mt-0.5 size-3.5 shrink-0" /> A photo of the printed code, if it is a print issue
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>

      <SiteFooter />
      <JsonLd data={graph(breadcrumbSchema(env.appUrl.replace(/\/+$/, ''), [{ name: 'Help & support', path: '/support' }]))} />
    </div>
  );
}
