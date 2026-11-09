import type { SeoDoc } from '@/content/seo/types';

/** Long English guides, part 1: creating, designing and measuring QR codes. */
export const GUIDE_ARTICLES: SeoDoc[] = [
  {
    slug: 'how-to-make-a-qr-code-with-a-logo',
    cat: 'howto',
    type: 'URL',
    title: 'How to Make a QR Code With a Logo (Free, Still Scans)',
    description: 'Add your logo to a QR code without breaking it: logo size, error correction, colours, file formats and testing. Free step-by-step guide.',
    h1: 'How to make a QR code with a logo that still scans',
    name: 'QR code with a logo',
    answer: 'Create the code, upload your logo to the centre, set error correction to H (30%), keep the logo to about a fifth of the code’s area and away from the three corner squares, then test on an iPhone and an Android phone. Download SVG or PDF for print. QR ALTRIX does this free and warns you if the logo is too large.',
    sections: [
      {
        h: 'Why a logo does not break a QR code',
        p: [
          'QR codes are built to survive damage. Every code contains extra error-correction data (Reed-Solomon codes) that lets the scanner rebuild missing modules. A logo in the middle looks like damage to the scanner, and as long as it covers less than the code can repair, the code reads normally.',
          'There are four levels of repair: L (about 7%), M (15%), Q (25%) and H (30%). A logo needs the highest level, H, and still should not use all of it, because real prints also get scratched, bent and photographed in bad light. More detail in [QR code error correction levels](/answers/qr-code-error-correction-levels).',
        ],
      },
      {
        h: 'Step by step',
        steps: [
          'Open the [free QR code generator](/#generator) and choose what the code should do: a website, [Wi-Fi](/qr-code-generator/wifi), [menu](/qr-code-generator/restaurant-menu), [contact card](/qr-code-generator/digital-business-card) and so on.',
          'Enter the content. If it may change later or you want to count scans, choose a dynamic type.',
          'Open the Logo section and upload a square PNG or SVG, or choose one of the built-in icons.',
          'Keep the logo size at the default or smaller. The scan-safety score drops if the logo covers too much.',
          'Optionally add a light background behind the logo so its edge is clean.',
          'Pick your colours: a dark code on a light background, in your brand colour if it is dark enough.',
          'Download SVG or PDF for print, PNG for screens.',
          'Scan the downloaded file with at least two phones from the distance people will use.',
        ],
      },
      {
        h: 'Logo rules that keep codes scannable',
        list: [
          'Size: no more than about 20–25% of the code area, which is roughly a third of its width.',
          'Position: centred. Never over the three big corner squares, the edges or the quiet zone.',
          'Shape: simple, bold marks work better than detailed logos with thin lines or small text.',
          'Contrast: a logo with its own white or light backing is clearer for the scanner.',
          'Content: keep the link short. A dynamic code makes a simpler pattern, leaving more room for the logo.',
        ],
      },
      {
        h: 'Choosing the right logo file',
        p: [
          'Use a square version of your logo, ideally an icon or monogram rather than a long wordmark: wide logos have to shrink to fit and become unreadable. A PNG with a transparent background or an SVG gives the cleanest result. If your logo is dark, place it on a white rounded square; if it is light, give it a dark backing that matches the code.',
        ],
      },
      {
        h: 'Common mistakes',
        list: [
          'Stretching the logo over most of the code because “it scanned on my phone”. Other phones are less forgiving.',
          'Using error correction L or M with a logo.',
          'Exporting a small PNG and enlarging it for print, which blurs the modules.',
          'Placing the finished code on a busy photo with no margin.',
        ],
        p: ['If a code with a logo will not scan, see [why is my QR code not scanning](/answers/why-is-my-qr-code-not-scanning).'],
      },
      {
        h: 'Beyond the logo: frames and calls to action',
        p: [
          'A logo tells people who the code belongs to; a frame tells them why to scan. QR ALTRIX has 32 frame presets with text such as “Scan for menu” or “Scan to save contact”. Codes with a clear reason to scan get noticeably more scans than bare codes. See [QR code call to action examples](/guides/qr-code-call-to-action-examples).',
        ],
      },
    ],
    faqs: [
      { q: 'Is adding a logo free?', a: 'Yes. Logos, colours, shapes and frames are free on QR ALTRIX for static and dynamic codes.' },
      { q: 'Can I put a photo in a QR code?', a: 'A small, simple photo can work like a logo, but faces and detailed photos rarely look good at that size.' },
      { q: 'Does a logo affect scanning speed?', a: 'Slightly, because the scanner must correct more errors. With the rules above, people will not notice.' },
      { q: 'Can I add a logo to a Wi-Fi QR code?', a: 'Yes. Every QR type supports logos.' },
    ],
  },
  {
    slug: 'qr-code-tracking-and-analytics',
    cat: 'business',
    type: 'WEBSITE',
    title: 'QR Code Tracking: How to Track Scans and Measure Results',
    description: 'Track QR code scans by time, country, city and device, add UTM tags for Google Analytics, and measure print campaigns. Free, privacy-first guide.',
    h1: 'QR code tracking: how to measure every scan',
    name: 'QR code tracking and analytics',
    answer: 'To track a QR code, make it dynamic: the code then points to a short link that records each scan (time, approximate location, device and browser) before forwarding the visitor. Add UTM parameters to the destination so Google Analytics separates QR traffic, use a different code for each placement, and compare scans with sales or sign-ups.',
    sections: [
      {
        h: 'How QR code tracking works',
        p: [
          'A static QR code sends people straight to your page, so no one in between sees the scan. A dynamic QR code sends them through a short link first. In the moment before redirecting, the short-link server notes the scan: the time, the country and city looked up from the network address, the device type, operating system, browser and language. The redirect takes a fraction of a second.',
          'On QR ALTRIX that data appears live on the code’s dashboard, and can be exported to CSV or XLSX. Network addresses are stored only as a salted hash, so you see unique scans without holding anyone’s IP address.',
        ],
      },
      {
        h: 'Set up a trackable QR code',
        steps: [
          'Create a [dynamic URL QR code](/qr-code-generator/dynamic-url) (or any dynamic type: menu, PDF, coupon, landing page).',
          'Give it a clear name, for example “Spring flyer – Leeds”.',
          'Add UTM parameters: utm_source=qr, utm_medium=flyer, utm_campaign=spring-2026.',
          'Download and print. Each placement or version should get its own code.',
          'Watch scans on the dashboard; in Google Analytics filter by the UTM values.',
        ],
      },
      {
        h: 'What to measure',
        list: [
          'Scans per placement: which poster, table or packaging line works.',
          'Unique vs total scans: one enthusiastic person or many people.',
          'Time of day and day of week: when people engage.',
          'Location: which cities or countries a print run reaches.',
          'Device mix: whether your page must work well on iPhone, Android or both (it should).',
          'Conversions: sign-ups, orders or bookings from the UTM campaign in your analytics.',
        ],
      },
      {
        h: 'Run a fair A/B test with QR codes',
        p: [
          'Print two versions of the same flyer that differ in one thing, such as the call to action or the code’s position, each with its own dynamic code. Distribute them the same way and compare scans after a fixed period. With dynamic codes you can also keep the printed code and test two landing pages one after another.',
        ],
      },
      {
        h: 'Privacy and the law',
        p: [
          'Scan counts by country, device and time are anonymous and aggregated. If the destination page collects names or emails, you are collecting personal data and must follow privacy law, such as UK GDPR or the EU GDPR: say what you collect and why. Tracking cannot identify the person who scanned, see their exact GPS position or their phone number.',
        ],
      },
      {
        h: 'Common tracking mistakes',
        list: [
          'Using one code everywhere, so you cannot tell placements apart.',
          'Forgetting UTMs, so QR visits show up as “direct” traffic.',
          'Counting only scans, not what people did afterwards.',
          'Printing a static code and expecting to see scans.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I track a static QR code?', a: 'Not the scans. If it links to your own site, your web analytics sees the visits, best with UTM tags.' },
      { q: 'Is QR code tracking free?', a: 'Yes on QR ALTRIX, with live analytics on unlimited dynamic codes.' },
      { q: 'Can I see who scanned my QR code?', a: 'No. You see anonymous details. To learn who, ask on the page, for example with a [feedback form](/qr-code-generator/feedback-form).' },
      { q: 'How accurate is the location?', a: 'Country is very reliable; city is approximate, because it is looked up from the mobile network.' },
    ],
  },
  {
    slug: 'qr-code-call-to-action-examples',
    cat: 'business',
    title: 'QR Code Call to Action: 40 Examples That Get Scans',
    description: 'What to write next to a QR code: 40 call-to-action examples for menus, reviews, packaging, posters and business cards, plus placement tips.',
    h1: 'QR code call to action: what to write next to your QR code',
    name: 'Call to action examples',
    answer: 'A good QR call to action tells people what they get and that it is quick: “Scan for today’s menu”, “Scan to save my contact”, “Scan for 10% off”. Put it right next to or around the code, in short, active words, and make the promise match what opens. A code with a clear reason to scan gets far more scans than a bare one.',
    sections: [
      {
        h: 'The formula',
        p: ['Verb + benefit (+ speed or reward). “Scan” is fine as the verb; the benefit is what does the work. Keep it under six words where you can.'],
      },
      {
        h: 'Restaurants and cafés',
        list: ['Scan for menu', 'Scan to order and pay', 'Scan for today’s specials', 'Free Wi-Fi: scan to join', 'Tell us how we did', 'Scan to see allergens'],
      },
      {
        h: 'Reviews and feedback',
        list: ['How did we do? Scan to review us', 'Rate your visit in 30 seconds', 'Scan to leave a Google review', 'Help us improve: 3 quick questions'],
        p: ['More in [how to get more Google reviews with QR codes](/guides/how-to-get-more-google-reviews-with-qr-codes).'],
      },
      {
        h: 'Retail and packaging',
        list: ['Scan for setup video', 'Scan for the manual', 'Where was this made? Scan to see', 'Scan to register your warranty', 'Scan for recipes', 'Reorder in one scan'],
      },
      {
        h: 'Marketing and posters',
        list: ['Scan for 10% off today', 'Scan to enter the draw', 'Scan to book your spot', 'See the full line-up', 'Get tickets: scan here', 'Watch the trailer'],
      },
      {
        h: 'People and networking',
        list: ['Scan to save my contact', 'Connect on LinkedIn', 'See my portfolio', 'Follow us on Instagram', 'Message us on WhatsApp'],
      },
      {
        h: 'Events and personal',
        list: ['Scan to RSVP', 'Share your photos with us', 'Directions to the venue', 'Add to calendar', 'Check in here'],
      },
      {
        h: 'Placement rules',
        list: [
          'Put the words inside a frame around the code or directly beside it.',
          'Keep a white margin between text and code: [quiet zone explained](/answers/qr-code-quiet-zone).',
          'Place codes at eye or hand height where people pause: tables, counters, doors, queues.',
          'Do not put codes where there is no signal, or on moving vehicles people cannot reach.',
          'Make sure the page that opens delivers the promise in the first screen.',
        ],
        p: ['QR ALTRIX includes 32 frames with editable call-to-action text. [Design your code](/#generator).'],
      },
    ],
    faqs: [
      { q: 'Should I write “Scan me”?', a: 'It is better than nothing, but a benefit (“Scan for the menu”) gets more scans.' },
      { q: 'Should I add a short link too?', a: 'Yes, for people who cannot scan: print a short, readable address under the code.' },
    ],
  },
  {
    slug: 'how-to-get-more-google-reviews-with-qr-codes',
    cat: 'business',
    type: 'WEBSITE',
    title: 'How to Get More Google Reviews With a QR Code',
    description: 'Get your Google review link, turn it into a QR code, and place it where customers will scan it: counters, receipts, tables. Rules and examples.',
    h1: 'How to get more Google reviews with a QR code',
    name: 'Google reviews with QR codes',
    answer: 'Copy your review link from your Google Business Profile (“Ask for reviews” or “Get more reviews”), turn it into a dynamic QR code and print it where customers pause and wait: on the counter, the receipt, the table or the delivery bag. Scanning opens the review box directly, which removes the effort that stops most people from leaving a review.',
    sections: [
      {
        h: 'Step 1: get your Google review link',
        steps: [
          'Sign in to the Google account that manages your business and search for your business name on Google, or open Google Maps.',
          'In your Business Profile, choose Ask for reviews (or Get more reviews).',
          'Copy the short link Google gives you. It opens the review form for your business.',
        ],
      },
      {
        h: 'Step 2: make the QR code',
        steps: [
          'Paste the link into a [dynamic URL QR code](/qr-code-generator/dynamic-url). Dynamic means you can point the same print to a different page later and count scans.',
          'Add a frame with “How did we do? Review us on Google”.',
          'Download PDF or SVG for print.',
        ],
        p: ['Prefer a short survey first? Use a [feedback form QR code](/qr-code-generator/feedback-form) and link to Google from the thank-you message.'],
      },
      {
        h: 'Step 3: put it where customers pause',
        list: [
          'Counter or till: a small acrylic stand at eye level.',
          'Receipts and invoices: printed at the bottom.',
          'Tables: on the menu card or table tent.',
          'Delivery bags and packaging inserts.',
          'Thank-you emails and messages (as a link, plus the code).',
          'Staff badges, for service businesses where people talk to one person.',
        ],
      },
      {
        h: 'What Google allows',
        p: [
          'Google’s policies allow you to ask all customers for reviews. They do not allow paying or rewarding people for reviews, asking only happy customers to review while sending unhappy ones elsewhere (review gating), or staff reviewing their own business. Keep the request open to everyone and do not offer a discount in exchange for a review.',
        ],
      },
      {
        h: 'Measure it',
        p: [
          'Because the code is dynamic, you can see how many people scanned per week and compare that with the reviews that appear. Use separate codes for the counter and receipts to see which placement works best. More in [QR code tracking](/guides/qr-code-tracking-and-analytics).',
        ],
      },
    ],
    faqs: [
      { q: 'Is a Google review QR code free?', a: 'Yes, the review link is free from Google and the QR code is free here.' },
      { q: 'Can I offer a discount for a Google review?', a: 'No. Google’s policies forbid incentives for reviews.' },
      { q: 'What size should a review QR code be?', a: 'At least 3 cm on a counter card; larger on a wall sign. See [scanning distance](/answers/how-far-away-can-a-qr-code-be-scanned).' },
    ],
  },
  {
    slug: 'qr-code-inventory-management',
    cat: 'ops',
    title: 'QR Code Inventory Management: A Simple, Free System',
    description: 'Track stock, tools and equipment with QR codes: label every item from a spreadsheet, scan with any phone, and keep records in Google Sheets or your system.',
    h1: 'How to use QR codes for inventory management',
    name: 'QR codes for inventory',
    answer: 'Give every item or bin a unique ID, list the IDs in a spreadsheet, generate one QR code per row with a bulk QR code generator and print them as labels. Staff scan a label with any phone to open the item’s record (a Google Sheet row, form or inventory page) and log a check-out, move or count. QR codes beat barcodes here because any phone is the scanner.',
    sections: [
      {
        h: 'What you need',
        list: [
          'A spreadsheet with one row per item: ID, name, location, and a link to its record.',
          'A way to record scans: a Google Form, your inventory software, or a page per item.',
          'Durable labels: polyester or laminated labels for tools and outdoor items.',
          'Phones: the built-in camera is enough.',
        ],
      },
      {
        h: 'Set it up in an afternoon',
        steps: [
          'Create IDs that never change (for example TOOL-0001). Put them in column A.',
          'Decide what a scan opens. Easiest: a Google Form with the item ID pre-filled (use the form’s “Get pre-filled link”), so staff only choose “checked out / returned / counted”.',
          'Build the link for each row in the spreadsheet, then save the sheet as CSV.',
          'Upload the CSV to the [bulk QR code generator](/tools/bulk-qr-code-generator) and download the ZIP of codes, each named with its ID.',
          'Print labels with the ID in human-readable text under each code, at least 2 cm wide.',
          'Stick labels on a flat, clean surface away from edges and heat.',
          'Test a few scans, then roll out.',
        ],
      },
      {
        h: 'Static or dynamic codes?',
        p: [
          'For a label that only carries an ID, a static code is enough and works offline with a scanner app that logs codes. If the code opens a web record that might move to new software one day, make the codes dynamic: you can repoint all of them without relabelling, and scan counts show which items are actually used.',
        ],
      },
      {
        h: 'QR code vs barcode for inventory',
        p: [
          'Barcodes need a dedicated scanner and hold only a number. QR codes hold a full link, read from any angle, survive some damage thanks to error correction and are read by every smartphone. If you already use barcode scanners, most modern 2D scanners read QR codes too. See [QR code vs barcode](/answers/qr-code-vs-barcode).',
        ],
      },
      {
        h: 'Tips from real stockrooms',
        list: [
          'Label shelves and bins as well as items; scanning a bin is quicker for small parts.',
          'Use a high error-correction level (Q or H) for labels that get dirty.',
          'Keep a spare sheet of labels for replacements.',
          'Audit monthly: scan every label in a location and compare with the sheet.',
        ],
      },
    ],
    faqs: [
      { q: 'Is a QR inventory system free?', a: 'With Google Sheets and Forms plus free QR codes, the only cost is labels.' },
      { q: 'Can I scan QR codes straight into Excel?', a: 'A USB or Bluetooth scanner that reads QR codes types the content into the selected cell. See [QR codes in Excel](/answers/how-to-make-a-qr-code-in-excel).' },
      { q: 'What label size should I use?', a: 'At least 2 × 2 cm for the code, plus room for the ID text.' },
    ],
  },
  {
    slug: 'qr-code-attendance-system',
    cat: 'ops',
    type: 'FEEDBACK',
    title: 'QR Code Attendance System With Google Forms (Free)',
    description: 'Take attendance with a QR code: a Google Form or check-in page, one code at the door, responses in a spreadsheet. For classes, staff and events.',
    h1: 'How to build a QR code attendance system for free',
    name: 'QR code attendance',
    answer: 'Create a short Google Form (name, ID, session), copy its link, turn it into a QR code and display it at the entrance or on the screen. People scan, submit, and every check-in lands in a Google Sheet with a timestamp. For more control, use a dynamic code so you can switch the form each day and see scan counts.',
    sections: [
      {
        h: 'Set up attendance with Google Forms',
        steps: [
          'In Google Forms, add fields: full name (or student/employee ID), and a dropdown for class or shift.',
          'In Settings, turn on “Collect email addresses” or require sign-in if you need verified identities.',
          'Click Send › link icon › copy the link.',
          'Make a [dynamic QR code](/qr-code-generator/dynamic-url) with the link and a frame saying “Scan to check in”.',
          'Print it at the door or show it on the first slide.',
          'In Responses, link the form to a Google Sheet. Each submission has a timestamp.',
        ],
      },
      {
        h: 'Stop people checking in from home',
        list: [
          'Show the code only during the session and switch its destination to a “closed” page afterwards (possible with a dynamic code).',
          'Add a question only people in the room can answer, such as a word on the board.',
          'Require sign-in with school or company accounts.',
          'Use a schedule on the code so it only works in the session time window.',
        ],
      },
      {
        h: 'Classrooms, staff and events',
        p: [
          'Teachers can keep one code per class on the door and change the form each term. Employers can use a code per site for shift sign-in, with timestamps in the sheet. Events can scan personal tickets instead: give each guest their own code with the [bulk generator](/tools/bulk-qr-code-generator). See [event check-in with QR codes](/guides/qr-code-event-check-in).',
        ],
      },
    ],
    faqs: [
      { q: 'Is a QR attendance system free?', a: 'Yes: Google Forms, Sheets and the QR code are all free.' },
      { q: 'Can I record attendance offline?', a: 'Not with a form. For no-signal sites, use personal codes scanned by a staff phone with a scanner app that stores scans.' },
      { q: 'Is it accurate for payroll?', a: 'For payroll use a dedicated time system; a form is fine for records and classes.' },
    ],
  },
  {
    slug: 'how-to-create-a-qr-code-menu',
    cat: 'business',
    type: 'MENU',
    title: 'How to Create a QR Code Menu for Your Restaurant',
    description: 'Make a QR code menu customers can open without an app: mobile menu or PDF, table cards, sizes, Wi-Fi and reviews. Free guide for restaurants and cafés.',
    h1: 'How to create a QR code menu for a restaurant',
    name: 'Create a QR code menu',
    answer: 'Build the menu as a mobile menu page (sections, dishes, prices, photos and allergens) or upload your existing PDF, then make it a dynamic QR code so you can change dishes and prices without reprinting. Print the code on table cards at least 3 cm wide with “Scan for menu”, and keep a few paper menus for guests who prefer them.',
    sections: [
      {
        h: 'Mobile menu or PDF?',
        p: [
          'A [mobile menu page](/qr-code-generator/restaurant-menu) is built for phones: big text, sections, prices and photos, no zooming. It loads fast on weak signal. A [PDF menu](/qr-code-generator/pdf) is quickest if you already have a designed menu, but guests must pinch and zoom. If your printed menu is a two-page A4, a menu page is the better experience.',
        ],
      },
      {
        h: 'Step by step',
        steps: [
          'Open the [restaurant menu QR code generator](/qr-code-generator/restaurant-menu).',
          'Add sections (starters, mains, drinks), dishes, prices, descriptions and allergens.',
          'Add your logo, colours and opening hours.',
          'Create the dynamic code and choose a frame: “Scan for menu”.',
          'Download PDF and print table cards, stickers or tents.',
          'Scan every printed code once before service.',
        ],
      },
      {
        h: 'Where to put menu QR codes',
        list: [
          'Table tents or stickers on each table (3–4 cm code).',
          'Window and door, so people can browse before entering (10 cm+).',
          'Takeaway bags and flyers, with the menu and a phone number.',
          'Google Business Profile: add the menu link too.',
        ],
      },
      {
        h: 'Extras that work well with a menu code',
        list: [
          'A [Wi-Fi QR code](/qr-code-for/wifi-password) on the same card so guests join without asking.',
          'A [Google review code](/guides/how-to-get-more-google-reviews-with-qr-codes) on the bill.',
          'A [feedback form](/qr-code-generator/feedback-form) for private comments.',
          'Separate codes per area (terrace, bar) to see where guests scan.',
        ],
      },
      {
        h: 'Keep it legal and friendly',
        p: [
          'Allergen information must still be available to guests (in the UK, for example, food businesses must provide information on the 14 major allergens). Put it on the menu page and train staff to answer questions. Some guests do not want to use a phone: keep printed menus available.',
        ],
      },
    ],
    faqs: [
      { q: 'Is a QR code menu free?', a: 'Yes. The menu page, the dynamic code and updates are free on QR ALTRIX.' },
      { q: 'Can I change prices after printing?', a: 'Yes. Edit the menu and every printed code shows the new version.' },
      { q: 'Do customers need an app?', a: 'No. The phone camera opens the menu in the browser.' },
    ],
  },
  {
    slug: 'qr-code-event-check-in',
    cat: 'ops',
    type: 'EVENT_PAGE',
    title: 'QR Code Event Check-In: Tickets, Badges and Registration',
    description: 'Run fast event check-in with QR codes: one code per guest from a spreadsheet, registration pages, badge printing and door scanning. Step-by-step.',
    h1: 'QR code event check-in: a step-by-step guide',
    name: 'Event check-in with QR codes',
    answer: 'Give each guest a unique code: export your guest list to CSV, generate one QR code per guest with a bulk generator, and send or print it on tickets and badges. At the door, staff scan with a phone to confirm the guest. For open events, use one QR code at the entrance that opens a registration or check-in form instead.',
    sections: [
      {
        h: 'Two ways to check people in',
        list: [
          'Personal codes: each guest has a unique code. Fast, prevents sharing, good for paid or limited events.',
          'One shared code: everyone scans the same code and fills a short form. Good for free events, workshops and classes.',
        ],
      },
      {
        h: 'Personal codes from your guest list',
        steps: [
          'Export the guest list with a unique ticket ID per person.',
          'Make the content for each code: the ticket ID, or a link to that guest’s record.',
          'Upload the CSV to the [bulk QR code generator](/tools/bulk-qr-code-generator); download the ZIP with one code per guest, named by ID.',
          'Attach codes to confirmation emails or print them on badges with mail merge.',
          'At the door, scan with a phone and mark the ID as arrived in your list.',
        ],
      },
      {
        h: 'An event page people scan before they arrive',
        p: [
          'Posters and invitations can carry an [event page QR code](/qr-code-generator/event-page) with the date, time, venue map, agenda and a button to add it to the calendar. Because it is dynamic, you can update the schedule up to the last minute. Add a [calendar QR code](/qr-code-generator/calendar-event) for one-tap “add to calendar”.',
        ],
      },
      {
        h: 'Door tips',
        list: [
          'Have one staff phone per 100–150 guests at peak arrival time.',
          'Check the venue signal in advance; bring a hotspot.',
          'Print badges at least 2.5 cm per code and keep them flat (no folding over the code).',
          'Keep a printed list as backup.',
        ],
      },
    ],
    faqs: [
      { q: 'Can people share a personal QR code?', a: 'They can show the same image, but you will see the ID was already checked in.' },
      { q: 'Do I need a special scanner?', a: 'No, a phone camera is enough; dedicated 2D scanners are faster for very large events.' },
    ],
  },
];
