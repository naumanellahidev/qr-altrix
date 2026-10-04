'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/misc';

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Do dynamic QR codes really never expire?',
    a: (
      <>
        Yes. There is no trial, no subscription and no scan limit in QR ALTRIX. A dynamic code stops resolving only if
        you pause it, delete it, switch on a schedule or scan limit yourself, or if a platform administrator disables it
        for abuse. Nothing expires on a timer.
      </>
    ),
  },
  {
    q: 'What is the difference between a static and a dynamic code?',
    a: (
      <>
        A static code stores the content inside the pattern itself — it works without internet and cannot be changed or
        tracked. A dynamic code stores a short link that you control, so you can edit the destination after printing and
        see every scan. Dynamic codes also stay small and easy to scan, even for long destinations.
      </>
    ),
  },
  {
    q: 'Do I need an account to make a QR code?',
    a: (
      <>
        You can design one on this page without signing in. A free account is needed to download it, because the account
        is what keeps the code editable, trackable and recoverable. Signing up takes two fields and your design is
        carried across — nothing is retyped.
      </>
    ),
  },
  {
    q: 'Can I put my logo in the middle of the code?',
    a: (
      <>
        Yes — upload a PNG, JPG, WebP or SVG, or pick one of the built-in icons. The editor shows a live scan-safety
        score and will tell you when the logo is getting large enough that you should raise error correction to Q or H.
      </>
    ),
  },
  {
    q: 'Which file formats can I download?',
    a: (
      <>
        PNG, SVG, PDF, JPEG, WebP and EPS. SVG and PDF are vector, so they stay sharp on a billboard. For print, use PDF
        or SVG and keep the quiet zone at 4 modules.
      </>
    ),
  },
  {
    q: 'Can I use my own domain for the short links?',
    a: (
      <>
        Yes, and it costs nothing. Add a subdomain such as <code>links.yourbrand.com</code>, add the DNS record shown in
        the dashboard, and point an A or CNAME record at your server. Certbot issues the certificate, and you can choose
        a custom slug for every code.
      </>
    ),
  },
  {
    q: 'What do you store about the people who scan my codes?',
    a: (
      <>
        Only what analytics needs: country, region and city from your proxy, device type, browser, operating system,
        language, referrer and timestamp. IP addresses are salted and hashed so a unique visitor can be counted but not
        identified, and an administrator can set a retention period or switch IP hashing off entirely.
      </>
    ),
  },
  {
    q: 'Is there a limit on how many codes I can create?',
    a: (
      <>
        No product limit. The only caps are anti-abuse rate limits an administrator configures, and whatever your own
        server can hold. Bulk import handles tens of thousands of rows in one job.
      </>
    ),
  },
  {
    q: 'Can I run QR ALTRIX on my own VPS?',
    a: (
      <>
        That is the intended setup. The project ships with a Dockerfile, a Compose file for the app, PostgreSQL, Redis
        and the worker, an Nginx configuration with Certbot SSL, backup and restore scripts, and a production README for
        Ubuntu.
      </>
    ),
  },
  {
    q: 'What happens if I delete a QR code by accident?',
    a: (
      <>
        Deleting marks the code as deleted and keeps its scan history, so support can restore it from the database and
        the short code is never handed to anyone else. The printed pattern is safe as long as you do not permanently
        purge it.
      </>
    ),
  },
];

export function Faq({ expiryEnabled = false }: { expiryEnabled?: boolean }) {
  // The first answer must describe this install, not the default, or the page is lying.
  const faqs = expiryEnabled
    ? [
        {
          q: 'How long does a dynamic QR code stay live?',
          a: (
            <>
              The operator of this server has set an expiry policy, so dynamic codes have a lifetime. You always see the
              exact expiry date on the code&apos;s own page in your dashboard, and nothing is deleted when a code
              expires — the owner or an administrator can bring it back. A code also stops if you pause it, delete it,
              or set your own schedule or scan limit.
            </>
          ),
        },
        ...FAQS.slice(1),
      ]
    : FAQS;

  return (
    <section id="faq" className="scroll-mt-24 border-t border-border bg-surface py-16 sm:py-24">
      <div className="container grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] sm:text-[34px]">
            Questions, answered plainly
          </h2>
          <p className="mt-3 max-w-sm text-[15px] leading-7 text-muted-foreground">
            If something here is still unclear, the support page will reach a human.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.q} value={`item-${index}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
