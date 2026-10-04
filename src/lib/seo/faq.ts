/**
 * The homepage FAQ, in plain text. One source feeds both the visible questions and the
 * FAQPage structured data, which search engines require to match. Answers depend on the
 * operator's live settings so the page never states something this install does not do.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export function homeFaqs(opts: { expiryEnabled: boolean; guestStaticDownload: boolean }): FaqItem[] {
  return [
    opts.expiryEnabled
      ? {
          q: 'How long does a dynamic QR code stay live?',
          a: 'The operator of this server has set an expiry policy, so dynamic codes have a lifetime. You always see the exact date on the code’s page in your dashboard, and nothing is deleted when a code expires — the owner or an administrator can bring it back. A code also stops if you pause it, delete it, or set your own schedule or scan limit.',
        }
      : {
          q: 'Do dynamic QR codes really never expire?',
          a: 'Yes. There is no trial, no subscription and no scan limit. A dynamic code stops working only if you pause it, delete it, switch on a schedule or scan limit yourself, or if a platform administrator disables it for abuse. Nothing expires on a timer.',
        },
    {
      q: 'Is QR ALTRIX really free?',
      a: 'Yes. Every feature is free: unlimited dynamic QR codes, analytics, bulk generation, custom domains, teams and the API. There are no paid plans or upgrades, and nothing asks for a card.',
    },
    {
      q: 'What is the difference between a static and a dynamic QR code?',
      a: 'A static code stores the content inside the pattern itself — it works without internet but cannot be changed or tracked. A dynamic code stores a short link you control, so you can edit the destination after printing and see every scan. Dynamic codes also stay small and easy to scan, even for long destinations.',
    },
    {
      q: 'Do I need an account to make a QR code?',
      a: opts.guestStaticDownload
        ? 'Not for static codes: design one on this page and download it straight away. A free account is needed for dynamic codes, because the account is what keeps them editable, trackable and recoverable. Signing up takes two fields and your design is carried across.'
        : 'You can design one on this page without signing in. A free account is needed to download it, because the account keeps the code editable, trackable and recoverable. Signing up takes two fields and your design is carried across.',
    },
    {
      q: 'Can I put my logo in the middle of the QR code?',
      a: 'Yes — upload a PNG, JPG, WebP or SVG, or pick a built-in icon. The editor shows a live scan-safety score and tells you when the logo is large enough that you should raise error correction to Q or H.',
    },
    {
      q: 'Which file formats can I download?',
      a: 'PNG, SVG, PDF, JPEG, WebP and EPS. SVG, PDF and EPS are vector, so they stay sharp at any size. For print, use PDF or SVG and keep the quiet zone at 4 modules.',
    },
    {
      q: 'Can I use my own domain for the short links?',
      a: 'Yes, and it costs nothing. Add a subdomain such as links.yourbrand.com, add the DNS record shown in the dashboard, and choose a custom slug for every code.',
    },
    {
      q: 'What do you store about the people who scan my codes?',
      a: 'Only what analytics needs: country, region and city, device type, browser, operating system, language, referrer and time. IP addresses are salted and hashed so a unique visitor can be counted but not identified, and an administrator can set a retention period.',
    },
    {
      q: 'Is there a limit on how many QR codes I can create?',
      a: 'No product limit. The only caps are anti-abuse rate limits, and bulk import handles tens of thousands of rows in one job.',
    },
    {
      q: 'Can I run QR ALTRIX on my own server?',
      a: 'Yes. It ships with a Dockerfile, a Compose file for the app, PostgreSQL, Redis and the worker, an Nginx configuration with free SSL, backup and restore scripts, and a production guide.',
    },
    {
      q: 'What happens if I delete a QR code by accident?',
      a: 'Deleting marks the code as deleted and keeps its scan history, so it can be restored, and its short link is never handed to anyone else.',
    },
  ];
}
