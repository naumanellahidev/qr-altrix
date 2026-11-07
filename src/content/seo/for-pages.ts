import type { SeoDoc } from '@/content/seo/types';

/** "QR code for …" pages, part 1: social, Google, contact and file types. Each opens the generator on `type`. */
export const FOR_PAGES: SeoDoc[] = [
  // ---------------------------------------------------------------- social
  {
    slug: 'instagram',
    cat: 'social',
    type: 'URL',
    title: 'Instagram QR Code Generator – Free, With Logo',
    description: 'Make a QR code for your Instagram profile, post or reel, with the Instagram logo or yours. Free download, no sign-up; dynamic version with scan stats.',
    h1: 'QR code for Instagram',
    name: 'Instagram',
    answer: 'Copy your profile link (instagram.com/yourname), paste it into the generator below, add a logo and a “Follow us on Instagram” frame, and download. Scanning opens your profile in the Instagram app. Instagram also has its own QR code in the profile menu, but a code made here can carry your brand design and, as a dynamic code, count scans.',
    sections: [
      {
        h: 'How to make an Instagram QR code',
        steps: [
          'In Instagram, open your profile and copy the link, or type https://instagram.com/yourusername.',
          'Paste it into the generator above.',
          'Add colours, your logo and a frame with “Follow us”.',
          'Download PNG for screens or SVG/PDF for print.',
          'Scan to test: it should open your profile in the app.',
        ],
        p: ['Want to edit the link later or see how many people scanned? Switch to a [dynamic URL code](/qr-code-generator/dynamic-url), free with an account.'],
      },
      {
        h: 'Where to use it',
        list: [
          'Shop counters, windows and packaging inserts.',
          'Event signage and photo walls.',
          'Business cards and flyers.',
          'Restaurant table cards next to the menu.',
        ],
      },
      {
        h: 'More than one account?',
        p: ['Use a [link-in-bio page](/qr-code-for/link-in-bio) or a [social media QR code](/qr-code-for/social-media) to show Instagram, TikTok, Facebook and your website from one scan.'],
      },
    ],
    faqs: [
      { q: 'Where is the Instagram QR code in the app?', a: 'In your profile, open the menu (or the share-profile option) and choose QR code. It uses Instagram’s own design and cannot be tracked.' },
      { q: 'Can a QR code open a specific post or reel?', a: 'Yes. Copy the post’s link from Share › Copy link and use that instead of your profile link.' },
      { q: 'Does an Instagram QR code expire?', a: 'Not this one: the static code holds your link permanently.' },
    ],
  },
  {
    slug: 'facebook',
    cat: 'social',
    type: 'URL',
    title: 'Facebook QR Code Generator – Page, Profile or Group',
    description: 'Create a free QR code for your Facebook page, profile, group, event or review page. Custom colours and logo; download PNG, SVG or PDF.',
    h1: 'QR code for Facebook',
    name: 'Facebook',
    answer: 'Copy the link of your Facebook page, profile, group or event, paste it into the generator below and download the code. Scanning opens it in the Facebook app, where people can follow, like, join or review. Add a frame such as “Like us on Facebook” so people know what they will get.',
    sections: [
      {
        h: 'Get the right Facebook link',
        list: [
          'Page: open the page and copy the address (facebook.com/yourpage).',
          'Profile: open your profile › … › Copy link.',
          'Group or event: open it › Share › Copy link.',
          'Reviews: add /reviews to your page link (facebook.com/yourpage/reviews).',
        ],
      },
      {
        h: 'Make and print it',
        steps: [
          'Paste the link above.',
          'Use Facebook blue or your brand colour, with a logo in the centre if you like.',
          'Download SVG or PDF for print at 2.5 cm or more.',
        ],
        p: ['For many channels on one code, use a [social media QR code](/qr-code-for/social-media).'],
      },
    ],
    faqs: [
      { q: 'Does Facebook have its own QR code?', a: 'Facebook pages and Messenger offer a QR code in some versions of the app, with Facebook’s design and no tracking.' },
      { q: 'Can people scan it without the Facebook app?', a: 'Yes, it opens in the browser.' },
    ],
  },
  {
    slug: 'youtube',
    cat: 'social',
    type: 'URL',
    title: 'YouTube QR Code Generator – Channel or Video Link',
    description: 'Make a QR code that opens your YouTube video, channel, Short or playlist. Free, with logo and colours; dynamic version lets you swap the video later.',
    h1: 'QR code for YouTube',
    name: 'YouTube',
    answer: 'Copy the video, Short, playlist or channel link from YouTube (Share › Copy), paste it into the generator below and download. On a phone, scanning opens it straight in the YouTube app. Use a dynamic code if you want to swap the video later, for example when you upload a newer tutorial, without reprinting.',
    sections: [
      {
        h: 'Video or channel?',
        list: [
          'Single video: product demos, tutorials, trailers, a wedding film.',
          'Channel: posters, business cards and merch, to win subscribers. Add ?sub_confirmation=1 to the channel link to open the subscribe prompt.',
          'Playlist: courses, recipe series, a band’s album.',
        ],
      },
      {
        h: 'Video on packaging and print',
        p: [
          'A how-to video on a box answers questions before customers contact support. Print the code with “Scan for setup video” and use a dynamic code so the same print can point to an updated version. If you would rather not send people to YouTube, upload the file to a [video QR code](/qr-code-generator/video) page.',
        ],
      },
    ],
    faqs: [
      { q: 'Can the QR code start the video at a certain time?', a: 'Yes. Use Share › Start at to copy a link with the time.' },
      { q: 'Can I make a QR code for a YouTube Short?', a: 'Yes, copy the Short’s share link.' },
    ],
  },
  {
    slug: 'tiktok',
    cat: 'social',
    type: 'URL',
    title: 'TikTok QR Code Generator – Profile or Video, Free',
    description: 'Make a QR code for your TikTok profile or a video, with your own colours and logo. Free PNG, SVG and PDF downloads, plus trackable dynamic codes.',
    h1: 'QR code for TikTok',
    name: 'TikTok',
    answer: 'Copy your TikTok profile link (tiktok.com/@yourname) or a video’s share link, paste it into the generator below and download the code. Scanning opens TikTok on the right profile or video. TikTok’s in-app QR code works too, but a code made here can match your brand and, if dynamic, tell you how many people scanned.',
    sections: [
      {
        h: 'Step by step',
        steps: [
          'In TikTok, go to Profile › Share profile › Copy link (or Share › Copy link on a video).',
          'Paste the link above and design the code.',
          'Add a “Follow us on TikTok” frame.',
          'Download and test.',
        ],
      },
      {
        h: 'Ideas',
        list: [
          'In-store displays next to products that went viral.',
          'Event and festival signage.',
          'Packaging inserts asking for unboxing videos.',
          'Merch and stickers.',
        ],
      },
    ],
    faqs: [
      { q: 'Does it work if people do not have TikTok?', a: 'Yes, the video opens in the browser.' },
    ],
  },
  {
    slug: 'linkedin',
    cat: 'social',
    type: 'URL',
    title: 'LinkedIn QR Code Generator – Profile or Company Page',
    description: 'Create a QR code for your LinkedIn profile or company page for business cards, CVs, slides and name badges. Free, with logo and frame.',
    h1: 'QR code for LinkedIn',
    name: 'LinkedIn',
    answer: 'Copy your public profile URL from LinkedIn (linkedin.com/in/yourname) or your company page link, paste it into the generator below and download the code. Put it on business cards, CVs, conference badges and the last slide of a talk. LinkedIn’s app also has a personal QR code in the search bar, but it cannot be styled or tracked.',
    sections: [
      {
        h: 'Find your LinkedIn link',
        list: [
          'Profile: Me › View profile › Contact info, or Edit public profile & URL to set a short custom URL.',
          'Company: open the page and copy the address.',
          'A post or event: … › Copy link to post.',
        ],
      },
      {
        h: 'Where to use it',
        list: [
          '[Business cards](/qr-code-for/business-cards) and email signatures.',
          'Your CV: see [QR code on a resume](/qr-code-for/resumes).',
          'The closing slide of presentations: “Connect with me”.',
          'Name badges at conferences and job fairs.',
        ],
        p: ['To share contact details too, use a [digital business card](/qr-code-generator/digital-business-card) that includes your LinkedIn.'],
      },
    ],
    faqs: [
      { q: 'Where is the LinkedIn QR code in the app?', a: 'In the LinkedIn mobile app, tap the QR icon in the search bar to see My code.' },
    ],
  },
  {
    slug: 'spotify',
    cat: 'social',
    type: 'URL',
    title: 'Spotify QR Code Generator – Song, Album or Playlist',
    description: 'Make a QR code that opens a Spotify song, album, playlist, podcast or artist page. Free, styled with your colours; perfect for gifts, events and merch.',
    h1: 'QR code for Spotify',
    name: 'Spotify',
    answer: 'In Spotify, tap … › Share › Copy link on a song, album, playlist, podcast or artist, paste the link into the generator below and download the QR code. Scanning opens it in the Spotify app (or the web player). Unlike Spotify’s own scannable codes, a QR code works with any phone camera.',
    sections: [
      {
        h: 'Ideas',
        list: [
          'Wedding and party playlists on table cards.',
          'Gifts: a framed print of “our song”.',
          'Band merch, posters and vinyl inserts.',
          'Shop or café playlists at the counter.',
          'Podcast promotion on flyers.',
        ],
      },
      {
        h: 'Several platforms',
        p: ['Not everyone uses Spotify. A [playlist QR code](/qr-code-generator/playlist) or [link-in-bio page](/qr-code-for/link-in-bio) can show Spotify, Apple Music and YouTube links together.'],
      },
    ],
    faqs: [
      { q: 'What is the difference between a Spotify Code and a QR code?', a: 'Spotify Codes (the sound-wave bars) can only be scanned inside Spotify. A QR code opens with any camera.' },
    ],
  },
  {
    slug: 'social-media',
    cat: 'social',
    type: 'SOCIAL',
    title: 'Social Media QR Code – All Your Profiles in One Scan',
    description: 'One QR code for Instagram, TikTok, Facebook, YouTube, LinkedIn, X and your website: a mobile page with every profile. Free, editable, trackable.',
    h1: 'One QR code for all your social media',
    name: 'All social media',
    answer: 'A social media QR code opens a mobile page with buttons for each of your profiles: Instagram, TikTok, Facebook, YouTube, LinkedIn, X, WhatsApp and your website. Add the links below, design the code and print it once. Because it is dynamic, you can add or remove profiles later and the printed code stays the same.',
    sections: [
      {
        h: 'Step by step',
        steps: [
          'Add your profile links in the generator above.',
          'Add a title, logo and short description for the page.',
          'Create the code (a free account keeps it editable) and choose a frame: “Follow us”.',
          'Download and print on cards, packaging, counters and posters.',
        ],
      },
      {
        h: 'Why one code beats several',
        p: ['Space on print is limited and people scan one code, not four. A single page lets them choose their favourite app, and scan analytics show how many people looked. For a page with any kind of links, not just social, use a [link-in-bio page](/qr-code-for/link-in-bio).'],
      },
    ],
    faqs: [
      { q: 'Is it free?', a: 'Yes, including edits and analytics.' },
    ],
  },
  {
    slug: 'link-in-bio',
    cat: 'social',
    type: 'LINK_LIST',
    title: 'Link-in-Bio QR Code – Multiple Links in One QR Code',
    description: 'Put several links behind one QR code: a mobile link page for your shop, booking, socials, menu and more. Free, with no monthly fee, editable anytime.',
    h1: 'QR code with multiple links (link in bio)',
    name: 'Multiple links (link in bio)',
    answer: 'A QR code can only hold one link, so to share several, point it to a link page. Add your links below (shop, booking, menu, socials, latest video), give the page your logo and colours, and print the code. Visitors see a tidy list of buttons on their phone, and you can change the links at any time without reprinting.',
    sections: [
      {
        h: 'Good uses',
        list: [
          'Creators and artists: latest release, shop, socials.',
          'Small businesses: booking, menu, reviews, directions.',
          'Events: tickets, schedule, map, photo upload.',
          'Teachers and trainers: slides, resources, feedback form.',
        ],
      },
      {
        h: 'How it differs from a social media code',
        p: ['A [social media code](/qr-code-for/social-media) is designed around social profiles with their icons; a link page holds any links you like with your own button labels. Both are free, dynamic and trackable.'],
      },
    ],
    faqs: [
      { q: 'Can one QR code open two links at once?', a: 'No. It opens one page, which can list as many links as you like.' },
      { q: 'Is there a limit on links?', a: 'No practical limit, but five to eight buttons keeps the page easy to use.' },
    ],
  },

  // ---------------------------------------------------------------- google
  {
    slug: 'google-reviews',
    cat: 'google',
    type: 'WEBSITE',
    title: 'Google Review QR Code – Get More Reviews, Free',
    description: 'Make a QR code that opens your Google review form in one scan. Get your review link, print it on counters, tables and receipts, and track scans.',
    h1: 'QR code for Google reviews',
    name: 'Google reviews',
    answer: 'In your Google Business Profile, choose “Ask for reviews” (or “Get more reviews”) and copy the review link. Paste it into the generator below as a dynamic URL, add a “Review us on Google” frame and print it where happy customers wait. One scan opens the star-rating box, so far more people actually leave the review.',
    sections: [
      {
        h: 'Step by step',
        steps: [
          'Search your business name on Google while signed in, or open Google Maps.',
          'In your Business Profile, choose Ask for reviews and copy the link.',
          'Paste it above, design the code with your logo and a call to action.',
          'Download PDF and print counter cards, stickers or receipt footers.',
        ],
      },
      {
        h: 'Best places to put it',
        list: ['Till and reception desk.', 'Receipts, invoices and delivery bags.', 'Restaurant table cards and bill folders.', 'Thank-you cards and follow-up emails.'],
        p: ['Read the full guide: [how to get more Google reviews with QR codes](/guides/how-to-get-more-google-reviews-with-qr-codes), including what Google’s policies allow.'],
      },
    ],
    faqs: [
      { q: 'Can I reward customers for reviews?', a: 'No. Google’s policies prohibit incentives for reviews.' },
      { q: 'Can I see how many people scanned?', a: 'Yes, with the dynamic code.' },
    ],
  },
  {
    slug: 'google-forms',
    cat: 'google',
    type: 'URL',
    title: 'QR Code for Google Forms – Surveys, Sign-Ups, Attendance',
    description: 'Turn a Google Form into a QR code for surveys, registrations, quizzes and attendance. Get the form link, design the code and print it. Free.',
    h1: 'QR code for a Google Form',
    name: 'Google Forms',
    answer: 'Open the form, click Send, choose the link icon, copy the link (tick “Shorten URL” for a simpler code) and paste it into the generator below. Download and print or display the code; scanning opens the form on the phone, and responses arrive in Google Forms or a linked Google Sheet as usual.',
    sections: [
      {
        h: 'Step by step',
        steps: [
          'In Google Forms, click Send › link icon › Shorten URL › Copy.',
          'Paste the link above.',
          'Add a frame: “Scan to register”, “Scan for the survey”.',
          'Download and print, or put it on a slide.',
        ],
      },
      {
        h: 'Common uses',
        list: [
          '[Attendance](/guides/qr-code-attendance-system) in classes, training and shifts.',
          'Event registration and sign-up sheets.',
          'Customer surveys and feedback.',
          'Quizzes in classrooms.',
        ],
      },
      {
        h: 'If people see “You need permission”',
        p: ['The form is restricted to your organisation. In the form’s Settings › Responses, turn off “Restrict to users in your organisation” if outsiders must answer, and do not require sign-in unless you need it.'],
      },
    ],
    faqs: [
      { q: 'Can Google Forms make a QR code itself?', a: 'No, Forms gives a link; turn it into a code here.' },
      { q: 'Can I reuse the code for next term’s form?', a: 'Yes, if you make it a [dynamic code](/qr-code-generator/dynamic-url) and switch the link.' },
    ],
  },
  {
    slug: 'google-maps',
    cat: 'google',
    type: 'LOCATION',
    title: 'Google Maps QR Code – Share a Location or Directions',
    description: 'Make a QR code that opens a place or exact coordinates in Google Maps for directions. For shops, venues, deliveries, property and invitations.',
    h1: 'QR code for a Google Maps location',
    name: 'Google Maps location',
    answer: 'Enter the address or coordinates in the location generator below, or paste a Google Maps share link into a URL code. Scanning opens the place in the phone’s maps app with directions ready. Use coordinates for places an address does not find, like a side entrance, a car park or a field.',
    sections: [
      {
        h: 'Which method?',
        list: [
          'Google Maps link: shows your business listing with reviews and opening hours. Copy it via Share in Google Maps, then use the [URL generator](/qr-code-generator/url).',
          'Coordinates: drops a pin at the exact spot. Long-press in Google Maps to copy latitude and longitude.',
        ],
      },
      {
        h: 'Uses',
        list: ['Invitations and event posters.', 'Delivery notes for hard-to-find entrances.', 'Property signs and holiday lets.', 'Shop windows and business cards.'],
        p: ['More: [how to get a QR code for a location](/answers/how-to-get-a-qr-code-for-a-location).'],
      },
    ],
    faqs: [
      { q: 'Will it open on iPhone?', a: 'Yes, in Google Maps if installed, or Apple Maps / the browser.' },
    ],
  },
  {
    slug: 'google-drive',
    cat: 'google',
    type: 'URL',
    title: 'QR Code for Google Drive Files, Docs and Folders',
    description: 'Share a Google Drive file, folder, Doc, Sheet or Slides by QR code: set sharing, copy the link, make the code. Free, with dynamic option.',
    h1: 'QR code for a Google Drive file or folder',
    name: 'Google Drive files',
    answer: 'In Google Drive, right-click the file or folder › Share, set General access to “Anyone with the link”, copy the link and paste it into the generator below. Scanning opens the file in Drive or the browser. If you might replace the file, use a dynamic code, or upload the document to a PDF QR code instead.',
    sections: [
      {
        h: 'Step by step',
        steps: [
          'Right-click the file › Share › General access › Anyone with the link (Viewer).',
          'Copy link and paste it above.',
          'Download and print the code.',
          'Test it on a phone that is not signed in to your Google account.',
        ],
      },
      {
        h: 'Drive link or PDF code?',
        p: ['A Drive link is quick but shows Google’s interface and may ask people to sign in for some file types. A [PDF QR code](/qr-code-for/pdf) opens your document on a clean mobile page, and you can swap the file later.'],
      },
    ],
    faqs: [
      { q: 'Why does the link say “Request access”?', a: 'Sharing is still Restricted. Change it to Anyone with the link.' },
    ],
  },
  {
    slug: 'zoom-meetings',
    cat: 'google',
    type: 'URL',
    title: 'QR Code for a Zoom, Teams or Google Meet Meeting',
    description: 'Let people join a Zoom, Microsoft Teams or Google Meet call by scanning a QR code: on slides, posters, invitations and meeting-room screens.',
    h1: 'QR code for Zoom, Teams or Google Meet',
    name: 'Zoom, Teams and Meet',
    answer: 'Copy the meeting’s invite link (Zoom: Copy Invitation link; Teams: Copy join link; Meet: copy the meet.google.com address), paste it into the generator below and download the code. Put it on the invitation, a slide or a meeting-room screen; scanning opens the call on the phone, in the app if it is installed.',
    sections: [
      {
        h: 'Tips',
        list: [
          'For a recurring meeting, use its permanent link, or a dynamic code you update each week.',
          'Include the passcode in the link (Zoom’s invite link does) so people join in one tap.',
          'For webinars, link to the registration page instead.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I add the meeting to people’s calendars instead?', a: 'Yes, with a [calendar event QR code](/qr-code-generator/calendar-event) that includes the link in the description.' },
    ],
  },

  // ---------------------------------------------------------------- contact
  {
    slug: 'whatsapp',
    cat: 'contact',
    type: 'WHATSAPP',
    title: 'WhatsApp QR Code Generator – Chat With a Pre-Filled Message',
    description: 'Make a QR code that opens a WhatsApp chat with your number and a ready message. For shops, support, orders and deliveries. Free, no sign-up.',
    h1: 'QR code for WhatsApp',
    name: 'WhatsApp chat',
    answer: 'Enter your WhatsApp number in international format and an optional first message below, then download the code. Scanning opens WhatsApp with a chat to you and the message ready to send, so customers do not need to save your number first. It works for personal numbers and WhatsApp Business.',
    sections: [
      {
        h: 'Step by step',
        steps: [
          'Enter the number with its country code (for example +44 7700 900123).',
          'Write a starting message, such as “Hi, I would like to order”.',
          'Add a WhatsApp-green frame: “Chat with us”.',
          'Download and test with a phone that does not have your number saved.',
        ],
      },
      {
        h: 'Uses',
        list: ['Orders and table service.', 'Support on packaging and invoices.', 'Quotes on vans and site boards.', 'Property and car listings.'],
      },
      {
        h: 'WhatsApp group or Business catalogue?',
        p: ['For a group, copy the invite link (group info › Invite via link) and use a [URL code](/qr-code-generator/url). WhatsApp Business can also show its own short link and QR in its settings.'],
      },
    ],
    faqs: [
      { q: 'Does the message send automatically?', a: 'No, the customer taps Send.' },
      { q: 'Can I link to a WhatsApp group?', a: 'Yes, with the group’s invite link in a URL code.' },
    ],
  },
  {
    slug: 'phone-number',
    cat: 'contact',
    type: 'PHONE',
    title: 'Phone Number QR Code – Scan to Call, Free',
    description: 'Create a QR code that opens the dialler with your number ready to call. For vans, signs, flyers, posters and support. Free and works offline.',
    h1: 'QR code for a phone number (scan to call)',
    name: 'Phone call',
    answer: 'Enter the phone number with its country code below and download the code. Scanning shows a “Call” prompt with your number filled in, so nobody has to type it. The code is static, works offline and never expires; make sure the number will stay in use.',
    sections: [
      {
        h: 'Where it helps',
        list: ['Vans and trade signs (print large: 15 cm+).', 'Property boards and car windows.', 'Emergency and support contacts on equipment.', 'Flyers for local services.'],
      },
      {
        h: 'Related codes',
        p: ['To let people save your details rather than call once, use a [contact card QR code](/qr-code-for/contact-card). For messaging, use [WhatsApp](/qr-code-for/whatsapp) or [SMS](/qr-code-generator/sms).'],
      },
    ],
    faqs: [
      { q: 'Does scanning start the call automatically?', a: 'No, the phone asks first.' },
    ],
  },
  {
    slug: 'contact-card',
    cat: 'contact',
    type: 'VCARD',
    title: 'vCard QR Code – Save Contact Details in One Scan',
    description: 'Make a vCard QR code that saves your name, phone, email, company and address to the phone’s contacts. Free, offline, for business cards and badges.',
    h1: 'QR code to save contact details (vCard)',
    name: 'Contact card (vCard)',
    answer: 'Fill in your name, phone, email, company, job title, website and address below and download the vCard QR code. Scanning shows a contact card with an “Add to contacts” button, on iPhone and Android. The details are stored in the code itself, so it works offline; keep it short so the pattern stays easy to scan.',
    sections: [
      {
        h: 'vCard or digital business card?',
        list: [
          'vCard: static, offline, saves straight to contacts. Cannot be changed after printing.',
          '[Digital business card](/qr-code-generator/digital-business-card): a mobile page with photo, buttons and links, plus a save-contact button. Editable at any time and trackable.',
        ],
      },
      {
        h: 'Tips',
        list: [
          'Only include fields you want people to have; each field makes the code denser.',
          'Use international format for phone numbers.',
          'Print at least 2.5 cm on business cards; see [QR codes on business cards](/qr-code-for/business-cards).',
        ],
      },
    ],
    faqs: [
      { q: 'Can a vCard hold several phone numbers?', a: 'Yes, work and mobile, though more fields make a denser code.' },
      { q: 'Can I include a photo?', a: 'Not practically in a vCard code; use a digital business card for that.' },
    ],
  },
  {
    slug: 'wifi-password',
    cat: 'contact',
    type: 'WIFI',
    title: 'Wi-Fi QR Code Generator – Join Without a Password',
    description: 'Create a QR code guests scan to join your Wi-Fi without typing the password. Works on iPhone and Android, offline, free, no sign-up.',
    h1: 'QR code for Wi-Fi',
    name: 'Wi-Fi password',
    answer: 'Enter your network name (SSID), password and security type (usually WPA/WPA2) below, then download the code. Guests point their camera at it and tap “Join”, with no typing. The details stay in the code and the generator draws it in your browser, so your password is not sent to a server. If you change the password, make a new code.',
    sections: [
      {
        h: 'Where to display it',
        list: ['Café and restaurant tables (with the menu).', 'Hotel rooms and holiday lets.', 'Office reception and meeting rooms.', 'At home for guests: on the fridge or in a frame.'],
      },
      {
        h: 'Guides',
        p: ['Step-by-step, plus how to show Wi-Fi as a QR code on iPhone and Android: [how to make a Wi-Fi QR code](/guides/how-to-make-a-wifi-qr-code).'],
      },
    ],
    faqs: [
      { q: 'Does it work on iPhone?', a: 'Yes, iOS 11 and later join Wi-Fi from a QR code in the Camera app.' },
      { q: 'Is it safe?', a: 'Anyone who sees the code can join, so use a guest network and display it inside.' },
    ],
  },

  // ---------------------------------------------------------------- files
  {
    slug: 'pdf',
    cat: 'contact',
    type: 'PDF',
    title: 'PDF QR Code Generator – Upload a PDF, Get a QR Code',
    description: 'Upload a PDF and get a QR code that opens it on any phone: menus, manuals, brochures, price lists. Replace the file later without reprinting. Free.',
    h1: 'QR code for a PDF',
    name: 'PDF file',
    answer: 'Upload your PDF in the generator below and download the code. Scanning opens the document in a mobile viewer, with no app or sign-in. Because a PDF QR code is dynamic, you can replace the file (a new price list, an updated manual) and every printed code shows the new version.',
    sections: [
      {
        h: 'Uses',
        list: ['Menus and price lists.', 'Product manuals and safety data sheets.', 'Brochures and catalogues.', 'Event programmes and seating plans.', 'Certificates and reports.'],
      },
      {
        h: 'Tips',
        list: [
          'Compress large PDFs so they open quickly on mobile data.',
          'For a menu, a [mobile menu page](/qr-code-for/restaurant-menu) is easier to read than a PDF.',
          'Name the code clearly so you can find it in the dashboard later.',
        ],
      },
    ],
    faqs: [
      { q: 'Is there a file size limit?', a: 'Yes, the upload limit is shown in the generator; most documents fit easily.' },
      { q: 'Can the PDF be downloaded?', a: 'Yes, visitors can view and download it.' },
    ],
  },
  {
    slug: 'video',
    cat: 'contact',
    type: 'VIDEO',
    title: 'Video QR Code Generator – Upload or Link a Video',
    description: 'Make a QR code that plays a video: upload the file or link YouTube/Vimeo. For packaging, invitations, memorials and marketing. Free, editable.',
    h1: 'QR code for a video',
    name: 'Video',
    answer: 'Upload a video or paste a YouTube or Vimeo link in the generator below, then download the code. Scanning opens a mobile page that plays the video. The code is dynamic, so you can replace the video later, for instance with a newer product demo, without reprinting.',
    sections: [
      {
        h: 'Ideas',
        list: ['Setup and how-to videos on packaging.', 'Video messages in greeting cards and gifts.', 'Wedding films for thank-you cards.', 'Property tours on sign boards.', 'Memorial videos (see [memorial QR codes](/qr-code-for/memorials)).'],
      },
      {
        h: 'Upload or YouTube?',
        p: ['YouTube is best for public videos you also want found on YouTube. An uploaded video keeps people on a clean page without suggestions from other channels. See also the [YouTube QR code](/qr-code-for/youtube).'],
      },
    ],
    faqs: [
      { q: 'Can a QR code hold the video itself?', a: 'No, it links to it. [Why](/answers/can-a-qr-code-store-an-image).' },
    ],
  },
  {
    slug: 'photos',
    cat: 'contact',
    type: 'IMAGE_GALLERY',
    title: 'Photo QR Code – Share Pictures or a Gallery by QR',
    description: 'Upload photos and get a QR code that opens a mobile gallery: portfolios, products, events, property and memories. Free, editable, no app needed.',
    h1: 'QR code for photos and image galleries',
    name: 'Photos and galleries',
    answer: 'Upload one or more images in the generator below, add a title and description, and download the code. Scanning opens a fast mobile gallery that people can swipe through. You can add or replace photos later and the printed code stays the same.',
    sections: [
      {
        h: 'Ideas',
        list: ['Portfolios on business cards.', 'Product photos and colour options in shops.', 'Event and wedding photos.', 'Property photos on signs and flyers.', 'Before-and-after for salons and builders.'],
      },
      {
        h: 'Let guests upload photos?',
        p: ['A gallery code shows your photos. To collect guests’ pictures at a wedding or event, link a shared album (Google Photos, iCloud shared album) with a [URL code](/qr-code-generator/url). See [wedding QR code ideas](/guides/qr-code-wedding-ideas).'],
      },
    ],
    faqs: [
      { q: 'Can people download the photos?', a: 'They can save images from the page like any website.' },
    ],
  },
  {
    slug: 'audio',
    cat: 'contact',
    type: 'AUDIO',
    title: 'Audio QR Code – MP3, Voice Message or Audio Guide',
    description: 'Make a QR code that plays an MP3 or voice recording: audio guides, voice messages in gifts, podcasts and music demos. Free, replace the file anytime.',
    h1: 'QR code for audio (MP3)',
    name: 'Audio and MP3',
    answer: 'Upload an MP3 or other audio file in the generator below and download the code. Scanning opens a mobile player that plays the recording, with no app. Good for museum and tour audio guides, voice messages in cards and gifts, demo tracks and podcast episodes.',
    sections: [
      {
        h: 'Ideas',
        list: ['Museum and gallery audio guides (one code per exhibit).', 'Voice messages in greeting cards and wedding gifts.', 'Demo tracks on posters and merch.', 'Language-learning materials.'],
        p: ['For whole albums or several tracks, use a [playlist code](/qr-code-generator/playlist); for Spotify, the [Spotify QR code](/qr-code-for/spotify).'],
      },
    ],
    faqs: [
      { q: 'Which audio formats work?', a: 'MP3 works everywhere; the generator shows accepted formats when you upload.' },
    ],
  },
  {
    slug: 'app-download',
    cat: 'contact',
    type: 'APP_STORE',
    title: 'App Download QR Code – App Store and Google Play in One',
    description: 'One QR code that sends iPhone users to the App Store and Android users to Google Play. For packaging, posters, receipts and in-store signs. Free.',
    h1: 'QR code to download an app (App Store and Google Play)',
    name: 'App download',
    answer: 'Paste your App Store and Google Play links in the generator below. The QR code detects the phone: iPhones open the App Store, Android phones open Google Play, and computers and other devices go to a fallback link you choose, such as your website. Print one code instead of two badges, and track installs from print with scan analytics.',
    sections: [
      {
        h: 'Where to use it',
        list: ['Shop counters and receipts: “Order faster in our app”.', 'Packaging and instruction leaflets for connected devices.', 'Posters and event screens.', 'Restaurant tables for ordering apps.'],
      },
      {
        h: 'Get your store links',
        list: ['App Store: open your app page in the App Store › Share › Copy link.', 'Google Play: open the listing in Play Store › Share › copy, or use the play.google.com address.'],
        p: ['For other device-based routing, see the [smart link generator](/qr-code-generator/smart-link).'],
      },
    ],
    faqs: [
      { q: 'What happens on a computer?', a: 'It opens the fallback link you set, such as your website.' },
    ],
  },
  {
    slug: 'paypal',
    cat: 'contact',
    type: 'URL',
    title: 'PayPal QR Code – Get Paid by Scan',
    description: 'Make a QR code that opens your PayPal.Me link so people can pay you: for markets, tips, donations and invoices. Free, styled, printable.',
    h1: 'QR code for PayPal payments',
    name: 'PayPal',
    answer: 'Create your PayPal.Me link in your PayPal account (or use the QR code PayPal provides in its app), then paste the link, for example paypal.me/yourname, into the generator below. Scanning opens PayPal with you as the recipient. You can add an amount to the end of the link (paypal.me/yourname/10) for a fixed price.',
    sections: [
      {
        h: 'Uses',
        list: ['Market stalls and pop-ups.', 'Tips jars and buskers.', 'Invoices for freelancers.', 'Club fees and donations.'],
      },
      {
        h: 'Stay safe',
        p: ['Display payment codes where they cannot be covered by stickers, and check them regularly. Customers should confirm the name shown in PayPal before paying. See [QR code scams](/answers/qr-code-scams). For other payment methods and crypto, see [payments](/use-cases/payments).'],
      },
    ],
    faqs: [
      { q: 'Does PayPal have its own QR code?', a: 'Yes, PayPal’s app offers QR codes for receiving payments; this page makes a branded code for your PayPal.Me link.' },
    ],
  },
];
