import type { SeoDoc } from '@/content/seo/types';

/** "QR code for …" pages, part 2: business, industries, events, print and operations. */
export const FOR_PAGES_2: SeoDoc[] = [
  // ---------------------------------------------------------------- business
  {
    slug: 'restaurant-menu',
    cat: 'business',
    type: 'MENU',
    title: 'QR Code Menu Generator – Free Digital Menu for Restaurants',
    description: 'Create a free QR code menu: a mobile menu with sections, prices, photos and allergens that you can update anytime. No app for customers.',
    h1: 'QR code menu for restaurants and cafés',
    name: 'Restaurant menu',
    answer: 'Add your menu sections, dishes, prices, photos and allergen notes in the generator below, then print the dynamic QR code on table cards. Guests scan with their camera and browse a mobile menu, no app needed. Change dishes or prices whenever you like and every printed code shows the update instantly.',
    sections: [
      {
        h: 'Set up in minutes',
        steps: ['Add sections: starters, mains, desserts, drinks.', 'Add dishes with prices, descriptions and allergens.', 'Add your logo, colours and opening hours.', 'Create the code with a “Scan for menu” frame.', 'Print table cards (3–4 cm code) and a window sign.'],
        p: ['Full walkthrough: [how to create a QR code menu](/guides/how-to-create-a-qr-code-menu).'],
      },
      {
        h: 'Add these to the table card',
        list: ['[Wi-Fi QR code](/qr-code-for/wifi-password).', '[Google review code](/qr-code-for/google-reviews).', '[Feedback form](/qr-code-for/customer-feedback).'],
      },
    ],
    faqs: [
      { q: 'Can I use my existing PDF menu?', a: 'Yes, with a [PDF QR code](/qr-code-for/pdf), though a mobile menu page is easier to read on phones.' },
      { q: 'Is it really free?', a: 'Yes, including updates and scan statistics.' },
    ],
  },
  {
    slug: 'business-cards',
    cat: 'business',
    type: 'VCARD_PLUS',
    title: 'Business Card QR Code – Digital Business Card, Free',
    description: 'Put a QR code on your business card that saves your contact and opens a digital card with photo, links and socials. Free, editable after printing.',
    h1: 'QR code for business cards',
    name: 'Business cards',
    answer: 'Create a digital business card below with your photo, name, title, phone, email, website and social links, then print its QR code on the back of your business card. Scanning opens your card on the phone with a “Save contact” button. Because it is dynamic, a new job title or phone number never means reprinting your cards.',
    sections: [
      {
        h: 'Printing tips',
        list: ['2–2.5 cm square, on the back or a clear corner.', 'Dark ink on a light area; avoid foil behind the code.', 'A line such as “Scan to save my contact”.', 'Supply the printer with the SVG or PDF file.'],
      },
      {
        h: 'Digital card or vCard?',
        p: ['A [vCard code](/qr-code-for/contact-card) stores details in the code and works offline, but cannot change. A digital card can be edited, shows your photo and links, and counts scans. More advice: [should you put a QR code on a business card](/answers/can-you-put-a-qr-code-on-a-business-card).'],
      },
    ],
    faqs: [
      { q: 'Can I add it to Apple Wallet?', a: 'Not as a wallet pass from here; save the QR image to your phone photos to show it when networking.' },
    ],
  },
  {
    slug: 'customer-feedback',
    cat: 'business',
    type: 'FEEDBACK',
    title: 'Feedback QR Code – Customer Surveys by Scan, Free',
    description: 'Collect customer feedback with a QR code: star ratings and questions on a mobile form, results in your dashboard. For shops, hotels, clinics and events.',
    h1: 'QR code for customer feedback',
    name: 'Customer feedback',
    answer: 'Build a short feedback form below (star rating, a few questions, an optional comment) and print its QR code where customers finish their visit. They scan, answer in under a minute, and responses appear in your dashboard. Keep it to three questions for the best response rate.',
    sections: [
      {
        h: 'Where to place it',
        list: ['Till, reception and exit doors.', 'Hotel rooms and check-out.', 'Clinic waiting rooms.', 'Delivery packaging and invoices.', 'Event exits and screens.'],
      },
      {
        h: 'Feedback and reviews',
        p: ['Private feedback helps you fix problems; public reviews help new customers find you. Use both: a feedback form here, and a [Google review code](/qr-code-for/google-reviews) open to every customer.'],
      },
    ],
    faqs: [
      { q: 'Can customers answer anonymously?', a: 'Yes, unless you add a name or email field.' },
    ],
  },
  {
    slug: 'coupons',
    cat: 'business',
    type: 'COUPON',
    title: 'Coupon QR Code – Discounts and Offers by Scan',
    description: 'Create a QR code coupon with an offer, code, expiry date and terms. Limit scans, schedule campaigns and track redemptions. Free coupon QR generator.',
    h1: 'QR code coupons and discounts',
    name: 'Coupons and discounts',
    answer: 'Enter the offer, a discount code, an expiry date and the terms below, design the coupon page and print the QR code on flyers, receipts, packaging or posters. Scanning shows the coupon on the phone, ready to show at the till or use online. You can schedule it, limit the number of scans and see how many people opened it.',
    sections: [
      {
        h: 'Ideas',
        list: ['“10% off your next visit” on receipts.', 'Launch offers on flyers and posters.', 'Packaging inserts for repeat orders.', 'Event-only discounts on screens.'],
      },
      {
        h: 'Controls',
        list: ['Schedule start and end dates.', 'Limit total scans for a first-come offer.', 'Use separate codes per channel to compare.'],
        p: ['Distribute it with the [QR code marketing ideas](/guides/qr-code-marketing-ideas).'],
      },
    ],
    faqs: [
      { q: 'Can each customer get a unique code?', a: 'Yes: create codes in bulk from a list with the [bulk generator](/tools/bulk-qr-code-generator).' },
    ],
  },
  {
    slug: 'flyers',
    cat: 'print',
    type: 'WEBSITE',
    title: 'QR Code for Flyers – Size, Placement and Free Generator',
    description: 'Add a trackable QR code to your flyer: what it should open, size (3–5 cm), placement and call to action. Free dynamic code you can edit after printing.',
    h1: 'QR code for flyers',
    name: 'Flyers',
    answer: 'Use a dynamic QR code on flyers so you can fix the link after printing and count scans. Point it to a mobile page with the offer and one clear action (book, buy, sign up), print it 3–5 cm wide near the main message with a short call to action, and supply the printer with the SVG or PDF file.',
    sections: [
      {
        h: 'Checklist',
        list: ['3–4 cm on A6/A5, 4–5 cm on A4.', 'Bottom-right or beside the offer.', 'White margin, dark code.', 'Short call to action: “Scan to book”.', 'Short URL printed underneath.'],
        p: ['More: [QR codes on flyers and posters](/guides/qr-code-flyer-and-poster-design).'],
      },
    ],
    faqs: [
      { q: 'Can I see how many people scanned my flyer?', a: 'Yes, with a dynamic code. Use a different code per area to compare.' },
    ],
  },
  {
    slug: 'posters',
    cat: 'print',
    type: 'WEBSITE',
    title: 'QR Code for Posters – How Big and Where to Put It',
    description: 'Make a poster QR code that scans from a distance: 8–20 cm depending on size, at reachable height, with a clear reason to scan. Free, trackable.',
    h1: 'QR code for posters',
    name: 'Posters',
    answer: 'Size a poster QR code at about one tenth of the distance people will stand (8–10 cm on A3, 12–20 cm on A2–A1), place it 1–1.6 m from the floor if the poster is on a wall, and print a short call to action next to it. Use a dynamic code so the poster keeps working when dates or links change.',
    sections: [
      {
        h: 'What posters should link to',
        list: ['Event tickets or an [event page](/qr-code-for/events).', 'A trailer or video.', 'Booking or sign-up page.', 'Menu or offer for shop windows.'],
        p: ['Distance rules: [how far away a QR code can be scanned](/answers/how-far-away-can-a-qr-code-be-scanned).'],
      },
    ],
    faqs: [
      { q: 'Will a QR code on a glossy poster scan?', a: 'Glare can block it. Use matte paper or test at the angle people will stand.' },
    ],
  },
  {
    slug: 'product-packaging',
    cat: 'print',
    type: 'PRODUCT',
    title: 'QR Code for Product Packaging and Labels',
    description: 'Put a QR code on packaging for instructions, ingredients, origin, warranty and reorders. Free product page QR codes you can update for years.',
    h1: 'QR code for product packaging',
    name: 'Product packaging',
    answer: 'Create a product page below with images, specs, instructions and support links, then print its QR code on the packaging at 2 cm or more with a call to action such as “Scan for setup video”. It is dynamic, so the same box can point to updated instructions, a new language or a recall notice years after printing.',
    sections: [
      {
        h: 'What to include',
        list: ['How-to video and manual.', 'Ingredients, allergens or materials.', 'Origin and recycling information.', 'Warranty registration and support.', 'Reorder link.'],
        p: ['Full guide: [QR codes on product packaging](/guides/qr-codes-on-product-packaging), including GS1 Digital Link for retail.'],
      },
    ],
    faqs: [
      { q: 'Can one code work for every product?', a: 'Yes, but one per product line gives better pages and data.' },
    ],
  },
  {
    slug: 'small-business',
    cat: 'business',
    type: 'BUSINESS',
    title: 'QR Codes for Small Businesses – 12 Free Ways to Use Them',
    description: 'How small businesses use free QR codes: business page, reviews, menus, Wi-Fi, WhatsApp orders, payments, loyalty and feedback. Start in minutes.',
    h1: 'QR codes for small businesses',
    name: 'Small businesses',
    answer: 'Start with a business page QR code: one scan shows your opening hours, address, phone, website and social links. Then add codes for Google reviews at the till, WhatsApp orders, Wi-Fi, a menu or price list and customer feedback. All are free here, and dynamic codes let you change details without reprinting.',
    sections: [
      {
        h: '12 uses',
        list: [
          'Business page with hours and contact (above).',
          '[Google reviews](/qr-code-for/google-reviews) at the till.',
          '[WhatsApp orders](/qr-code-for/whatsapp).',
          '[Wi-Fi](/qr-code-for/wifi-password) for customers.',
          '[Menu](/qr-code-for/restaurant-menu) or [price list PDF](/qr-code-for/pdf).',
          '[Feedback form](/qr-code-for/customer-feedback).',
          '[Coupons](/qr-code-for/coupons) on receipts.',
          '[Instagram](/qr-code-for/instagram) or [all social profiles](/qr-code-for/social-media).',
          '[Business cards](/qr-code-for/business-cards).',
          '[Payments](/use-cases/payments).',
          '[Directions](/qr-code-for/google-maps).',
          '[Flyers](/qr-code-for/flyers) for local marketing.',
        ],
      },
    ],
    faqs: [
      { q: 'What does it cost?', a: 'Nothing: codes, edits and analytics are free.' },
    ],
  },

  // ---------------------------------------------------------------- industries
  {
    slug: 'real-estate',
    cat: 'industry',
    type: 'LANDING_PAGE',
    title: 'Real Estate QR Codes – For-Sale Signs, Flyers, Listings',
    description: 'QR codes for estate agents and realtors: listing pages on for-sale signs, virtual tours on flyers, open-house sign-in and reusable sign riders. Free.',
    h1: 'QR codes for real estate',
    name: 'Real estate',
    answer: 'Build a listing page below with photos, price, key facts and buttons to call or book a viewing, then print the dynamic QR code on the for-sale sign (15 cm+), window card and flyers. When the property sells, point the same sign rider at the next listing, and use scan analytics to see which properties draw interest.',
    sections: [
      {
        h: 'Uses',
        list: ['Sign riders and boards.', 'Window cards and brochures.', 'Open-house sign-in.', 'Virtual tours and floor plans.', 'Agent business cards.'],
        p: ['Full guide: [QR codes for real estate marketing](/guides/qr-codes-for-real-estate-marketing).'],
      },
    ],
    faqs: [
      { q: 'Can the same sign be reused?', a: 'Yes, edit the code’s destination for each new property.' },
    ],
  },
  {
    slug: 'hotels',
    cat: 'industry',
    type: 'BUSINESS',
    title: 'QR Codes for Hotels and Holiday Rentals',
    description: 'QR codes for hotels, B&Bs and holiday lets: Wi-Fi, guest information, room service menu, check-out, reviews and local guides. Free and editable.',
    h1: 'QR codes for hotels and holiday rentals',
    name: 'Hotels and rentals',
    answer: 'Hotels and holiday lets use QR codes to replace the guest folder: one code in each room opens a guest information page (Wi-Fi, breakfast times, house rules, check-out, local tips), and others link room service menus, spa booking and reviews. Make them dynamic so updates reach every room at once.',
    sections: [
      {
        h: 'Codes for each stage of the stay',
        list: ['Arrival: [Wi-Fi](/qr-code-for/wifi-password) and guest information page.', 'Dining: [menus](/qr-code-for/restaurant-menu) for restaurant and room service.', 'Stay: spa or tour booking, [WhatsApp](/qr-code-for/whatsapp) for the front desk.', 'Departure: [feedback](/qr-code-for/customer-feedback) and [review](/qr-code-for/google-reviews) codes.'],
      },
    ],
    faqs: [
      { q: 'Can I have different info per room?', a: 'Yes, one code per room or apartment, made in bulk.' },
    ],
  },
  {
    slug: 'schools',
    cat: 'industry',
    type: 'URL',
    title: 'QR Codes for Schools and Teachers – Classroom Ideas',
    description: 'QR code ideas for teachers and schools: homework links, attendance, quizzes, reading audio, parent forms, events and newsletters. Free and easy.',
    h1: 'QR codes for schools and teachers',
    name: 'Schools and teachers',
    answer: 'Teachers use QR codes to send students straight to a resource without typing links: worksheets, videos, quizzes and Google Forms. Schools use them on newsletters, letters home, event posters and for attendance. Make a code below, print it on the worksheet or show it on the board, and students scan with tablets or phones.',
    sections: [
      {
        h: 'Classroom ideas',
        list: ['Homework and reading links on worksheets.', 'Quizzes and exit tickets with [Google Forms](/qr-code-for/google-forms).', 'Audio for language practice: [audio QR code](/qr-code-for/audio).', 'Scavenger hunts with [text codes](/qr-code-generator/text) that work offline.', '[Attendance](/guides/qr-code-attendance-system) for classes and clubs.'],
      },
      {
        h: 'For the school office',
        list: ['Letters home linking to forms and payments.', 'Event posters and tickets.', 'Newsletters linking to the full PDF.', 'Visitor sign-in at reception.'],
      },
    ],
    faqs: [
      { q: 'Do students need an app?', a: 'No, tablet and phone cameras read QR codes; on laptops use the [online scanner](/tools/qr-code-scanner).' },
    ],
  },
  {
    slug: 'gyms',
    cat: 'industry',
    type: 'LINK_LIST',
    title: 'QR Codes for Gyms and Fitness Studios',
    description: 'QR codes for gyms: exercise videos on machines, class timetables, sign-ups, trainer bookings, Wi-Fi and feedback. Free, editable and trackable.',
    h1: 'QR codes for gyms and fitness studios',
    name: 'Gyms and fitness',
    answer: 'Gyms put QR codes on machines (scan for a how-to video), at reception (class timetable and booking), in changing rooms (Wi-Fi, feedback) and on flyers (free trial sign-up). A link page with timetable, booking, app and socials makes a good main code; use dynamic codes so videos and timetables can change.',
    sections: [
      {
        h: 'Ideas',
        list: ['Machine stickers: [video](/qr-code-for/video) of correct form.', 'Timetable and booking page.', 'Personal trainer [business cards](/qr-code-for/business-cards).', 'Membership offer [coupons](/qr-code-for/coupons).', 'Member [feedback](/qr-code-for/customer-feedback).'],
      },
    ],
    faqs: [
      { q: 'Will stickers survive cleaning?', a: 'Use laminated or vinyl stickers and error correction Q or H.' },
    ],
  },
  {
    slug: 'salons',
    cat: 'industry',
    type: 'BUSINESS',
    title: 'QR Codes for Hair and Beauty Salons',
    description: 'QR codes for salons and barbers: online booking, price list, portfolio gallery, Instagram, reviews and WhatsApp. Free, with your branding.',
    h1: 'QR codes for hair and beauty salons',
    name: 'Salons and barbers',
    answer: 'Salons and barbers use a business page QR code in the window and at the mirror station with booking, prices and Instagram, plus a review code at the till. A photo gallery code shows past work to new clients. Codes made here carry your colours and logo and can be updated when prices change.',
    sections: [
      {
        h: 'Ideas',
        list: ['Window: booking link, readable from outside.', 'Mirror stations: [Instagram](/qr-code-for/instagram).', 'Till: [Google reviews](/qr-code-for/google-reviews).', 'Portfolio: [photo gallery](/qr-code-for/photos).', 'Appointment cards: [WhatsApp](/qr-code-for/whatsapp) to rebook.'],
      },
    ],
    faqs: [
      { q: 'Can the code open my booking app?', a: 'Yes, use your booking page link from Fresha, Booksy, Square or similar.' },
    ],
  },
  {
    slug: 'healthcare',
    cat: 'industry',
    type: 'PDF',
    title: 'QR Codes for Clinics, Pharmacies and Healthcare',
    description: 'QR codes in healthcare: patient leaflets, appointment booking, check-in forms, feedback and equipment manuals. Privacy tips for clinics and pharmacies.',
    h1: 'QR codes for clinics and healthcare',
    name: 'Clinics and healthcare',
    answer: 'Clinics, dental practices and pharmacies use QR codes to link patient information leaflets, appointment booking, new-patient forms, feedback surveys and equipment manuals. Keep personal health information out of the code itself and send people to secure, official pages; use dynamic codes so leaflets can be updated when guidance changes.',
    sections: [
      {
        h: 'Uses',
        list: ['Patient leaflets as [PDF](/qr-code-for/pdf).', 'Booking or repeat-prescription pages.', 'New-patient forms (on a secure, compliant form service).', '[Feedback](/qr-code-for/customer-feedback) in waiting rooms.', 'Manuals on medical equipment.'],
      },
      {
        h: 'Privacy',
        p: ['Do not encode names, NHS or insurance numbers or medical details in a QR code: anyone who scans it can read the content. Collect personal data only on pages that meet your privacy obligations (UK GDPR, HIPAA in the US).'],
      },
    ],
    faqs: [
      { q: 'Can I put a QR code on prescriptions?', a: 'Only through your clinical system’s official features; do not add your own codes containing patient data.' },
    ],
  },
  {
    slug: 'churches',
    cat: 'industry',
    type: 'LINK_LIST',
    title: 'QR Codes for Churches, Mosques and Charities',
    description: 'QR codes for places of worship and charities: donations, event sign-ups, service times, livestreams, newsletters and volunteer forms. Free.',
    h1: 'QR codes for churches, mosques and charities',
    name: 'Churches and charities',
    answer: 'Places of worship and charities use one link page QR code with service times, livestream, donations, events and volunteer sign-up, printed on notice boards, newsletters and at the entrance. Individual codes link a donation page, a [Google Form](/qr-code-for/google-forms) for volunteers or the event calendar.',
    sections: [
      {
        h: 'Ideas',
        list: ['Donation page link at the entrance and on envelopes.', 'Livestream link for those at home.', 'Event and class sign-ups.', 'Newsletter PDF.', 'Prayer or service times page.'],
      },
      {
        h: 'Donations',
        p: ['Link to your official donation page (for example your payment provider or fundraising platform). Display donation codes where they cannot be covered with stickers, and check them regularly. See [QR code scams](/answers/qr-code-scams).'],
      },
    ],
    faqs: [
      { q: 'Is it free for charities?', a: 'Yes, as for everyone.' },
    ],
  },
  {
    slug: 'museums',
    cat: 'industry',
    type: 'AUDIO',
    title: 'QR Codes for Museums, Galleries and Tours',
    description: 'QR codes for museums and tours: audio guides, exhibit details, translations, videos and ticket booking. Free, editable, no app for visitors.',
    h1: 'QR codes for museums and tours',
    name: 'Museums and tours',
    answer: 'Place a QR code next to each exhibit or stop that opens an audio guide, video or longer description on the visitor’s phone. Visitors use their own headphones, need no app, and you can update or translate content anytime. Smart routing can show each visitor the language of their phone.',
    sections: [
      {
        h: 'Ideas',
        list: ['[Audio guide](/qr-code-for/audio) per exhibit.', 'Curator [videos](/qr-code-for/video).', 'Language by phone setting with a [smart link](/qr-code-generator/smart-link).', 'Walking-tour stops with [maps](/qr-code-for/google-maps).', 'Ticket booking on posters.'],
      },
    ],
    faqs: [
      { q: 'What if there is no signal in the building?', a: 'Provide free Wi-Fi with a [Wi-Fi QR code](/qr-code-for/wifi-password) at the entrance.' },
    ],
  },
  {
    slug: 'retail-stores',
    cat: 'industry',
    type: 'PRODUCT',
    title: 'QR Codes for Retail Stores – Shelves, Windows and Tills',
    description: 'QR codes in retail: product details on shelf labels, window shopping after hours, stock checks, loyalty sign-up, reviews and coupons. Free and trackable.',
    h1: 'QR codes for retail stores',
    name: 'Retail stores',
    answer: 'Shops use QR codes on shelf labels (reviews, sizes and colours), in the window (shop online after hours), at the till (loyalty sign-up, coupons, reviews) and on bags and receipts. Dynamic codes let you change the offer weekly and see which placement gets scanned.',
    sections: [
      {
        h: 'Ideas',
        list: ['Shelf talkers: [product page](/qr-code-for/product-packaging).', 'Window: online shop link.', 'Till: [coupons](/qr-code-for/coupons) and [reviews](/qr-code-for/google-reviews).', 'Fitting rooms: other sizes and colours.', 'Bags: [Instagram](/qr-code-for/instagram).'],
      },
    ],
    faqs: [
      { q: 'How do I know which codes work?', a: 'Use a different dynamic code per placement and compare scans.' },
    ],
  },

  // ---------------------------------------------------------------- events and personal
  {
    slug: 'weddings',
    cat: 'events',
    type: 'EVENT_PAGE',
    title: 'Wedding QR Code – RSVP, Directions, Photos, Free',
    description: 'Free wedding QR codes for invitations and the day: RSVP, wedding website, venue directions, schedule, photo sharing and seating chart.',
    h1: 'QR codes for weddings',
    name: 'Weddings',
    answer: 'Create a wedding event page below with the date, venue, schedule, map and RSVP link, and print its QR code on your invitations. On the day, use more codes for the seating chart, photo sharing and Wi-Fi. Make them dynamic: if the time or venue changes, update the page and every invitation stays correct.',
    sections: [
      {
        h: 'Ideas',
        list: ['Invitation: event page or RSVP.', 'Directions: [location code](/qr-code-for/google-maps).', 'Tables: shared photo album and menu.', 'Entrance: seating chart PDF.', 'Thank-you cards: [photo gallery](/qr-code-for/photos) or [video](/qr-code-for/video).'],
        p: ['More: [wedding QR code ideas](/guides/qr-code-wedding-ideas).'],
      },
    ],
    faqs: [
      { q: 'What colour can a wedding QR code be?', a: 'Any dark colour from your palette on a light card. [Colour rules](/answers/can-a-qr-code-be-any-color).' },
    ],
  },
  {
    slug: 'events',
    cat: 'events',
    type: 'EVENT_PAGE',
    title: 'Event QR Code – Tickets, Schedule and Check-In',
    description: 'Make an event QR code for posters and invitations: date, venue, agenda, map and tickets on one page, plus calendar codes and guest check-in.',
    h1: 'QR codes for events',
    name: 'Events',
    answer: 'Create an event page below with the date, time, venue, agenda, speakers and a ticket or registration button, and put its QR code on posters, invitations and social posts. At the venue, use codes for check-in, the live schedule, Wi-Fi and feedback. Dynamic codes let you update details up to the last minute.',
    sections: [
      {
        h: 'Before, during and after',
        list: ['Before: posters and invitations to the event page; [add to calendar](/qr-code-generator/calendar-event).', 'At the door: [check-in](/guides/qr-code-event-check-in).', 'During: schedule, [Wi-Fi](/qr-code-for/wifi-password), speaker slides.', 'After: [feedback](/qr-code-for/customer-feedback) and photo gallery.'],
      },
    ],
    faqs: [
      { q: 'Can each guest get a personal ticket code?', a: 'Yes, generate them from your guest list with the [bulk generator](/tools/bulk-qr-code-generator).' },
    ],
  },
  {
    slug: 'birthday-invitations',
    cat: 'events',
    type: 'EVENT_PAGE',
    title: 'QR Code for Birthday and Party Invitations',
    description: 'Add a QR code to birthday or party invitations: RSVP, location, time, gift list and photo sharing in one scan. Free, colourful and editable.',
    h1: 'QR code for birthday and party invitations',
    name: 'Birthday invitations',
    answer: 'Make an event page below with the party details, location map and an RSVP option, then print its QR code on the invitation or send it digitally. Guests scan to see everything and reply. Choose a fun, dark colour for the code and add “Scan to RSVP” so everyone knows what to do.',
    sections: [
      {
        h: 'Add-ons',
        list: ['[Directions](/qr-code-for/google-maps) to the venue.', '[Calendar event](/qr-code-generator/calendar-event).', 'Gift list link.', 'Shared photo album for after the party.'],
      },
    ],
    faqs: [
      { q: 'Can I make it on my phone?', a: 'Yes, the generator works on phones; download the image and add it to your invitation design.' },
    ],
  },
  {
    slug: 'memorials',
    cat: 'events',
    type: 'IMAGE_GALLERY',
    title: 'Memorial QR Code – Photos and Video on a Headstone',
    description: 'Create a memorial QR code that opens photos, a life story or a video tribute, for headstones, plaques, funeral programmes and memorial cards.',
    h1: 'QR codes for memorials and headstones',
    name: 'Memorials',
    answer: 'Create a gallery page below with photos and a short life story, or a video tribute, and place its QR code on funeral programmes, memorial cards or a plaque on a headstone. Visitors scan to see the memories. For stone, ask the mason for an engraved or ceramic QR plaque at least 5 cm wide and test it on site.',
    sections: [
      {
        h: 'Practical points',
        list: ['Check cemetery rules: some restrict plaques or attachments.', 'Use a weather-proof ceramic, metal or engraved plaque with high contrast.', 'Use error correction H for outdoor wear.', 'Keep the page under a family member’s account so it can be maintained.', 'Static codes cannot change; a dynamic code lets the family add photos over time.'],
        p: ['For video tributes, see [video QR codes](/qr-code-for/video).'],
      },
    ],
    faqs: [
      { q: 'How long will it last?', a: 'The page lasts as long as the account keeps the code; QR ALTRIX codes do not expire.' },
    ],
  },
  {
    slug: 'pet-tags',
    cat: 'events',
    type: 'VCARD',
    title: 'Pet ID Tag QR Code – Owner Contact in One Scan',
    description: 'Put a QR code on your pet’s collar tag so whoever finds them can call or message you. Offline contact codes, sizing and engraving tips.',
    h1: 'QR code for pet ID tags',
    name: 'Pet tags',
    answer: 'Make a contact QR code below with your name, phone number and a note such as “I am Bella, please call my owner”, and have it printed or engraved on a collar tag at least 2 cm wide. Anyone who finds your pet scans it and can call or save your number. A static contact code works without internet; a microchip is still the official ID.',
    sections: [
      {
        h: 'Tips',
        list: ['Keep it short: name, phone, a second phone. Fewer fields, simpler code.', 'Tag at least 2 × 2 cm; metal engraving needs high contrast.', 'Also engrave the phone number as text.', 'Update the microchip database when you move; it is the legal record in many countries.'],
      },
    ],
    faqs: [
      { q: 'Can the tag show medical needs?', a: 'Yes, add a short note; for more detail, use a [link-in-bio](/qr-code-for/link-in-bio) page you can edit.' },
    ],
  },
  {
    slug: 'luggage-tags',
    cat: 'events',
    type: 'VCARD',
    title: 'Luggage Tag QR Code – Get Lost Bags Back',
    description: 'Add a contact QR code to luggage, laptops, keys and cameras so finders can reach you. Privacy-friendly ideas and free printable codes.',
    h1: 'QR code for luggage and lost items',
    name: 'Luggage and lost items',
    answer: 'Put a small contact QR code on luggage tags, laptops, keys and cameras with a phone number or email and “If found, please contact”. Finders scan and reach you without your address on show. For privacy, include only an email or a number you are happy to share, or link to an editable page.',
    sections: [
      {
        h: 'Privacy-friendly options',
        list: ['[Email QR code](/answers/how-to-make-a-qr-code-for-an-email-address) with subject “Found your bag”.', '[WhatsApp](/qr-code-for/whatsapp) with “I found your item”.', 'A [link page](/qr-code-for/link-in-bio) you can update while travelling.'],
      },
    ],
    faqs: [
      { q: 'Should I put my home address in it?', a: 'No, a phone or email is enough and safer.' },
    ],
  },

  // ---------------------------------------------------------------- operations
  {
    slug: 'inventory',
    cat: 'ops',
    type: 'TEXT',
    title: 'Inventory QR Codes – Labels for Stock and Assets',
    description: 'Generate QR code labels for inventory, assets and equipment from a spreadsheet. Scan with any phone to check out, move or audit items. Free.',
    h1: 'QR codes for inventory and asset tracking',
    name: 'Inventory and assets',
    answer: 'For one item, type its ID below and download the label. For many, put the IDs (or links to each record) in a spreadsheet and create all codes at once with the bulk generator. Stick labels on items, shelves and bins; staff scan with any phone to open the record or log a check-out in a Google Form or your system.',
    sections: [
      {
        h: 'Set-up',
        steps: ['List items with permanent IDs in a spreadsheet.', 'Decide what a scan opens: just the ID, a Google Form, or a record page.', 'Generate codes in bulk from the CSV.', 'Print durable labels with the ID as text too.'],
        p: ['Full guide: [QR code inventory management](/guides/qr-code-inventory-management).'],
      },
    ],
    faqs: [
      { q: 'Static or dynamic labels?', a: 'Static for plain IDs; dynamic if labels open records that may move to new software.' },
    ],
  },
  {
    slug: 'attendance',
    cat: 'ops',
    type: 'URL',
    title: 'Attendance QR Code – Check-In for Classes and Staff',
    description: 'Take attendance with a QR code: students or staff scan to check in on a Google Form, with timestamps in a sheet. Free for schools and businesses.',
    h1: 'QR code for attendance',
    name: 'Attendance',
    answer: 'Make a Google Form with name or ID and session fields, paste its link below and display the QR code at the door or on screen. Each scan opens the form; submissions are timestamped in Google Sheets. Use a dynamic code so you can switch forms per session and stop the code working once the session ends.',
    sections: [
      {
        h: 'Guide',
        p: ['Step-by-step set-up, plus ways to stop check-ins from outside the room: [QR code attendance system](/guides/qr-code-attendance-system).'],
      },
    ],
    faqs: [
      { q: 'Does everyone need a smartphone?', a: 'Most people have one; keep a paper list or a shared tablet for those who do not.' },
    ],
  },
  {
    slug: 'equipment-manuals',
    cat: 'ops',
    type: 'PDF',
    title: 'QR Codes for Equipment Manuals and Safety Sheets',
    description: 'Stick a QR code on machines and equipment that opens the manual, safety data sheet, maintenance log or how-to video. Always the latest version.',
    h1: 'QR codes for equipment manuals and safety sheets',
    name: 'Equipment manuals',
    answer: 'Upload the manual or safety data sheet below and put the QR code sticker on the machine. Anyone can scan to read the latest document on their phone, and because the code is dynamic you replace the file when a new revision comes out without relabelling equipment.',
    sections: [
      {
        h: 'Ideas',
        list: ['Operating manuals and quick-start cards.', 'Safety data sheets for chemicals.', 'Maintenance and inspection forms (link a [Google Form](/qr-code-for/google-forms)).', 'Training [videos](/qr-code-for/video).', 'Contact for faults: [phone](/qr-code-for/phone-number) or [WhatsApp](/qr-code-for/whatsapp).'],
      },
      {
        h: 'Labels that last',
        list: ['Polyester or metal labels for workshops.', 'Error correction H for oil and dust.', 'At least 3 cm, at eye level.'],
      },
    ],
    faqs: [
      { q: 'Can it replace paper safety sheets?', a: 'Check your local regulations; many require the sheets to be accessible to workers, which a QR code can support but may not replace.' },
    ],
  },
  {
    slug: 'resumes',
    cat: 'ops',
    type: 'LINK_LIST',
    title: 'QR Code on a Resume or CV – Portfolio and LinkedIn',
    description: 'Add a QR code to your resume or CV that opens your portfolio, LinkedIn or a link page with your work. Size, placement and what recruiters expect.',
    h1: 'QR code on a resume or CV',
    name: 'Resumes and CVs',
    answer: 'Add a small QR code (2–2.5 cm) in the header or contact section of your CV that opens your portfolio, LinkedIn profile or a link page with your best work. Also print the link as text, since many CVs are read on screen or by applicant tracking systems, where a link is easier than a code.',
    sections: [
      {
        h: 'What to link',
        list: ['A link page with portfolio, LinkedIn and GitHub (below).', '[LinkedIn profile](/qr-code-for/linkedin).', 'A [video introduction](/qr-code-for/video).', 'A [PDF portfolio](/qr-code-for/pdf).'],
      },
      {
        h: 'Tips',
        list: ['Keep it small and tidy; it should not dominate the page.', 'Use a dynamic code so you can update the portfolio during the job hunt.', 'Make sure the page looks good on a phone.'],
      },
    ],
    faqs: [
      { q: 'Do recruiters scan QR codes on CVs?', a: 'Some do on printed CVs at interviews and job fairs. Always include the clickable link too.' },
    ],
  },
];
