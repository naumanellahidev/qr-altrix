import type { ForExtra } from '@/content/seo/for-extra';

/** Extra sections and FAQs for the business, industry, events, print and operations pages. */
export const FOR_EXTRA_2: Record<string, ForExtra> = {
  'restaurant-menu': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the restaurant menu type above and add your restaurant name, logo and currency symbol.',
          'Add sections such as Starters, Mains and Drinks, with one item per line: Name | Price | Description.',
          'Use the note at the top for service charge, opening hours or “Ask staff about allergens”.',
          'Save it as dynamic, so price changes and daily specials never need a reprint.',
        ],
      },
      {
        h: 'On the table',
        p: [
          'Table tents, stickers in the corner of the table and the front window all work. Print the table number next to the code if staff take orders, and keep a few paper menus for guests who prefer them. [Full menu guide](/guides/how-to-create-a-qr-code-menu).',
        ],
      },
    ],
    faqs: [
      { q: 'Can I show allergens on the menu?', a: 'Yes, add them in each item’s description or as a separate section, and keep staff ready to answer questions.' },
      { q: 'Can guests order from the menu?', a: 'The menu page shows dishes and prices. To take orders, link a button to your ordering system.' },
    ],
  },

  'business-cards': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the digital business card type above.',
          'Add your photo, name, job title, phone, email, website and social links.',
          'Save it as dynamic. Scanning opens your card page with a button to save you as a contact.',
          'Print the code on the back of your card at 2 cm or more, with a line such as “Scan to save my details”.',
        ],
      },
      {
        h: 'Why a digital card helps',
        p: [
          'Paper cards go out of date when you change role or number. With a digital card behind the code, you edit the page and every card you have already handed out shows the new details. [Business card QR tips](/answers/can-you-put-a-qr-code-on-a-business-card).',
        ],
      },
    ],
    faqs: [
      { q: 'What is the difference from a contact card code?', a: 'A contact card code stores the details inside the pattern and cannot change; a digital card is a page you can edit.' },
      { q: 'Can I use it in an email signature?', a: 'Yes, add the card link or a small QR image to your signature.' },
    ],
  },

  'customer-feedback': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the feedback form type above and write one clear question, such as “How was your visit today?”.',
          'Add your business name and logo, and decide whether to ask for an email address.',
          'Optionally add your public review link. Every person who answers sees it, whatever rating they give.',
          'Place the code where the experience ends: the bill, the receipt or the checkout.',
        ],
      },
      {
        h: 'Use the answers',
        p: [
          'Read new responses in your dashboard every day and reply to anyone who left an email. Patterns matter more than single comments: if “slow service” appears every Friday, that is the shift to fix.',
        ],
      },
    ],
    faqs: [
      { q: 'Is the form anonymous?', a: 'Yes, unless you ask for an email address.' },
      { q: 'Can I send people to Google reviews?', a: 'You can show your review link to everyone who answers. Google does not allow sending only happy customers there.' },
    ],
  },

  coupons: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the coupon type above and write the offer headline, for example “10% off your next visit”.',
          'Add the coupon code, your business name and logo.',
          'Write short terms and a “valid until” date so there is no argument at the till.',
          'Optionally add a button that links to your online shop.',
        ],
      },
      {
        h: 'Where coupons get used',
        list: [
          'Receipts, to bring customers back.',
          'Flyers and door drops, with a different code per area to see which streets respond.',
          'Packaging inserts, for a repeat order discount.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I end the offer early?', a: 'Pause the dynamic code or change the page; the printed code then shows the update.' },
      { q: 'How do I know how many people saw the offer?', a: 'Your dashboard counts scans of the coupon code by day and place.' },
    ],
  },

  flyers: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Decide the one thing the flyer should lead to: booking page, menu, offer or sign-up.',
          'Paste that link above and make it a dynamic code so you can measure scans.',
          'Place the code 3–4 cm wide on an A5 flyer, near the offer and away from folds.',
          'Print one test flyer and scan it in ordinary room light before printing the whole run.',
        ],
      },
      {
        h: 'Design that gets scans',
        p: [
          'Tell people what they get and how long it takes: “Scan to book in 30 seconds”. Keep the code dark on a light background with a clear white margin. [Flyer and poster design](/guides/qr-code-flyer-and-poster-design).',
        ],
      },
    ],
    faqs: [
      { q: 'Can I tell which flyer drop worked?', a: 'Use a different dynamic code for each area or batch and compare scans.' },
      { q: 'Does glossy paper cause problems?', a: 'Strong gloss can reflect light. Matte or silk finishes scan more reliably.' },
    ],
  },

  posters: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Paste the page you want people to open, such as tickets or event details.',
          'Work out the size: divide the scanning distance by 10. People reading a poster from 2 metres need a 20 cm code.',
          'Put the code at eye level, not at the bottom edge where people cannot reach it.',
          'Scan the printed poster from the distance people will actually stand.',
        ],
      },
      {
        h: 'Outdoor posters',
        p: [
          'Laminated or weatherproof prints keep the code readable in rain. Avoid placing it where glare from street lights or windows falls on it, and check that nobody has stuck another code over yours. [Scanning distance](/answers/how-far-away-can-a-qr-code-be-scanned).',
        ],
      },
    ],
    faqs: [
      { q: 'How big should a poster QR code be?', a: 'Roughly one tenth of the scanning distance. 10 cm suits 1 metre, 30 cm suits 3 metres.' },
      { q: 'Can I use colours?', a: 'Yes, keep the code dark on a light background with strong contrast.' },
    ],
  },

  'product-packaging': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the product page type above and add the name, images, price, description and specifications.',
          'Add a buy link to your shop, and save the code as dynamic.',
          'Leave space on the artwork for a code at least 2 cm wide, with a quiet margin around it.',
          'Ask your printer for a proof and scan it before the full run.',
        ],
      },
      {
        h: 'What to link to',
        list: [
          'Setup or recipe videos.',
          'Ingredients, care instructions and recycling information.',
          'Warranty registration and reorder links.',
        ],
      },
    ],
    faqs: [
      { q: 'Will a code work on a curved bottle?', a: 'Yes, if it is small relative to the curve. Place it on the flattest part.' },
      { q: 'Can I change the page after the product ships?', a: 'With a dynamic code, yes. [Packaging guide](/guides/qr-codes-on-product-packaging).' },
    ],
  },

  'small-business': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the business page type above.',
          'Add your name, tagline, logo and cover photo, then a short “about” paragraph.',
          'Fill in phone, WhatsApp, email, website, address and map link, plus opening hours for each day.',
          'List your main services, then save it as a dynamic code.',
        ],
      },
      {
        h: 'Where to use it',
        p: [
          'Shop door and window, business cards, vans, invoices and local adverts. One page with your hours and contact options answers the most common questions before people call.',
        ],
      },
    ],
    faqs: [
      { q: 'Do I need a website for this?', a: 'No. The business page works as a simple one-page site, and you can link to your website if you have one.' },
      { q: 'Can I update opening hours for holidays?', a: 'Yes, edit the page and the printed code shows the new hours.' },
    ],
  },

  'real-estate': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the landing page type above, or link to the listing on your website.',
          'Add photos, price, key details and a button to book a viewing.',
          'Use one dynamic code per property, so the board can be reused for the next listing.',
          'On “For sale” boards, make the code at least 15 cm wide for scanning from the pavement.',
        ],
      },
      {
        h: 'Ideas',
        list: [
          'Window cards in the agency, scanned after hours.',
          'Brochures that open a video tour.',
          'Open house sign-in forms.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I see interest per property?', a: 'Yes, each dynamic code has its own scan count.' },
      { q: 'What happens when the property sells?', a: 'Point the code at a “sold” page or your other listings. [Real estate guide](/guides/qr-codes-for-real-estate-marketing).' },
    ],
  },

  hotels: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the business page type for a guest information page: hours, services, phone, map.',
          'Add a separate [Wi-Fi code](/qr-code-for/wifi-password) for the guest network.',
          'Create codes for the restaurant menu, room service and local guide.',
          'Place them in rooms, at reception and in the lift.',
        ],
      },
      {
        h: 'Guest-friendly placement',
        p: [
          'Bedside cards and the back of the room door are read when guests have time. Keep codes away from bathroom steam, label each one clearly (“Breakfast menu”, “Wi-Fi”), and keep a printed copy at reception for guests who do not use smartphones.',
        ],
      },
    ],
    faqs: [
      { q: 'Can one code serve all rooms?', a: 'Yes for general information. Use separate codes if you want to know which room types scan most.' },
      { q: 'Can the page be in several languages?', a: 'Create one page per language and print each code with a small flag or language name.' },
    ],
  },

  schools: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Paste the link to the page or document you want parents or pupils to open.',
          'For forms (trips, clubs, permissions), use a [Google Forms code](/qr-code-for/google-forms).',
          'Make it dynamic so the same newsletter code can point at each term’s updates.',
          'Test it on a parent’s phone outside the school network.',
        ],
      },
      {
        h: 'Keep it safe',
        p: [
          'Never link to documents with pupils’ personal details from a public code. Share timetables, term dates, reading lists and club sign-ups, and keep anything private behind the school’s own login.',
        ],
      },
    ],
    faqs: [
      { q: 'Can pupils use it in class?', a: 'Yes, for worksheets, videos and quizzes. Check your school’s policy on phones first.' },
      { q: 'Can I track attendance this way?', a: 'Yes, see [attendance QR codes](/qr-code-for/attendance).' },
    ],
  },

  gyms: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the link list type above and add buttons for class timetable, booking, membership and contact.',
          'Make separate codes for each machine, linking to a short how-to video.',
          'Save them as dynamic so you can change videos and timetables.',
          'Use durable stickers that survive cleaning sprays.',
        ],
      },
      {
        h: 'Ideas',
        list: [
          'Reception: join, book a class, follow on social media.',
          'Machines: “How to use this safely” videos.',
          'Changing rooms: feedback form and lost property.',
        ],
      },
    ],
    faqs: [
      { q: 'Will codes on machines get worn?', a: 'Use laminated or vinyl stickers and check them every few months.' },
      { q: 'Can I see which machines get scanned most?', a: 'Yes, give each machine its own dynamic code.' },
    ],
  },

  salons: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the business page type above.',
          'List services, opening hours and contact options, including WhatsApp.',
          'Add a booking link if you use an online booking system.',
          'Save it as dynamic and print it on the mirror card, the front desk and appointment cards.',
        ],
      },
      {
        h: 'Turn visits into rebookings',
        p: [
          'The best moment is the end of the appointment. A small card with “Book your next visit” and the code at the till makes rebooking a ten-second job. Add your gallery of recent work so new clients can see your style.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I show before-and-after photos?', a: 'Yes, link a [photo gallery](/qr-code-for/photos) from the page. Ask clients before posting their photos.' },
      { q: 'Can clients book from the code?', a: 'Yes, if you add your booking system’s link as a button.' },
    ],
  },

  healthcare: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the PDF type above for leaflets, aftercare instructions or forms.',
          'Upload the document and add a clear title.',
          'Save it as dynamic so updated guidance replaces the old version.',
          'Check the PDF reads well on a phone screen.',
        ],
      },
      {
        h: 'Privacy first',
        p: [
          'Public codes must never contain or link to patient information. Use them for general material: opening hours, aftercare, how to prepare for an appointment, health campaigns. For anything personal, link to your official patient portal.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I use a code for patient check-in?', a: 'Only through a secure system that meets health-data rules. A general form is not suitable for medical details.' },
      { q: 'Are codes in waiting rooms useful?', a: 'Yes, for leaflets and campaign information people can read on their phone.' },
    ],
  },

  churches: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the link list type above.',
          'Add buttons for service times, this week’s notices, giving, livestream and contact.',
          'Save it as dynamic and update the notices each week.',
          'Print it on the service sheet, the noticeboard and the entrance.',
        ],
      },
      {
        h: 'Ideas',
        list: [
          'Song words and readings as a PDF for the service.',
          'Event sign-up for groups and volunteering.',
          'Online giving link for those who no longer carry cash.',
        ],
      },
    ],
    faqs: [
      { q: 'Can people give money through the code?', a: 'Link to your existing online giving page. Check payment codes regularly so nobody covers them with another code.' },
      { q: 'Can I show this week’s service sheet?', a: 'Yes, upload it as a PDF and replace it each week.' },
    ],
  },

  museums: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the audio type above and upload a short recording for each exhibit.',
          'Add a title and a line of text so people know what they are listening to.',
          'Make one code per exhibit and number them on the label.',
          'Test the audio in the gallery, where Wi-Fi or mobile signal may be weaker.',
        ],
      },
      {
        h: 'Visitor tips',
        p: [
          'Keep each recording between one and three minutes. Offer guest Wi-Fi at the entrance, add the transcript for visitors who prefer reading, and remind people to use headphones.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I offer the guide in other languages?', a: 'Yes, make one code per language or a page with a button per language.' },
      { q: 'Can I see which exhibits are popular?', a: 'Yes, each dynamic code counts its own scans.' },
    ],
  },

  'retail-stores': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the product page type for single products, or paste a category link from your shop.',
          'Add images, price, specifications and the buy link.',
          'Make one dynamic code per placement (window, shelf, till) so you can compare scans.',
          'Place shelf codes at eye level and print them at least 2 cm wide.',
        ],
      },
      {
        h: 'After hours',
        p: [
          'A window code with “Shop online now” turns window shoppers into customers when the shop is closed. Change the destination with the season: new arrivals, sale, gift guide.',
        ],
      },
    ],
    faqs: [
      { q: 'Can a shelf code show stock levels?', a: 'Only if your online shop shows them. The code opens whatever page you link to.' },
      { q: 'Do customers really scan in shops?', a: 'They scan when the code promises something useful: reviews, sizes, how-to videos or a discount.' },
    ],
  },

  weddings: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the event page type above and add your names, the date, venue and address.',
          'Add the map link and the day’s agenda: ceremony, drinks, dinner, dancing.',
          'Put your RSVP form or wedding website link in the “Tickets / RSVP” field.',
          'Print the code on the back of the invitation with “Scan for details and RSVP”.',
        ],
      },
      {
        h: 'Design',
        p: [
          'A dark colour from your palette on a light card scans well. Keep a white margin around the code and test a printed proof before ordering every invitation.',
        ],
      },
    ],
    faqs: [
      { q: 'Can older guests use it?', a: 'Print the key details on the card too; the code adds the map, schedule and RSVP.' },
      { q: 'Can I collect guests’ photos?', a: 'Link a shared album from the event page, or make a separate code for it at the tables.' },
    ],
  },

  events: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the event page type above and add the name, start and end time, venue and address.',
          'Add a cover image, description, agenda and the link to tickets or registration.',
          'Save it as dynamic so you can update times or rooms on the day.',
          'Print the code on posters, tickets and badges.',
        ],
      },
      {
        h: 'On the day',
        list: [
          'Entrance: agenda and map of the venue.',
          'Rooms: speaker slides and feedback form.',
          'Exit: photos and next event sign-up.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I check people in with QR codes?', a: 'Yes, see the [event check-in guide](/guides/qr-code-event-check-in).' },
      { q: 'What if the venue changes?', a: 'Update the event page. Every printed code shows the new venue.' },
    ],
  },

  'birthday-invitations': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the event page type above and add whose birthday it is, the date, time and place.',
          'Add a short note: dress code, theme, what to bring.',
          'Put an RSVP link (a simple form works) in the RSVP field.',
          'Print the code on the invitation or send the image in your group chat.',
        ],
      },
      {
        h: 'Small touches',
        p: [
          'Add the map link so nobody gets lost, a gift list if you use one, and after the party a link to the photos. For children’s parties, ask parents for a contact number in the RSVP form.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I change the time after sending invitations?', a: 'With a dynamic code, yes: update the page and everyone sees the new time.' },
      { q: 'Can guests add the party to their calendar?', a: 'Put the date clearly on the page; guests can add it from there.' },
    ],
  },

  memorials: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the image gallery type above and upload photos of your loved one.',
          'Add their name, dates and a few words about their life.',
          'Save it as dynamic, so family can add more photos and memories over time.',
          'Ask the stonemason or plaque maker to engrave or print the code on a durable material.',
        ],
      },
      {
        h: 'Lasting materials',
        p: [
          'Codes on headstones and benches face weather for years. Engraved metal, ceramic or UV-resistant plaques last longest. Make the code at least 3 cm wide and test it once it is fixed in place.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I keep the page private?', a: 'Add a password to the dynamic code and share it with family.' },
      { q: 'Can I add a video tribute?', a: 'Yes, link a video from the page or create a [video code](/qr-code-for/video).' },
    ],
  },

  'pet-tags': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the contact card type above.',
          'Add your pet’s name and your phone number; add an email if you like.',
          'Leave out your home address: a phone number is enough for someone to reach you.',
          'Print or engrave the code on the tag at least 2 cm wide.',
        ],
      },
      {
        h: 'Keep it working',
        p: [
          'Tags get scratched. Use an engraved or resin-coated tag, and keep a microchip registration as well: the code helps a finder contact you quickly, the chip is what vets and shelters check.',
        ],
      },
    ],
    faqs: [
      { q: 'What if my number changes?', a: 'A contact card code holds the number inside, so you need a new tag. A dynamic page can be edited instead.' },
      { q: 'Does it track my pet?', a: 'No. A QR code is not a GPS tracker; it only helps a finder contact you.' },
    ],
  },

  'luggage-tags': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the contact card type above.',
          'Add your name, a mobile number with country code, and an email.',
          'Do not include your home address; it tells strangers when your house is empty.',
          'Print the code on a sturdy tag or label, at least 2.5 cm wide.',
        ],
      },
      {
        h: 'Other things to tag',
        list: [
          'Laptops and tablets.',
          'Keys and wallets.',
          'Cameras, drones and sports equipment.',
        ],
      },
    ],
    faqs: [
      { q: 'Does it work abroad?', a: 'Yes. Add your number with the country code so finders can call from any country.' },
      { q: 'Can airlines scan it?', a: 'Anyone with a phone camera can scan it, including airline staff.' },
    ],
  },

  inventory: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Give each item or shelf an ID, for example SHELF-A12 or ITEM-00451.',
          'Create codes in bulk from a spreadsheet with the [bulk generator](/tools/bulk-qr-code-generator).',
          'Decide what a scan does: show the ID as text, or open a form to log movement.',
          'Print labels on a label printer and stick them where they will not rub off.',
        ],
      },
      {
        h: 'Practical tips',
        p: [
          'Keep the code’s content short (just the ID) so labels can be small. Scan with the phone’s camera or any scanner app. [Inventory guide](/guides/qr-code-inventory-management) and [bulk codes from a spreadsheet](/guides/bulk-qr-codes-from-a-spreadsheet).',
        ],
      },
    ],
    faqs: [
      { q: 'Do I need special scanners?', a: 'No. Phones read QR codes; a handheld scanner is faster for large warehouses.' },
      { q: 'Can I print many labels at once?', a: 'Yes, create them in bulk from a CSV, download the ZIP and print the images on your label sheets.' },
    ],
  },

  attendance: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Make a Google Form with name and, if needed, ID or class.',
          'Copy the form link and paste it above.',
          'Print the code at the door or show it on a screen at the start of the session.',
          'Responses arrive with a timestamp in the form’s spreadsheet.',
        ],
      },
      {
        h: 'Stop proxy check-ins',
        p: [
          'One shared code can be photographed and sent to someone not present. Show it only at the start, change the code each session with a dynamic link, or have a staff member scan personal codes. [Attendance guide](/guides/qr-code-attendance-system).',
        ],
      },
    ],
    faqs: [
      { q: 'Can I record the time of arrival?', a: 'Yes, Google Forms records the time of every response.' },
      { q: 'Does it work for staff shifts?', a: 'Yes, for simple sign-in sheets. For payroll, use a proper time-tracking system.' },
    ],
  },

  'equipment-manuals': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the PDF type above and upload the manual or safety sheet.',
          'Add the model name as the title.',
          'Save it as dynamic, so a revised manual replaces the old one on every machine.',
          'Stick the label where operators look, using a durable, oil-resistant material.',
        ],
      },
      {
        h: 'What to include',
        list: [
          'Quick-start steps on the first page.',
          'Safety and emergency stop instructions.',
          'Service contact and a link to log a fault.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I link to a video instead?', a: 'Yes, a short how-to video often helps more than a long PDF.' },
      { q: 'Will it work in a factory with no signal?', a: 'Opening a PDF needs internet. Provide Wi-Fi or a printed copy nearby.' },
    ],
  },

  resumes: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the link list type above.',
          'Add buttons for your portfolio, LinkedIn, GitHub or published work, and a PDF of your CV.',
          'Save it as dynamic, so you can add new work after sending applications.',
          'Place a small code (2 cm) in the header or contact section of your CV.',
        ],
      },
      {
        h: 'Make it count',
        p: [
          'Recruiters often read CVs on screen, so also include the link as clickable text. Label the code clearly, for example “Portfolio and references”, and keep the page professional.',
        ],
      },
    ],
    faqs: [
      { q: 'Do recruiters scan QR codes on CVs?', a: 'Some do, especially on printed CVs at interviews and career fairs. Add the plain link too.' },
      { q: 'Can I see if an employer opened it?', a: 'You see scan counts and times, not who scanned.' },
    ],
  },
};
