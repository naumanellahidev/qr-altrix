import type { SeoDoc } from '@/content/seo/types';

/** Quick-answer pages, part 2: safety, dynamic codes, apps and "how to make a QR code for…". */
export const ANSWERS_2: SeoDoc[] = [
  // ---------------------------------------------------------------- safety
  {
    slug: 'is-it-safe-to-scan-a-qr-code',
    cat: 'safety',
    title: 'Is It Safe to Scan a QR Code? How to Tell If It Is Real',
    description: 'Scanning a QR code is safe in itself; the risk is the link inside. How to check a QR code before you open it, and the warning signs of a fake.',
    h1: 'Is it safe to scan a QR code?',
    name: 'Is scanning a QR code safe?',
    answer: 'Scanning is safe: a QR code is only text, and your phone shows the link before opening it. The risk is where the link goes. Scammers stick fake codes on parking meters and posters or send them by email (“quishing”) to lead you to phishing or payment pages. Check the web address before you tap, and never enter passwords or card details on a page opened from an unexpected QR code.',
    sections: [
      {
        h: 'How to check a QR code before opening it',
        list: [
          'Read the preview: phones show the domain before opening it. Is it the company you expect?',
          'Look at the code itself: is it a sticker on top of another code or sign? Stickers on parking meters and EV chargers are a known scam.',
          'Be suspicious of urgency: “pay now”, “your parcel is held”, “verify your account”.',
          'Prefer the official app or type the address yourself for payments and logins.',
          'Use the [online QR scanner](/tools/qr-code-scanner) on a screenshot to see the full link without opening it.',
        ],
      },
      {
        h: 'Can a QR code hack your phone?',
        p: [
          'Not by itself. The code is just text; scanning it does not install anything. Harm only happens if you then open a malicious page and download an app, enter details or approve a payment. Keep your phone updated and do not install apps from links. See [can a QR code hack your phone](/answers/can-a-qr-code-hack-your-phone).',
        ],
      },
      {
        h: 'If you already scanned a fake code',
        list: [
          'If you entered a password, change it at once and turn on two-factor authentication.',
          'If you paid or entered card details, call your bank immediately.',
          'Report it: in the UK to Action Fraud (or Report Fraud), in the US to the FTC at reportfraud.ftc.gov.',
        ],
      },
    ],
    faqs: [
      { q: 'Can a QR code steal my information?', a: 'The code cannot. A page it opens can ask you for information; do not give it unless you trust the site.' },
      { q: 'Are QR codes in emails safe?', a: 'Treat them like links in emails: if you did not expect it, do not scan it. See [QR code scams](/answers/qr-code-scams).' },
      { q: 'How do businesses keep their codes trustworthy?', a: 'Use a recognisable short-link domain (your own, if possible), print codes inside branded frames, and check public codes regularly for stickers.' },
    ],
  },
  {
    slug: 'can-a-qr-code-hack-your-phone',
    cat: 'safety',
    title: 'Can a QR Code Hack Your Phone? What Really Happens',
    description: 'A QR code cannot hack your phone on its own. Here is what can go wrong after scanning, real examples of QR scams, and how to stay safe.',
    h1: 'Can a QR code hack your phone?',
    name: 'Can a QR code hack you?',
    answer: 'No, not on its own. A QR code is a pattern that holds text, typically a link; scanning it does not run code or install anything. The danger is the page the link opens: a fake login page, a payment page or a download. You stay safe if you check the address before opening it and do not enter details or install apps from unexpected codes.',
    sections: [
      {
        h: 'What a malicious QR code can do',
        list: [
          'Open a phishing page that copies a bank, parcel service or parking app.',
          'Start a payment, a text message or a call (your phone asks you first).',
          'Offer a file or app to download.',
          'Join you to a Wi-Fi network chosen by the attacker (your phone asks first).',
        ],
        p: ['In every case the phone shows you what will happen, and you have to agree. That pause is your chance to stop.'],
      },
      {
        h: 'Staying safe',
        p: [
          'Keep your phone and browser updated, use the official app for payments, and be sceptical of codes in unexpected emails and stickers in public places. More in [is it safe to scan a QR code](/answers/is-it-safe-to-scan-a-qr-code).',
        ],
      },
    ],
    faqs: [
      { q: 'Can scanning a QR code give someone my location?', a: 'The code cannot. A web page can ask for your location, and your phone asks for permission first.' },
    ],
  },
  {
    slug: 'qr-code-scams',
    cat: 'safety',
    title: 'QR Code Scams (Quishing): Examples and How to Avoid Them',
    description: 'Quishing is phishing through QR codes. Common QR code scams in parking, email, parcels and payments, how to spot them and what to do if you scanned one.',
    h1: 'QR code scams (quishing) and how to avoid them',
    name: 'QR code scams',
    answer: 'Quishing is phishing with a QR code: the scammer hides a malicious link in a code so that email filters and people do not see it. Common versions are fake stickers on parking meters and EV chargers, emails asking you to scan to “re-verify” an account, fake parcel-delivery notes and codes for fake payments. The defence is simple: check the link before you open it and never log in or pay through an unexpected code.',
    sections: [
      {
        h: 'Common QR code scams',
        list: [
          'Parking and charging: a sticker over the real code leads to a fake payment site.',
          'Email quishing: “Scan to set up multi-factor authentication” or “your mailbox is full”.',
          'Parcel cards: a note saying a delivery failed, with a code to “reschedule” and pay a fee.',
          'Fake menus or Wi-Fi in public places.',
          'Payment requests: someone sends a code that takes money instead of sending it.',
        ],
      },
      {
        h: 'How to protect yourself',
        list: [
          'Check the domain in the preview before tapping.',
          'Use the official app or website for parking, banking and deliveries.',
          'Look for stickers placed over printed codes.',
          'Never scan a code to log in to an account unless you started the process yourself.',
        ],
      },
      {
        h: 'For businesses',
        p: [
          'Protect your customers by printing codes inside a branded frame, using a short-link domain people recognise and checking public signage. QR ALTRIX lets you use your own domain for dynamic codes and has an [abuse report page](/report-abuse) so anyone can flag a misused code.',
        ],
      },
    ],
    faqs: [
      { q: 'Where do I report a QR code scam?', a: 'UK: Action Fraud (Report Fraud) or forward phishing emails to report@phishing.gov.uk. US: reportfraud.ftc.gov. Also tell the business whose sign was tampered with.' },
    ],
  },

  // ---------------------------------------------------------------- dynamic, expiry, tracking
  {
    slug: 'do-qr-codes-expire',
    cat: 'dynamic',
    title: 'Do QR Codes Expire? Static vs Dynamic Explained',
    description: 'Static QR codes never expire. Dynamic QR codes only expire if the service behind them stops them. How to know and how to make a code that lasts.',
    h1: 'Do QR codes expire?',
    name: 'Do QR codes expire?',
    answer: 'Static QR codes never expire: the content is printed into the pattern and will scan as long as the print exists. Dynamic QR codes work through a short link run by a QR service, so they expire only if that service stops redirecting them, often at the end of a free trial or subscription. On QR ALTRIX dynamic codes are free and do not expire.',
    sections: [
      {
        h: 'Why some QR codes “expire”',
        p: [
          'A dynamic code holds a short link such as a QR service’s domain plus a code. The service looks up your destination and forwards the visitor. If you stop paying, many services show an “expired” or sign-up page instead. The code did not change; the service switched it off.',
          'A static code holding your own website address cannot be switched off by anyone, but it will stop being useful if your web page disappears.',
        ],
      },
      {
        h: 'How to make a QR code that lasts',
        list: [
          'For content that never changes (Wi-Fi, contact card, a permanent URL), use a [static code](/qr-code-generator/url).',
          'For anything printed in quantity, use a dynamic code from a service without time limits, so you can still fix the destination later.',
          'Keep the destination page alive, or redirect it when your website changes.',
          'Read the terms: “free” sometimes means free for 14 days. See the [best free QR code generator checklist](/best-free-qr-code-generator).',
        ],
      },
    ],
    faqs: [
      { q: 'How long is a QR code valid?', a: 'A static code: forever. A dynamic code: as long as its service keeps it active. On QR ALTRIX, until you pause or delete it.' },
      { q: 'Do Canva QR codes expire?', a: 'No. See [do Canva QR codes expire](/answers/do-canva-qr-codes-expire).' },
      { q: 'My code already expired. What now?', a: 'See [QR code expired: how to fix it](/answers/qr-code-expired-how-to-fix).' },
    ],
  },
  {
    slug: 'what-is-a-dynamic-qr-code',
    cat: 'dynamic',
    title: 'What Is a Dynamic QR Code? Meaning and Examples',
    description: 'A dynamic QR code holds a short link you can edit after printing and track. How it works, examples, and when to use dynamic instead of static.',
    h1: 'What is a dynamic QR code?',
    name: 'What is a dynamic QR code?',
    answer: 'A dynamic QR code stores a short link instead of the final content. When it is scanned, the short link records the scan and forwards the visitor to the destination you set. That means you can change the destination after printing, see how many people scanned and from where, and keep the pattern simple and easy to scan however long the real link is.',
    sections: [
      {
        h: 'What you can do with a dynamic code',
        list: [
          'Edit the link, PDF, menu or page at any time without reprinting.',
          'See scans by day, country, city, device and time.',
          'Add UTM tags for Google Analytics.',
          'Protect it with a password, schedule it or limit the number of scans.',
          'Send people to different pages by country, language or device ([smart link](/qr-code-generator/smart-link)).',
        ],
      },
      {
        h: 'Examples',
        list: [
          'A [restaurant menu](/qr-code-for/restaurant-menu) updated every week on the same table card.',
          'Product packaging that links to a manual today and a recall notice tomorrow.',
          'A poster campaign measured scan by scan.',
          'A [Google review](/qr-code-for/google-reviews) code on every receipt.',
        ],
      },
      {
        h: 'Static vs dynamic',
        p: [
          'A static code is fixed but needs nothing to keep working. A dynamic code needs its service to stay online. Read the full comparison in [static vs dynamic QR codes](/guides/static-vs-dynamic-qr-codes), or [create a dynamic QR code](/qr-code-generator/dynamic-url) for free.',
        ],
      },
    ],
    faqs: [
      { q: 'Are dynamic QR codes free?', a: 'On QR ALTRIX, yes: unlimited, with analytics, and they do not expire. You need a free account so you can edit them.' },
      { q: 'Is a dynamic QR code slower?', a: 'The redirect adds a fraction of a second; people do not notice it.' },
    ],
  },
  {
    slug: 'what-is-a-static-qr-code',
    cat: 'dynamic',
    title: 'What Is a Static QR Code? Meaning, Pros and Cons',
    description: 'A static QR code stores its content in the pattern. It is free, works offline and never expires, but cannot be edited or tracked. When to use one.',
    h1: 'What is a static QR code?',
    name: 'What is a static QR code?',
    answer: 'A static QR code stores its content, such as a link, Wi-Fi password or contact, directly in the pattern. Nothing is looked up when someone scans it, so it works offline, needs no account and never expires. The trade-off: you cannot change it after printing and nobody can count its scans.',
    sections: [
      {
        h: 'When static is the right choice',
        list: [
          '[Wi-Fi network](/qr-code-generator/wifi) logins.',
          '[Contact cards](/qr-code-generator/vcard) on business cards.',
          'A permanent link to your own website.',
          'Text, phone numbers and email addresses.',
          'Codes that must work without any third-party service.',
        ],
      },
      {
        h: 'When to use dynamic instead',
        p: [
          'If you print in quantity, might need to fix a mistake, or want to know how many people scanned, use a [dynamic QR code](/answers/what-is-a-dynamic-qr-code). On QR ALTRIX both are free; static codes download without an account.',
        ],
      },
    ],
    faqs: [
      { q: 'Are static QR codes free?', a: 'Yes, and they download without sign-up on QR ALTRIX.' },
      { q: 'Can a static QR code be tracked?', a: 'No. Its scans go straight to the destination. If it is your website, your web analytics will see the visits.' },
    ],
  },
  {
    slug: 'can-you-track-a-qr-code',
    cat: 'dynamic',
    title: 'Can You Track a QR Code? How QR Code Tracking Works',
    description: 'You can track scans of a dynamic QR code: count, time, country, city and device. How QR code tracking works, what it can and cannot see, and privacy.',
    h1: 'Can you track a QR code?',
    name: 'Can you track a QR code?',
    answer: 'Yes, if it is a dynamic QR code. Each scan passes through the code’s short link, which records the time, approximate location (country and city from the network), device type, operating system and browser before forwarding the visitor. A static QR code cannot be tracked, because it sends people straight to the destination.',
    sections: [
      {
        h: 'What QR code tracking shows',
        list: [
          'Total and unique scans over time.',
          'Country and city (from the IP address, not GPS).',
          'Device, operating system, browser and language.',
          'Time of day and day of week.',
          'Campaign, when you add UTM parameters.',
        ],
        p: ['QR ALTRIX shows these live and exports them to CSV and XLSX. IP addresses are hashed, not stored in readable form.'],
      },
      {
        h: 'What tracking cannot see',
        p: [
          'It cannot identify a person, their phone number or exact location. If you need to know who scanned, ask them on the page itself, for example with a [feedback form](/qr-code-generator/feedback-form) or an event registration.',
        ],
      },
      {
        h: 'Track scans in Google Analytics',
        p: [
          'Add UTM parameters (utm_source=qr, utm_medium=print, utm_campaign=spring) to the destination link and Google Analytics will separate QR visits from other traffic. QR ALTRIX has UTM fields on every dynamic code. See [how QR code tracking works](/guides/qr-code-tracking-and-analytics).',
        ],
      },
    ],
    faqs: [
      { q: 'Is QR code tracking legal?', a: 'Counting scans with anonymous, aggregated data is widely used. If you collect personal data on the destination page, follow privacy law (GDPR in the UK and EU).' },
      { q: 'Can I track a QR code someone else made?', a: 'No. Only the owner of the dynamic code sees its scans.' },
    ],
  },
  {
    slug: 'free-qr-code-generator-no-expiration',
    cat: 'dynamic',
    title: 'Free QR Code Generator With No Expiration or Sign-Up',
    description: 'Make free QR codes that never expire: static codes with no sign-up, and dynamic codes with no trial, no scan limit and no expiry date.',
    h1: 'Free QR code generator with no expiration',
    name: 'Free, no expiration',
    answer: 'QR ALTRIX makes free QR codes that do not expire. Static codes (links, Wi-Fi, contacts, text) download with no sign-up and work forever. Dynamic codes, which you can edit and track, need a free account but have no trial, no scan limit and no expiry date: they keep working until you pause or delete them.',
    sections: [
      {
        h: 'What is free',
        list: [
          'Every QR type: 12 static and 19 dynamic.',
          'Design: colours, gradients, shapes, logos and 32 frames.',
          'Downloads in PNG, SVG, PDF, JPEG, WebP and EPS.',
          'Unlimited dynamic codes with live analytics.',
          'Bulk generation from CSV.',
        ],
      },
      {
        h: 'How to spot a generator that will expire',
        list: [
          'It asks for a card before you can download.',
          'It talks about a “free trial” for dynamic codes.',
          'Its terms mention scan limits or deactivation.',
          'Downloads are watermarked or low resolution until you pay.',
        ],
        p: ['Use the full [best free QR code generator checklist](/best-free-qr-code-generator), or [create your QR code now](/#generator).'],
      },
    ],
    faqs: [
      { q: 'Why is it free?', a: 'QR ALTRIX is free and self-hostable software. The public site is supported by advertising on its guides, not by charging for codes.' },
      { q: 'Is there a watermark?', a: 'No watermark is printed over your code.' },
    ],
  },

  // ---------------------------------------------------------------- apps
  {
    slug: 'how-to-make-a-qr-code-in-canva',
    cat: 'apps',
    title: 'How to Make a QR Code in Canva (and a Better Option)',
    description: 'Step-by-step: add a QR code in Canva with the QR Code app, size and colour it, and when to use a dynamic QR code with tracking instead.',
    h1: 'How to make a QR code in Canva',
    name: 'QR code in Canva',
    answer: 'In Canva, open your design, click Apps in the left panel, search for “QR code”, open the QR Code app, paste your link and click Generate. The code is added to your design and you can resize and recolour it. Canva’s QR codes are static: they never expire, but you cannot edit the link or count scans after printing.',
    sections: [
      {
        h: 'Step by step',
        steps: [
          'Open or create a design in Canva.',
          'Click Apps (left side panel) and search for QR code.',
          'Choose the QR Code app and paste the URL.',
          'Optionally open Customise to change colours and margin.',
          'Click Generate QR code; drag and resize it in your design.',
          'Download as PDF Print for printing.',
        ],
      },
      {
        h: 'When to use a QR code from a QR generator',
        p: [
          'Canva makes a link-only code. If you need a Wi-Fi, contact, menu or PDF code, a logo in the centre, a frame, or a code you can change and track later, make it here and upload it to Canva:',
        ],
        steps: [
          'Create the code in the [free QR code generator](/#generator); choose dynamic if you want to edit and track it.',
          'Download SVG (or PNG at 1000 px+).',
          'In Canva, click Uploads › Upload files and drag the code into your design.',
        ],
      },
    ],
    faqs: [
      { q: 'Do Canva QR codes expire?', a: 'No. They are static. See [do Canva QR codes expire](/answers/do-canva-qr-codes-expire).' },
      { q: 'Can I track a Canva QR code?', a: 'Not in Canva. Use a dynamic code or add UTM tags to the link.' },
    ],
  },
  {
    slug: 'do-canva-qr-codes-expire',
    cat: 'apps',
    title: 'Do Canva QR Codes Expire? What You Need to Know',
    description: 'Canva QR codes are static, so they do not expire. But they cannot be edited or tracked. When that is fine, and when to use a dynamic code instead.',
    h1: 'Do Canva QR codes expire?',
    name: 'Do Canva QR codes expire?',
    answer: 'No. QR codes made with Canva’s QR Code app are static: the link is stored in the pattern itself, so the code keeps scanning for as long as the print exists and the website it points to is online. The limitation is the opposite of expiry: you can never change the link or see how many people scanned it.',
    sections: [
      {
        h: 'When a Canva QR code is fine',
        p: [
          'For a link that will never change, such as your homepage, a static code from Canva is perfect. If the page might move, use a dynamic code so you can update it after printing, and track results. [What is a dynamic QR code?](/answers/what-is-a-dynamic-qr-code)',
        ],
      },
    ],
    faqs: [
      { q: 'My Canva QR code stopped working. Why?', a: 'The page it links to has moved or gone. Redirect that address on your website, or replace the code.' },
    ],
  },
  {
    slug: 'how-to-make-a-qr-code-in-word',
    cat: 'apps',
    title: 'How to Make a QR Code in Microsoft Word',
    description: 'Two ways to put a QR code in Word: insert one from a QR generator, or use Word’s DISPLAYBARCODE field. Step-by-step with sizing tips.',
    h1: 'How to make a QR code in Microsoft Word',
    name: 'QR code in Word',
    answer: 'The simplest way is to create the QR code in a generator, download it as PNG or SVG, and in Word choose Insert › Pictures › This Device. Word can also generate a code itself with the DISPLAYBARCODE field: press Ctrl + F9, type DISPLAYBARCODE "https://example.com" QR \\q 3 between the braces, then press F9 to show the code.',
    sections: [
      {
        h: 'Method 1: insert a QR code image',
        steps: [
          'Create your code in the [free QR code generator](/#generator) and download SVG or PNG.',
          'In Word: Insert › Pictures › This Device and choose the file.',
          'Right-click › Wrap Text › In Line with Text (or Square) to place it.',
          'Resize with the corner handles only, so it stays square; at least 2 × 2 cm for print.',
        ],
      },
      {
        h: 'Method 2: Word’s built-in barcode field',
        steps: [
          'Click where the code should go and press Ctrl + F9 to insert field braces { }.',
          'Inside, type: DISPLAYBARCODE "https://example.com" QR \\q 3',
          'Press F9 (or right-click › Toggle Field Codes) to show the QR code.',
        ],
        p: [
          '\\q sets error correction (0 = L to 3 = H). The field works in desktop Word on Windows and Mac. It makes a plain black link code; for logos, frames, other content types or tracking, use method 1.',
        ],
      },
      {
        h: 'Many codes in one document',
        p: [
          'For labels or name badges with a different code each, generate them with the [bulk QR code generator](/tools/bulk-qr-code-generator) and insert them with mail merge, or lay out the ZIP of images.',
        ],
      },
    ],
    faqs: [
      { q: 'Does Word have a QR code generator?', a: 'Yes, the DISPLAYBARCODE field. It has no design options.' },
      { q: 'Will the QR code print sharply from Word?', a: 'Yes if you insert SVG or a large PNG. Small PNGs blur when enlarged.' },
    ],
  },
  {
    slug: 'how-to-make-a-qr-code-in-excel',
    cat: 'apps',
    title: 'How to Make QR Codes in Excel (One or Hundreds)',
    description: 'Make QR codes from Excel data: insert one QR image, or generate hundreds from a spreadsheet with a bulk QR code generator. No add-ins or VBA.',
    h1: 'How to make QR codes in Excel',
    name: 'QR codes in Excel',
    answer: 'Excel has no built-in QR code function. For one code, create it in a QR generator and use Insert › Pictures. For a whole column of links, product IDs or names, save the sheet as CSV and upload it to a bulk QR code generator, which creates every code at once and gives you a ZIP of images named from your data.',
    sections: [
      {
        h: 'Many codes from a spreadsheet',
        steps: [
          'Put one row per code in Excel, with columns such as name and URL.',
          'File › Save As › CSV UTF-8.',
          'Open the [bulk QR code generator](/tools/bulk-qr-code-generator), upload the CSV and map the columns.',
          'Check the preview; each row is validated before anything is created.',
          'Download the ZIP of codes, or create them as dynamic codes you can edit later.',
        ],
      },
      {
        h: 'What about formulas and add-ins?',
        p: [
          'Formulas that build a QR image from a web address send every cell’s content to a third-party image service, which is a privacy risk for customer or stock data and breaks if that service changes. Add-ins and VBA work but must be installed on every computer. Generating the codes once and inserting images is simpler and works offline.',
        ],
      },
      {
        h: 'Using QR codes for stock',
        p: [
          'If the goal is inventory or asset tracking, see [how to use QR codes for inventory management](/guides/qr-code-inventory-management).',
        ],
      },
    ],
    faqs: [
      { q: 'Can Excel scan QR codes?', a: 'Excel cannot, but a USB barcode scanner that reads QR codes types the content into the active cell like a keyboard.' },
      { q: 'Can I put a QR code in every row?', a: 'Yes: generate them in bulk, then insert the images or link to them.' },
    ],
  },
  {
    slug: 'how-to-make-a-qr-code-in-google-docs',
    cat: 'apps',
    title: 'How to Add a QR Code to Google Docs or Slides',
    description: 'Add a QR code to Google Docs, Slides or Sheets: create it, upload the image, size it for print. Plus a quick way to share a doc by QR code.',
    h1: 'How to add a QR code to Google Docs, Slides or Sheets',
    name: 'QR code in Google Docs',
    answer: 'Google Docs has no QR button, so create the code in a QR generator, download it as PNG, then in Docs or Slides choose Insert › Image › Upload from computer. In Sheets, use Insert › Image › Insert image in cell. To share the document itself by QR code, copy its share link (with access set to “Anyone with the link”) and make a QR code from that link.',
    sections: [
      {
        h: 'Share a Google Doc, Sheet or Form by QR code',
        steps: [
          'Click Share and set General access to Anyone with the link (Viewer).',
          'Copy the link.',
          'Paste it into the [free QR code generator](/#generator). A dynamic code lets you swap the document later.',
          'Download and print or insert the code.',
        ],
        p: ['For forms, see [QR code for Google Forms](/qr-code-for/google-forms).'],
      },
      {
        h: 'Tips',
        list: [
          'Download PNG at 1000 px so it stays sharp when printed from Docs.',
          'Keep a white margin around the code in your layout.',
          'If people get “You need access”, the sharing setting is still Restricted.',
        ],
      },
    ],
    faqs: [
      { q: 'Can Google Chrome make a QR code for a page?', a: 'Yes, Chrome’s share menu can create a plain QR code for the current page. It has no design, logo or tracking.' },
    ],
  },

  // ---------------------------------------------------------------- making
  {
    slug: 'how-to-make-a-qr-code-for-a-link',
    cat: 'making',
    title: 'How to Make a QR Code for a Link (URL) – Free',
    description: 'Turn any link into a QR code in seconds: paste the URL, choose static or dynamic, design and download. Free, no sign-up for static codes.',
    h1: 'How to make a QR code for a link',
    name: 'QR code for a link',
    answer: 'Copy the link, open a QR code generator, choose the Website/URL type, paste the link and download the code as PNG or SVG. That gives you a static code that works forever. If you might change the link or want to count scans, choose a dynamic URL code instead; it is still free on QR ALTRIX.',
    sections: [
      {
        h: 'Step by step',
        steps: [
          'Copy the full link, including https://.',
          'Open the [URL QR code generator](/qr-code-generator/url) (or [dynamic URL](/qr-code-generator/dynamic-url) to edit and track it).',
          'Paste the link; the code updates as you type.',
          'Add colours, a logo or a “Scan me” frame.',
          'Download PNG for screens, SVG or PDF for print.',
          'Scan it with your phone before sharing.',
        ],
      },
      {
        h: 'Tips for link QR codes',
        list: [
          'Shorter links make simpler codes that scan from further away.',
          'Use a page made for phones; people will open it on mobile.',
          'Add UTM tags to see QR visits in Google Analytics.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I make a QR code for any website?', a: 'Yes, any public web address works.' },
      { q: 'Can I change the link later?', a: 'Only with a dynamic code. [Can a QR code be changed?](/answers/can-qr-codes-be-reused)' },
    ],
  },
  {
    slug: 'can-you-text-a-qr-code',
    cat: 'making',
    title: 'Can You Text a QR Code? Send and Make SMS QR Codes',
    description: 'You can send a QR code by text as an image, and you can make a QR code that opens a ready-to-send text message. How to do both.',
    h1: 'Can you text a QR code?',
    name: 'Text a QR code',
    answer: 'Yes, in two ways. You can send a QR code by text as a picture (the recipient saves it and scans it from their gallery). Or you can make an SMS QR code: when someone scans it, their messaging app opens with your number and a pre-written message ready to send, which is useful for opt-ins, competitions and support.',
    sections: [
      {
        h: 'Make an SMS QR code',
        steps: [
          'Open the [SMS QR code generator](/qr-code-generator/sms).',
          'Enter the phone number in international format (for example +44…).',
          'Write the message, such as “JOIN” or “I would like a callback”.',
          'Design and download the code.',
        ],
        p: ['The person still taps Send: the code never sends a message on its own. For WhatsApp, use a [WhatsApp QR code](/qr-code-for/whatsapp).'],
      },
      {
        h: 'Sending a QR code as an image',
        p: [
          'A QR code in a text message is harder to scan on the same phone. Recipients have to save it and read it from Photos or an [online scanner](/answers/how-to-scan-a-qr-code-on-your-phone-screen). If you are sending by text anyway, send the link itself as well.',
        ],
      },
    ],
    faqs: [
      { q: 'Can a QR code send a text message automatically?', a: 'No. It opens the message; the person must press Send.' },
    ],
  },
  {
    slug: 'how-to-make-a-qr-code-for-an-email-address',
    cat: 'making',
    title: 'How to Make a QR Code for an Email Address',
    description: 'Make a QR code that opens a new email with your address, subject and message filled in. Free email QR code generator, with tips and uses.',
    h1: 'How to make a QR code for an email address',
    name: 'QR code for email',
    answer: 'Use an email QR code: enter the address, and optionally a subject and message, in an email QR code generator. When someone scans it, their email app opens a new message to you with those fields filled in. It works offline as a static code and needs no account.',
    sections: [
      {
        h: 'Step by step',
        steps: [
          'Open the [email QR code generator](/qr-code-generator/email).',
          'Enter the email address, a subject (for example “Quote request”) and a message.',
          'Download and print it.',
        ],
      },
      {
        h: 'Good uses',
        list: [
          'Support and complaints on packaging.',
          'Quote requests on vans and site signs.',
          'RSVP or questions on invitations.',
          'Feedback in hotels and shops (or use a [feedback form](/qr-code-generator/feedback-form) for structured answers).',
        ],
      },
    ],
    faqs: [
      { q: 'Does the email send automatically?', a: 'No. The person reviews the message and taps Send.' },
      { q: 'Can I add my email to a contact QR code instead?', a: 'Yes, a [vCard QR code](/qr-code-generator/vcard) saves your name, phone and email together.' },
    ],
  },
  {
    slug: 'how-to-get-a-qr-code-for-a-location',
    cat: 'making',
    title: 'How to Get a QR Code for a Location (Google Maps)',
    description: 'Make a QR code that opens a place in Google Maps or Apple Maps: from a map link or coordinates. For shops, events, deliveries and property.',
    h1: 'How to get a QR code for a location',
    name: 'QR code for a location',
    answer: 'Find the place in Google Maps, tap Share and copy the link, then paste it into a QR code generator. Scanning opens the location in the phone’s maps app with directions one tap away. Alternatively, use a location QR code with the latitude and longitude, which works for places without an address, such as a field entrance or a gate.',
    sections: [
      {
        h: 'Two ways',
        steps: [
          'Google Maps link: search the place, tap Share › Copy link, and paste it into the [URL QR code generator](/qr-code-generator/url).',
          'Coordinates: in Google Maps, long-press the exact spot to see latitude and longitude, then use the [location QR code generator](/qr-code-generator/location).',
        ],
      },
      {
        h: 'Where location codes help',
        list: [
          'Wedding and event invitations: see [QR code for weddings](/qr-code-for/weddings).',
          'Delivery instructions for a hidden entrance.',
          'Property signs and open houses.',
          'Business cards and shop windows.',
        ],
      },
    ],
    faqs: [
      { q: 'Does it work on iPhone?', a: 'Yes. A Google Maps link opens in Google Maps if installed, otherwise in the browser; a coordinates code opens Apple Maps or the default map app.' },
    ],
  },
  {
    slug: 'can-you-put-a-qr-code-on-a-business-card',
    cat: 'making',
    title: 'Should You Put a QR Code on a Business Card?',
    description: 'Is a QR code on a business card a good idea? What to link to, how big to print it, where to place it, and why a digital business card works best.',
    h1: 'Should you put a QR code on a business card?',
    name: 'QR code on a business card',
    answer: 'Yes, if it does something useful. The best QR code for a business card saves your contact details to the phone in one tap (a vCard) or opens a digital business card with your photo, links and portfolio. Print it at least 2 × 2 cm on the back or a corner, with a short line such as “Scan to save my contact”.',
    sections: [
      {
        h: 'What the code should open',
        list: [
          '[vCard](/qr-code-generator/vcard): saves name, phone, email, company and address, offline.',
          '[Digital business card](/qr-code-generator/digital-business-card): a mobile page with photo, buttons and social links that you can update.',
          '[LinkedIn profile](/qr-code-for/linkedin) or portfolio link.',
        ],
      },
      {
        h: 'Design tips',
        list: [
          'Back of the card, or a clear corner on the front.',
          '2–2.5 cm square, with a white margin.',
          'Use your brand colour, dark enough to scan.',
          'Matte finish rather than gloss or foil behind the code.',
        ],
        p: ['Full walkthrough: [QR code business cards](/qr-code-for/business-cards).'],
      },
    ],
    faqs: [
      { q: 'Is a QR code on a business card unprofessional?', a: 'Not when it saves people typing your details. A code to a generic homepage adds little.' },
    ],
  },
];
