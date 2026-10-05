import type { GuideCopy, GuideSlug } from '@/content/schema';

export const guides: Record<GuideSlug, GuideCopy> = {
  'how-to-create-a-qr-code': {
    title: 'How to Create a QR Code for Free – Step-by-Step Guide',
    description: 'Learn how to make a QR code in under a minute: choose the type, add your content, design it, test it and print it. Free, with no sign-up for static codes.',
    h1: 'How to create a QR code',
    name: 'How to create a QR code',
    intro: 'Making a QR code takes less than a minute. Making one that scans every time, looks good and still works in a year takes a few more decisions. This guide walks through both.',
    sections: [
      {
        heading: '1. Decide: static or dynamic',
        body: [
          'A static code stores the content in the pattern. It works forever and offline but cannot be edited or tracked. Use it for Wi-Fi, contact cards and links that will never change.',
          'A dynamic code stores a short link that you control. You can change the destination after printing and see every scan. Use it for anything printed in quantity or used in marketing.',
        ],
      },
      {
        heading: '2. Choose the type',
        body: [
          'Pick what should happen when someone scans: open a website, join Wi-Fi, save a contact, show a menu, play a video. Choosing the right type means people get exactly what they expect.',
        ],
      },
      {
        heading: '3. Add your content',
        body: [
          'Enter the link, network details or text. Keep it short: less content means a simpler pattern that scans faster. For dynamic codes the pattern stays simple whatever the destination.',
        ],
      },
      {
        heading: '4. Design it',
        body: [
          'Choose colours, a pattern style, corner shapes, a logo and a frame with a call to action like “Scan for menu”. Keep the code dark on a light background with strong contrast.',
          'Watch the scan-safety score: it warns about low contrast, oversized logos and missing margins before you print.',
        ],
      },
      {
        heading: '5. Test and print',
        body: [
          'Scan the code with at least two phones, one iPhone and one Android, from the distance people will use. Download SVG or PDF for print so it stays sharp at any size.',
        ],
      },
    ],
    faqs: [
      { q: 'Is it free to create a QR code?', a: 'Yes. On QR ALTRIX every feature is free, including dynamic codes and analytics.' },
      { q: 'Do I need an account?', a: 'Not for static codes. A free account is needed for dynamic codes so you can edit and track them.' },
      { q: 'Which file format should I download?', a: 'PNG for screens and documents; SVG, PDF or EPS for professional printing.' },
    ],
  },
  'static-vs-dynamic-qr-codes': {
    title: 'Static vs Dynamic QR Codes – Differences and When to Use Each',
    description: 'Static or dynamic QR code? Learn how each works, which can be edited and tracked, which expire, and which to choose for menus, packaging, Wi-Fi and ads.',
    h1: 'Static vs dynamic QR codes',
    name: 'Static vs dynamic',
    intro: 'Every QR code is either static or dynamic. The difference decides whether you can change it after printing, whether you can count scans, and — on many platforms — whether it stops working when a trial ends.',
    sections: [
      {
        heading: 'How a static QR code works',
        body: [
          'The content — a link, Wi-Fi password, contact — is encoded directly in the black and white squares. Nothing is looked up when someone scans, so it works offline and forever.',
          'The flip side: you cannot change it, and nobody can count its scans. A typo means a reprint.',
        ],
      },
      {
        heading: 'How a dynamic QR code works',
        body: [
          'The pattern contains a short link. When it is scanned, the link server records the scan and redirects to the destination you have set. Change the destination and every printed copy follows.',
          'Because the short link is short, the pattern stays simple and scans easily even when printed small.',
        ],
      },
      {
        heading: 'Do dynamic QR codes expire?',
        body: [
          'They should not, but on many services they do: free plans often limit you to a handful of dynamic codes or deactivate them after a trial, and the printed code stops working.',
          'On QR ALTRIX dynamic codes are free and unlimited and keep working until you pause or delete them.',
        ],
      },
      {
        heading: 'Which one should you use?',
        body: [
          'Static: Wi-Fi, vCard contacts, plain text, and links you are certain will never change.',
          'Dynamic: menus, packaging, posters, business cards, campaigns — anything printed in quantity or where you want to measure results.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I turn a static code into a dynamic one?', a: 'No, the pattern is different. Create a dynamic code and replace the printed one.' },
      { q: 'Are dynamic codes slower to scan?', a: 'The redirect adds a fraction of a second; the simpler pattern often makes them faster to read.' },
      { q: 'Do dynamic codes collect personal data?', a: 'On QR ALTRIX they record country, device and similar details, with IP addresses stored only as salted hashes.' },
    ],
  },
  'qr-code-size-for-print': {
    title: 'QR Code Size for Print – Minimum Size and Scanning Distance',
    description: 'How big should a QR code be? Minimum print sizes for business cards, flyers, posters and signs, the 10:1 distance rule, and quiet-zone and resolution tips.',
    h1: 'QR code size for print',
    name: 'Print size guide',
    intro: 'A QR code that is too small is the most common reason a print run fails. The right size depends on how far away people will scan it and how much data the code holds.',
    sections: [
      {
        heading: 'The 10:1 rule',
        body: [
          'A good rule of thumb: the code should be at least one tenth of the scanning distance. Scanned from 30 cm, make it 3 cm; from 2 metres, make it 20 cm.',
        ],
      },
      {
        heading: 'Minimum sizes by material',
        body: [
          'Business cards and labels: at least 2 × 2 cm.',
          'Flyers, menus and table tents: 3–4 cm.',
          'Posters seen from a few metres: 10–20 cm.',
          'Banners and building signs: scale with distance using the 10:1 rule.',
        ],
      },
      {
        heading: 'Keep the quiet zone',
        body: [
          'Leave a margin of empty space around the code — about four modules (the small squares) wide. Text or graphics touching the code are a common cause of failed scans.',
        ],
      },
      {
        heading: 'Use vector files',
        body: [
          'Download SVG, PDF or EPS for print. Vector files stay perfectly sharp at any size, while an enlarged PNG can blur.',
          'Dynamic codes have fewer modules, so they stay readable at small sizes where a long static link would not.',
        ],
      },
    ],
    faqs: [
      { q: 'What is the smallest QR code that works?', a: 'About 2 × 2 cm for close scanning, if the code holds little data and is printed sharply.' },
      { q: 'Does a logo change the minimum size?', a: 'A logo hides some modules; keep it under about a quarter of the code and raise error correction to Q or H.' },
      { q: 'What resolution should a PNG be?', a: 'For print, prefer vector. If you must use PNG, export at least 1000 px for small prints and more for large ones.' },
    ],
  },
  'qr-code-design-best-practices': {
    title: 'QR Code Design Best Practices – Colours, Logos and Frames',
    description: 'Design QR codes that look great and still scan: contrast rules, logo size, colours and gradients, frames and calls to action, and how to test before printing.',
    h1: 'QR code design best practices',
    name: 'Design best practices',
    intro: 'A branded QR code gets more scans than a plain one — as long as phones can still read it. These rules keep your design on the right side of that line.',
    sections: [
      {
        heading: 'Contrast comes first',
        body: [
          'Scanners need a dark pattern on a light background. Aim for a contrast ratio of at least 4:1, and avoid inverted (light on dark) codes unless you have tested them on many phones.',
        ],
      },
      {
        heading: 'Logos: small and centred',
        body: [
          'A logo covers part of the code. QR error correction can rebuild the missing part, but only up to a point: keep the logo under about 25% of the code and use error correction level Q or H.',
        ],
      },
      {
        heading: 'Colours and gradients',
        body: [
          'Brand colours work well if they are dark enough. Gradients are fine when both ends are dark. Pastel patterns, yellow and light grey fail most often.',
        ],
      },
      {
        heading: 'Add a frame and a call to action',
        body: [
          'Tell people why to scan: “Scan for menu”, “Get 10% off”, “Join our Wi-Fi”. Codes with a clear call to action are scanned far more often than bare codes.',
        ],
      },
      {
        heading: 'Test before you print',
        body: [
          'Use the scan-safety check, then scan a test print with an iPhone and an Android phone at the real size and distance.',
        ],
      },
    ],
    faqs: [
      { q: 'Can a QR code be any colour?', a: 'Yes, as long as the pattern is clearly darker than the background.' },
      { q: 'Do rounded or dotted patterns scan?', a: 'Yes, modern phones read them well; keep the corner squares clearly defined.' },
      { q: 'What is the scan-safety score?', a: 'A check in the editor that warns about low contrast, oversized logos and other risks before you download.' },
    ],
  },
};
