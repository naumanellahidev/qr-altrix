import type { SeoDoc } from '@/content/seo/types';

/** Long English guides, part 2: industries, print and security. */
export const GUIDE_ARTICLES_2: SeoDoc[] = [
  {
    slug: 'how-to-make-a-wifi-qr-code',
    cat: 'howto',
    type: 'WIFI',
    title: 'How to Make a Wi-Fi QR Code (and Share Wi-Fi on Phones)',
    description: 'Make a Wi-Fi QR code guests scan to join without typing the password. Plus how to show your Wi-Fi QR on iPhone and Android, and security tips.',
    h1: 'How to make a Wi-Fi QR code',
    name: 'Wi-Fi QR code guide',
    answer: 'Open a Wi-Fi QR code generator, enter the network name (SSID) exactly as it appears, the password and the security type (usually WPA/WPA2), then download and print the code. Guests point their camera at it and tap “Join”. The code is static and works offline, so nothing is sent to any server, and it keeps working until you change the password.',
    sections: [
      {
        h: 'Step by step',
        steps: [
          'Find your network name and password, usually on the router sticker or in its settings.',
          'Open the [Wi-Fi QR code generator](/qr-code-generator/wifi).',
          'Enter the network name exactly, including capitals and spaces.',
          'Enter the password and choose the security: WPA/WPA2/WPA3 for almost all modern routers, WEP only for very old ones, or none for open networks.',
          'Tick “hidden network” only if your network does not broadcast its name.',
          'Add a frame such as “Free Wi-Fi: scan to join”, download and print.',
          'Test it: forget the network on your phone, scan, and join.',
        ],
      },
      {
        h: 'How the code works',
        p: [
          'A Wi-Fi QR code holds a short text in a standard format, for example WIFI:T:WPA;S:CafeGuest;P:password;; that iPhone (iOS 11+) and Android phones recognise. Because the details are in the pattern itself, the code works without internet and no service can switch it off. If you change the password, make a new code.',
        ],
      },
      {
        h: 'Show your Wi-Fi as a QR code from your phone',
        list: [
          'Android 10 and later: Settings › Network › Wi-Fi › tap the connected network › Share. After you confirm with your PIN or fingerprint, a QR code appears.',
          'iPhone with iOS 18: open the Passwords app › Wi-Fi › choose the network › Show Network QR Code.',
          'Older iPhones can share a password with nearby Apple devices, but not as a QR code: make one with the generator.',
        ],
      },
      {
        h: 'Security tips',
        list: [
          'Use a separate guest network for visitors, so they cannot reach your own devices.',
          'Anyone who can photograph the code can join; put it inside the venue, not in the window.',
          'Change the guest password every few months and replace the code.',
          'The generator draws static codes in your browser; your password is not stored.',
        ],
      },
    ],
    faqs: [
      { q: 'Does a Wi-Fi QR code expire?', a: 'No. It works until you change the network name or password.' },
      { q: 'Why does the Wi-Fi QR code not connect?', a: 'Usually a typo in the name or password, or the wrong security type. Recreate it and test it.' },
      { q: 'Can I put a Wi-Fi code on the menu?', a: 'Yes, it is one of the most useful additions to a [menu card](/guides/how-to-create-a-qr-code-menu).' },
    ],
  },
  {
    slug: 'qr-code-marketing-ideas',
    cat: 'business',
    type: 'WEBSITE',
    title: '30 QR Code Marketing Ideas That Actually Get Scanned',
    description: 'Practical QR code marketing ideas for shops, restaurants, events, packaging, print ads and social media, with what each code should open.',
    h1: '30 QR code marketing ideas that get scanned',
    name: 'QR code marketing ideas',
    answer: 'QR codes work in marketing when they connect a physical moment to something useful on the phone: a discount at the till, a menu at the table, a video on a product, a review request after a good experience. Use a dynamic code for each placement so you can change offers and measure scans, and always pair the code with a clear benefit.',
    sections: [
      {
        h: 'In-store and hospitality',
        list: [
          'Counter card: “Review us on Google”. [How to](/guides/how-to-get-more-google-reviews-with-qr-codes).',
          'Table tent: menu, specials and Wi-Fi.',
          'Shop window: today’s offers or booking page, readable from the pavement.',
          'Fitting room: “Scan for other sizes and colours”.',
          'Receipt: loyalty sign-up or survey.',
          'Queue area: app download or order-ahead.',
        ],
      },
      {
        h: 'Print and outdoor',
        list: [
          'Flyers: a landing page with the offer and a booking button.',
          'Posters: event tickets or a trailer.',
          'Direct mail: personalised codes per recipient from the [bulk generator](/tools/bulk-qr-code-generator).',
          'Vehicle wraps: phone call or WhatsApp, large enough for a parked van.',
          'Property signs: listing page with photos and a viewing form.',
          'Bus stop or magazine ads: a coupon with a scan limit.',
        ],
        p: ['Design tips: [QR code flyer and poster design](/guides/qr-code-flyer-and-poster-design).'],
      },
      {
        h: 'Packaging and products',
        list: [
          'How-to video or setup guide.',
          'Recipes and serving ideas.',
          'Origin and sustainability story.',
          'Warranty registration.',
          'Reorder page or subscription.',
          'GS1 Digital Link for retail-ready products.',
        ],
      },
      {
        h: 'Digital and social',
        list: [
          'Instagram or TikTok profile on in-store signage.',
          'Link-in-bio page with all your channels.',
          'Presentation slides: download the deck or connect.',
          'Webinar or livestream screens: sign-up form.',
          'Email footers for people reading on desktop: open on phone.',
          'Podcast or Spotify playlist on merch.',
        ],
      },
      {
        h: 'Make every idea measurable',
        p: [
          'Use one dynamic code per placement, add UTM tags and compare scans to sales or sign-ups. Codes that get few scans usually have a weak call to action or poor placement, not a bad offer. See [QR code tracking](/guides/qr-code-tracking-and-analytics) and [call to action examples](/guides/qr-code-call-to-action-examples).',
        ],
      },
    ],
    faqs: [
      { q: 'Do people still scan QR codes?', a: 'Yes. Since phone cameras read them natively, scanning is a normal habit for menus, payments, parking and tickets.' },
      { q: 'What is the best QR type for marketing?', a: 'A dynamic URL or landing page, so you can change the offer and measure results.' },
    ],
  },
  {
    slug: 'qr-code-flyer-and-poster-design',
    cat: 'print',
    title: 'QR Codes on Flyers and Posters: Size, Placement, Design',
    description: 'Put QR codes on flyers and posters that people scan: size for the viewing distance, placement, colours, call to action and testing before print.',
    h1: 'How to put a QR code on a flyer or poster',
    name: 'Flyer and poster design',
    answer: 'Size the code for the distance (about one tenth of how far people stand: 3–5 cm on a flyer, 10–20 cm on a poster), place it at the bottom-right or near the main message, keep a clear white margin, add a short call to action next to it, and download a vector file (SVG or PDF) for the printer. Test a printed proof before the full run.',
    sections: [
      {
        h: 'Size by format',
        list: [
          'A6/A5 flyer held in hand: 3–4 cm.',
          'A4 flyer on a noticeboard: 4–5 cm.',
          'A3 poster: 8–10 cm.',
          'A2–A1 poster: 12–20 cm.',
          'Window or pavement sign: 20 cm+.',
        ],
        p: ['Read more: [how far away a QR code can be scanned](/answers/how-far-away-can-a-qr-code-be-scanned).'],
      },
      {
        h: 'Placement',
        list: [
          'Where the eye ends: bottom right on Western layouts, beside the offer or date.',
          'Not on folds, edges or the back panel of a tri-fold that nobody sees.',
          'Away from glossy spot finishes and dark photos.',
          'At a height people can reach and scan comfortably on posters (1–1.6 m).',
        ],
      },
      {
        h: 'Design',
        list: [
          'A light panel behind the code, including the quiet zone.',
          'A dark brand colour for the code; logo in the centre if you like. [Logo rules](/answers/qr-code-logo-size).',
          'A short call to action: “Scan to book”, “Scan for tickets”. [Examples](/guides/qr-code-call-to-action-examples).',
          'A printed short URL under the code for people who cannot scan.',
        ],
      },
      {
        h: 'Before you print',
        steps: [
          'Use a dynamic code, so a typo or a sold-out offer can be fixed after printing.',
          'Download SVG or PDF and place it in your design without resizing it out of proportion.',
          'Order or print a proof.',
          'Scan the proof with an iPhone and an Android phone from the expected distance.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I use a Canva flyer template?', a: 'Yes. Make the code here for logo, tracking and frames, download SVG and upload it to Canva. [How](/answers/how-to-make-a-qr-code-in-canva).' },
      { q: 'Should the code go on both sides?', a: 'Once is enough, on the side with the call to action.' },
    ],
  },
  {
    slug: 'qr-codes-for-real-estate-marketing',
    cat: 'industry',
    type: 'LANDING_PAGE',
    title: 'QR Codes for Real Estate: Signs, Flyers and Open Houses',
    description: 'How estate agents and realtors use QR codes on for-sale signs, flyers, window cards and open houses: listing pages, virtual tours, viewings and leads.',
    h1: 'QR codes for real estate marketing',
    name: 'QR codes for real estate',
    answer: 'Put a dynamic QR code on every sign, window card and flyer that opens the listing on a phone: photos, price, floor plan, virtual tour and a button to book a viewing or call. Because the code is dynamic, the same sign rider can point to the next property after a sale, and scan counts show which properties and locations get attention.',
    sections: [
      {
        h: 'Where agents use QR codes',
        list: [
          'For-sale and to-let sign riders: listing page, readable from the pavement (15–20 cm code).',
          'Window cards in the office: each property’s page.',
          'Flyers and brochures: virtual tour or video.',
          'Open houses: sign-in form at the door, so you capture visitor details.',
          'Business cards: [digital business card](/qr-code-generator/digital-business-card).',
          'Direct mail: valuation request page.',
        ],
      },
      {
        h: 'What the code should open',
        list: [
          'A [landing page](/qr-code-generator/landing-page) with photos, key facts and a call button.',
          'An [image gallery](/qr-code-generator/image-gallery) of the property.',
          'A [video tour](/qr-code-generator/video) or YouTube walkthrough.',
          'A [PDF brochure](/qr-code-generator/pdf) with the floor plan.',
          'A [phone call](/qr-code-generator/phone-call) or [WhatsApp chat](/qr-code-for/whatsapp) with the agent.',
        ],
      },
      {
        h: 'Reuse sign riders',
        p: [
          'Print one durable sign rider with a dynamic code per sign, not per property. When the house sells, edit the code to point to the next listing or a “sold – similar homes” page. Scan analytics show which streets bring the most interest and what time people look.',
        ],
      },
      {
        h: 'Compliance tip',
        p: [
          'Property advertising rules (for example on material information in the UK) apply to the page the code opens as well as to the sign. Keep price, tenure and key information on the landing page accurate and up to date.',
        ],
      },
    ],
    faqs: [
      { q: 'How big should a QR code on a for-sale sign be?', a: 'At least 15 cm for people reading from the pavement; test from the kerb.' },
      { q: 'Can I see who scanned my sign?', a: 'You see anonymous counts, time and area. Use a viewing request form to capture leads.' },
    ],
  },
  {
    slug: 'qr-code-wedding-ideas',
    cat: 'events',
    type: 'EVENT_PAGE',
    title: 'QR Codes for Weddings: Invitations, RSVPs and Photo Sharing',
    description: 'Wedding QR code ideas: RSVP and wedding website on invitations, venue directions, a guest photo gallery, seating chart, Wi-Fi and gift list.',
    h1: 'QR code ideas for weddings',
    name: 'Wedding QR code ideas',
    answer: 'The most useful wedding QR codes are an RSVP or wedding-website code on the invitation, a directions code for the venue, a photo-sharing code on the tables so guests upload their pictures, and a seating-chart code at the entrance. Make them dynamic so you can update details after printing, and print them in a colour that matches your stationery but stays dark enough to scan.',
    sections: [
      {
        h: 'Before the day',
        list: [
          'Save-the-date: [add to calendar](/qr-code-generator/calendar-event).',
          'Invitation: wedding website (The Knot, Zola, Withjoy or your own) or an RSVP form.',
          'Directions: [location code](/answers/how-to-get-a-qr-code-for-a-location) for the ceremony and reception.',
          'Gift list or honeymoon fund link.',
          'Accommodation page with hotel links.',
        ],
      },
      {
        h: 'On the day',
        list: [
          'Seating chart at the entrance (a PDF or image).',
          'Order of service or menu.',
          'Guest photo sharing: a link to a shared album, on table cards.',
          'Live stream link for guests who cannot attend.',
          'Venue Wi-Fi.',
        ],
      },
      {
        h: 'After the day',
        list: [
          'Thank-you cards: a [gallery of the best photos](/qr-code-generator/image-gallery) or a [video](/qr-code-generator/video).',
          'Keep the same dynamic code from the table cards and point it to the professional album when it is ready.',
        ],
      },
      {
        h: 'Design tips for stationery',
        list: [
          'Use a dark ink from your palette (navy, forest green, burgundy) on cream or white.',
          'At least 2.5 cm on invitations, 4 cm on table cards.',
          'Add a few words: “Scan to RSVP by 1 June”.',
          'Print a proof on the real card stock; textured and metallic papers can stop codes scanning.',
        ],
        p: ['Create the codes with the free [event page generator](/qr-code-generator/event-page), or see [QR codes for weddings](/qr-code-for/weddings).'],
      },
    ],
    faqs: [
      { q: 'Will older guests be able to scan?', a: 'Most can, but print the website address too and keep paper RSVP cards for those who prefer them.' },
      { q: 'Can I change the wedding details after printing invitations?', a: 'Yes, if the code is dynamic.' },
    ],
  },
  {
    slug: 'qr-codes-on-product-packaging',
    cat: 'print',
    type: 'PRODUCT',
    title: 'QR Codes on Product Packaging: Ideas, Size and GS1',
    description: 'Use QR codes on packaging for instructions, recipes, origin, warranty and reorders. Sizes, placement, dynamic codes and the GS1 Digital Link standard.',
    h1: 'QR codes on product packaging',
    name: 'QR codes on packaging',
    answer: 'A packaging QR code should open something buyers want after purchase: setup videos, instructions, recipes, ingredients and origin, warranty registration or a reorder page. Print it at least 2 × 2 cm on a flat panel with a short call to action. Use dynamic codes, because packaging lives for years, and consider GS1 Digital Link if the product is sold in retail.',
    sections: [
      {
        h: 'What to link to',
        list: [
          'Setup or how-to [video](/qr-code-generator/video).',
          'Manual or safety sheet as a [PDF](/qr-code-generator/pdf).',
          'A [product page](/qr-code-generator/product-page) with specs, care and support.',
          'Recipes and serving ideas for food and drink.',
          'Origin, sustainability and recycling information.',
          'Warranty registration or [feedback form](/qr-code-generator/feedback-form).',
        ],
      },
      {
        h: 'Why dynamic codes matter on packaging',
        p: [
          'Boxes printed today are on shelves and in homes for years. A dynamic code lets you update the manual, fix a broken link, add a recall notice or switch languages by country with [smart routing](/qr-code-generator/smart-link), all without changing the print. Scan data shows which products customers actually look up.',
        ],
      },
      {
        h: 'GS1 Digital Link and retail checkouts',
        p: [
          'Retailers are moving from 1D barcodes to 2D codes. GS1 Digital Link puts the product’s GTIN inside a web address, so one QR code can be scanned at the till as a product number and by shoppers as a link. The GS1 “Sunrise 2027” goal is for US retail scanners to accept 2D codes by the end of 2027. Make one with the [GS1 Digital Link generator](/qr-code-generator/gs1-digital-link), using your own GS1-issued GTIN.',
        ],
      },
      {
        h: 'Print specs',
        list: [
          'At least 2 × 2 cm; larger on uncoated or corrugated board.',
          'Flat panel, away from folds, seams and curves over tight radii.',
          'Dark code on a light area; avoid metallic and holographic films behind it.',
          'Error correction Q or H for rough handling.',
          'Vector artwork (SVG, PDF or EPS) supplied to the printer.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I use the same QR code on every product?', a: 'You can, but a code per product (or per line) gives better data and more relevant pages. Use the [bulk generator](/tools/bulk-qr-code-generator).' },
      { q: 'Do I need GS1 membership?', a: 'For a GS1 Digital Link with a real GTIN, yes, since GTINs are issued by GS1. Plain marketing QR codes need nothing.' },
    ],
  },
  {
    slug: 'bulk-qr-codes-from-a-spreadsheet',
    cat: 'howto',
    title: 'How to Create Bulk QR Codes From a Spreadsheet (CSV)',
    description: 'Generate hundreds of QR codes at once from Excel or Google Sheets: prepare a CSV, map columns, validate, and download a ZIP named from your data.',
    h1: 'How to create bulk QR codes from a spreadsheet',
    name: 'Bulk QR codes from CSV',
    answer: 'Put one row per QR code in Excel or Google Sheets, with a column for the content (URL, text or ID) and one for the file name, save it as CSV, then upload it to a bulk QR code generator. Map the columns, check the validation preview, and download a ZIP of all the codes. Choose dynamic codes if you want to edit or track them later.',
    sections: [
      {
        h: 'Prepare the spreadsheet',
        list: [
          'One row per code, a header row at the top.',
          'A content column: full URLs with https://, or the text or ID.',
          'A name column used for the file names (for example TOOL-0001).',
          'No empty rows in the middle; no merged cells.',
          'Save as CSV UTF-8 (Excel: File › Save As; Google Sheets: File › Download › CSV).',
        ],
        p: ['The QR ALTRIX bulk page offers a downloadable template with the right columns.'],
      },
      {
        h: 'Generate the codes',
        steps: [
          'Open the [bulk QR code generator](/tools/bulk-qr-code-generator).',
          'Upload the CSV and match each column to a field.',
          'Review the per-row validation; fix any rows flagged as invalid.',
          'Choose the design once: colours, logo, frame. It applies to every code.',
          'Start the batch; large batches run in the background.',
          'Download the ZIP. Each file is named from your name column.',
        ],
      },
      {
        h: 'Uses',
        list: [
          'Asset and stock labels: [QR inventory guide](/guides/qr-code-inventory-management).',
          'Event tickets and badges: [event check-in guide](/guides/qr-code-event-check-in).',
          'Personalised direct mail and loyalty cards.',
          'Table codes for each table in a restaurant.',
          'Product codes for each SKU.',
        ],
      },
    ],
    faqs: [
      { q: 'How many codes can I make at once?', a: 'Thousands per batch. The current limit is shown on the bulk page when you upload your file.' },
      { q: 'Can bulk codes be dynamic?', a: 'Yes. With a free account each row becomes a dynamic code you can edit and track.' },
    ],
  },
  {
    slug: 'qr-code-security-for-businesses',
    cat: 'business',
    title: 'QR Code Security for Businesses: Protect Your Customers',
    description: 'How businesses keep QR codes safe: tamper-resistant signage, trusted domains, dynamic code controls, regular checks and what to do about fake codes.',
    h1: 'QR code security for businesses',
    name: 'QR code security',
    answer: 'Protect customers by making your codes hard to fake and easy to trust: print them inside branded frames, use a short-link domain people recognise (ideally your own), place public codes where stickers are hard to add, check signage regularly, and keep payment and login flows on your official website or app. Dynamic codes let you disable a code instantly if it is misused.',
    sections: [
      {
        h: 'Threats to plan for',
        list: [
          'Sticker swaps: a fake code stuck over yours on parking machines, chargers, menus or posters.',
          'Look-alike emails or letters using your brand with a malicious code.',
          'Old codes on printed material that point to an expired third-party link someone else can take over.',
        ],
      },
      {
        h: 'Practical safeguards',
        list: [
          'Brand the code: logo and frame with your name make a plain sticker stand out.',
          'Use your own domain for dynamic links (QR ALTRIX supports custom domains), so the preview shows your name.',
          'Print the code into the material (not on a sticker) where possible, behind glass or acrylic in public.',
          'Inspect public codes on a schedule; staff can scan them on opening.',
          'Never ask customers to log in or pay through a code in an email.',
          'Tell customers what your codes look like and where they lead.',
        ],
      },
      {
        h: 'Use dynamic code controls',
        p: [
          'A dynamic code can be paused at once if you suspect misuse, protected with a password for internal documents, scheduled to work only during an event, or limited to a number of scans. Scan analytics can reveal anomalies, such as a sudden drop when a code has been covered.',
        ],
      },
      {
        h: 'If someone copies your codes',
        p: [
          'Remove the fake codes, warn customers on your website and social channels, and report phishing pages (UK: report@phishing.gov.uk; US: reportfraud.ftc.gov). If the abuse involves a QR ALTRIX code, use the [abuse report form](/report-abuse). For customers, share [how to tell if a QR code is safe](/answers/is-it-safe-to-scan-a-qr-code).',
        ],
      },
    ],
    faqs: [
      { q: 'Are dynamic QR codes less secure than static ones?', a: 'Not inherently. They depend on the short-link service, but can be paused or redirected if something goes wrong, which a static code cannot.' },
      { q: 'Should payment QR codes be static?', a: 'Payment codes generated by your bank or payment provider follow their own security rules; display them where they cannot be covered.' },
    ],
  },
];
