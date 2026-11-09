import type { SeoSection } from '@/content/seo/types';

/**
 * Extra sections and FAQs for the "QR code for…" pages, merged in by index.ts. Each page
 * gets its own setup steps, placement advice and questions, so no two pages read alike.
 */
export interface ForExtra {
  sections: SeoSection[];
  faqs: { q: string; a: string }[];
}

export const FOR_EXTRA: Record<string, ForExtra> = {
  instagram: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Open your profile in a browser and copy the address, which looks like instagram.com/yourname.',
          'Paste it into the generator above and pick a design. Instagram’s gradient colours work if the dark parts stay dark.',
          'Make it dynamic if you might rename the account or want to send scans to a single post or reel later.',
          'Scan the download with two different phones before you print it.',
        ],
      },
      {
        h: 'Where it works best',
        p: [
          'Counters, shop windows, product inserts and event screens are good spots, because people are already holding their phone. Say what they get, for example “Follow us for new drops every Friday”, rather than only “Scan me”.',
        ],
      },
    ],
    faqs: [
      { q: 'Does the code open the Instagram app?', a: 'On most phones a profile link opens the app if it is installed, and the website if it is not.' },
      { q: 'Can I link to one post instead of my profile?', a: 'Yes. Copy the post link from Share > Copy link and use that address instead.' },
    ],
  },

  facebook: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Open your Facebook Page and copy its address from the browser, for example facebook.com/yourbusiness.',
          'Paste it above. For an event, a group or one post, copy that link instead.',
          'Choose dynamic if you may switch the destination between your Page, an event and an offer.',
          'Test the printed size from the distance people will stand.',
        ],
      },
      {
        h: 'Ideas that get scans',
        list: [
          'Receipts and table tents: “See today’s specials on our Page”.',
          'Event posters: link straight to the Facebook event so people can tap “Going”.',
          'Community notice boards: link to the group, not the general Page.',
        ],
      },
    ],
    faqs: [
      { q: 'Will people without Facebook see my Page?', a: 'Public Pages open in the browser for anyone. Private groups ask people to log in first.' },
      { q: 'Can I see how many people scanned it?', a: 'With a dynamic code you see scans by day, country and device in your dashboard.' },
    ],
  },

  youtube: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Copy your channel address (youtube.com/@yourhandle) or a single video link from Share.',
          'To start a video at a certain moment, use Share > Start at before copying the link.',
          'Paste it above and download. A dynamic code lets you point the same print at your newest video each month.',
          'Check that the video is public or unlisted; private videos will not play for scanners.',
        ],
      },
      {
        h: 'Good places for a YouTube code',
        p: [
          'Product boxes (setup video), manuals (repair steps), recipe cards, course handouts and conference slides. Tell people how long the video is: “2-minute setup video” gets more scans than a bare logo.',
        ],
      },
    ],
    faqs: [
      { q: 'Can the code open a playlist?', a: 'Yes. Open the playlist, copy its link and use that as the destination.' },
      { q: 'Does it play the video automatically?', a: 'It opens the video page; whether it starts playing depends on the phone and the YouTube app settings.' },
    ],
  },

  tiktok: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Copy your profile link, tiktok.com/@yourname, from the app’s Share profile option or the website.',
          'Paste it into the generator and choose a high-contrast design; black on white scans fastest.',
          'Use a dynamic code if you want the same print to point at a specific video during a campaign.',
          'Print it at least 3 cm wide on stickers and packaging so it reads at arm’s length.',
        ],
      },
      {
        h: 'Where to put it',
        p: [
          'Packaging, merch tags, market stalls and the end screen of other videos. A short promise works well: “Watch how it’s made” or “Follow for daily tips”.',
        ],
      },
    ],
    faqs: [
      { q: 'Is this the same as TikTok’s own QR code?', a: 'TikTok can show a code inside the app. A code from this generator links to the same profile but you choose the design, size and file format, and a dynamic one can be redirected later.' },
      { q: 'Will it work for people without TikTok?', a: 'Public profiles and videos open in the browser, although TikTok may prompt them to install the app.' },
    ],
  },

  linkedin: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Open your profile and copy the public URL, for example linkedin.com/in/yourname. For a company use linkedin.com/company/name.',
          'Paste it above and keep the design simple; a professional context suits dark grey or navy on white.',
          'Make it dynamic if you want to send scans to a job post or a portfolio later.',
          'Add a line next to it such as “Connect on LinkedIn”.',
        ],
      },
      {
        h: 'Where it helps',
        list: [
          'Business cards and name badges at conferences.',
          'The last slide of a talk.',
          'CVs and cover letters, linking to recommendations and experience.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I shorten my LinkedIn URL first?', a: 'You can set a custom public URL in LinkedIn’s profile settings. Shorter links make a simpler, easier-to-scan code.' },
      { q: 'Do people need to be logged in?', a: 'Profiles show a limited public view to visitors who are not logged in, depending on your visibility settings.' },
    ],
  },

  spotify: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'In Spotify, open the song, album, playlist or artist page and choose Share > Copy link.',
          'Paste the link above. It starts with open.spotify.com.',
          'Choose dynamic if you will swap the playlist each season or point at a new release.',
          'Download a vector file (SVG) if the code goes on a record sleeve or large poster.',
        ],
      },
      {
        h: 'Ideas',
        list: [
          'Shop and café walls: “What’s playing? Scan for our playlist”.',
          'Gig posters and merch: link to the artist page.',
          'Party and wedding invitations: a shared playlist guests can add to.',
        ],
      },
    ],
    faqs: [
      { q: 'Does it work without the Spotify app?', a: 'Yes. The link opens Spotify’s web player in the browser; the app opens instead if it is installed.' },
      { q: 'Can I use Apple Music or another service?', a: 'Yes, paste that service’s share link instead, or use a link list code with one button per service.' },
    ],
  },

  'social-media': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the social media type above and add each profile you want to show: Instagram, Facebook, TikTok, YouTube, LinkedIn and more.',
          'Add your name or logo so people know whose page they have opened.',
          'Save it as a dynamic code; you can add or remove networks later without reprinting.',
          'Scan it once to check every button opens the right profile.',
        ],
      },
      {
        h: 'Why one code beats several',
        p: [
          'Four small codes side by side confuse people and phones. One code that opens a page with all your profiles is easier to scan, takes less space and lets the visitor choose the network they already use.',
        ],
      },
    ],
    faqs: [
      { q: 'How many profiles can I add?', a: 'As many as you like; most people keep it to the three or four they post on regularly.' },
      { q: 'Can I see which network people tap?', a: 'The dashboard shows scans of the code. To compare networks, add UTM tags to each profile link where the platform supports it.' },
    ],
  },

  'link-in-bio': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Pick the link list type above and add a title, a short line about you and your photo or logo.',
          'Add one button per link: shop, booking, latest video, newsletter, contact.',
          'Put the most important link first; most people tap the top button.',
          'Use the page address in your social bios and the QR code on print.',
        ],
      },
      {
        h: 'Keep it useful',
        p: [
          'Five to seven links is plenty. Rename buttons by what people get (“Book a table”, “Shop the new range”) instead of the site name, and remove old campaigns so the page stays current.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I change the links later?', a: 'Yes. Edit the page in your dashboard and the same QR code and address show the new links.' },
      { q: 'Is it the same as Linktree?', a: 'It does the same job: one page with several links, reached from one QR code or bio link.' },
    ],
  },

  'google-reviews': {
    sections: [
      {
        h: 'How to get your review link',
        steps: [
          'Sign in to your Google Business Profile (search your business name on Google while logged in).',
          'Choose “Ask for reviews” or “Get more reviews” and copy the short link it gives you.',
          'Paste that link above and make it a dynamic code so you can track scans.',
          'Scan it yourself: it should open the review box with the stars ready to tap.',
        ],
      },
      {
        h: 'Asking the right way',
        p: [
          'Google’s rules do not allow paying for reviews, offering discounts in return, or asking only happy customers. Ask everyone the same way, for example with a card at the till: “How did we do? Leave us a Google review”. [More review tips](/guides/how-to-get-more-google-reviews-with-qr-codes).',
        ],
      },
    ],
    faqs: [
      { q: 'Do customers need a Google account?', a: 'Yes, Google asks reviewers to sign in before posting a review.' },
      { q: 'Where should the code go?', a: 'Receipts, the till, table tents, takeaway bags and follow-up cards: anywhere a customer is still thinking about the visit.' },
    ],
  },

  'google-forms': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'In Google Forms, click Send, choose the link icon and copy the form link (you can tick “Shorten URL”).',
          'Paste it above and download the code.',
          'Check the form settings: if “Restrict to users in your organisation” is on, outside people cannot open it.',
          'Fill in the form once from your phone to make sure responses arrive.',
        ],
      },
      {
        h: 'Common uses',
        list: [
          'Event sign-up and feedback after a talk.',
          'Class quizzes and attendance in schools ([attendance](/qr-code-for/attendance)).',
          'Order forms and enquiry forms on flyers.',
        ],
      },
    ],
    faqs: [
      { q: 'If I edit the form, do I need a new code?', a: 'No. The form link stays the same when you change questions.' },
      { q: 'Can I stop responses after a date?', a: 'Turn off “Accepting responses” in the form, or pause a dynamic code in your dashboard.' },
    ],
  },

  'google-maps': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the location type above and search for the address, or drop a pin on the map.',
          'Check the pin sits on the entrance you want people to use, not the middle of the building.',
          'Download the code; it opens directions in the phone’s maps app.',
          'For a venue with several entrances, make separate codes for car park, main door and deliveries.',
        ],
      },
      {
        h: 'Where it helps',
        p: [
          'Invitations, event posters, delivery notes, hotel booking confirmations and “we have moved” signs. Print the address in words next to the code as well, for people who prefer to type it.',
        ],
      },
    ],
    faqs: [
      { q: 'Does it open Apple Maps on iPhone?', a: 'A location code opens the default maps app, or a browser map if none is set.' },
      { q: 'What if the venue changes?', a: 'Use a dynamic code so you can move the destination without reprinting.' },
    ],
  },

  'google-drive': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Right-click the file or folder in Google Drive and choose Share.',
          'Under General access, choose “Anyone with the link” and set the role to Viewer.',
          'Copy the link, paste it above and download the code.',
          'Open the link in a private browser window to check it works for people outside your account.',
        ],
      },
      {
        h: 'Keep it safe',
        p: [
          'Anyone who scans the code can open what it links to, so never share folders holding personal data this way. For handouts and brochures, a [PDF code](/qr-code-for/pdf) hosts the file on its own page instead.',
        ],
      },
    ],
    faqs: [
      { q: 'Why does it say “You need access”?', a: 'The file is still restricted. Change General access to “Anyone with the link”.' },
      { q: 'Can I replace the file later?', a: 'Upload a new version of the same file in Drive (Manage versions) and the link stays the same.' },
    ],
  },

  'zoom-meetings': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Schedule the meeting and copy the invite link from the meeting details.',
          'Check whether the link includes the passcode; the default invite link usually does.',
          'Paste it above. A dynamic code lets you reuse one printed code for a weekly class by changing the link each time.',
          'Join from your phone with the code before the meeting starts.',
        ],
      },
      {
        h: 'Where it helps',
        list: [
          'Slides and posters for hybrid events.',
          'Classroom doors and course handouts.',
          'Reception desks for remote interpreters or support.',
        ],
      },
    ],
    faqs: [
      { q: 'Does it work for Google Meet or Teams?', a: 'Yes. Paste that meeting link instead; any meeting link works.' },
      { q: 'Is it safe to print a meeting link?', a: 'Anyone with the code can try to join, so use a waiting room for public prints.' },
    ],
  },

  whatsapp: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the WhatsApp type above and enter the number with its country code.',
          'Write a first message, such as “Hi, I’d like to book a table”, so people only have to press send.',
          'Download the code and test it from a phone that has never chatted with you.',
          'Use a WhatsApp Business number for a shop, so you can set away messages and quick replies.',
        ],
      },
      {
        h: 'Where it works',
        p: [
          'Shop windows (“Message us to order”), delivery bags, property boards, business cards and service vans. Say what happens next: “Chat to order, we reply within an hour”.',
        ],
      },
    ],
    faqs: [
      { q: 'Does the person need my number saved?', a: 'No. The code opens a chat with your number directly.' },
      { q: 'Can I change the message later?', a: 'With a dynamic code, yes. A static code holds the message inside it.' },
    ],
  },

  'phone-number': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the phone type above and type the number with its country code, for example +44 20 7946 0000.',
          'Download the code. Scanning it opens the phone’s dialler with the number filled in.',
          'Test it on iPhone and Android: both ask the caller to confirm before ringing.',
        ],
      },
      {
        h: 'Where it is useful',
        list: [
          'Vans and shop signs: “Scan to call”.',
          'Lost-property and emergency contact labels.',
          'Service stickers on boilers and appliances, so the customer can call you back.',
        ],
      },
    ],
    faqs: [
      { q: 'Does it call automatically?', a: 'No. The phone shows the number and the caller taps call.' },
      { q: 'Should I print the number too?', a: 'Yes. Some people prefer to type it, and it shows whose number it is.' },
    ],
  },

  'contact-card': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the contact card type above and fill in name, phone, email, company and website.',
          'Leave out fields you do not want shared; everything you add goes into the code.',
          'Download the code. Scanning it offers to save you as a new contact.',
          'Keep the card short: fewer fields make a less dense code that scans faster.',
        ],
      },
      {
        h: 'Static or dynamic?',
        p: [
          'A static contact card holds your details inside the pattern, so it works offline but cannot change. If your phone or job might change, use a [digital business card](/qr-code-for/business-cards) instead: it opens a page you can edit any time.',
        ],
      },
    ],
    faqs: [
      { q: 'Does it work on iPhone?', a: 'Yes. The camera shows a prompt to add the contact.' },
      { q: 'Can I add a photo?', a: 'A photo makes the code too dense. A digital business card page can show one.' },
    ],
  },

  'wifi-password': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the Wi-Fi type above.',
          'Enter the network name (SSID) exactly as it appears, including capitals.',
          'Enter the password and pick the security type, which is usually WPA or WPA2.',
          'Scan it with your phone. It should offer to join the network.',
        ],
      },
      {
        h: 'Tips',
        list: [
          'Use a guest network so visitors never get access to your main devices.',
          'If you change the password, make a new code; the password is inside the pattern.',
          'Frame it near the entrance or on the table, with the network name printed below.',
        ],
      },
    ],
    faqs: [
      { q: 'Is it safe to show my Wi-Fi password this way?', a: 'Anyone who can see the code can join, so use it for a guest network. [Wi-Fi QR code guide](/guides/how-to-make-a-wifi-qr-code).' },
      { q: 'Does it work on iPhone and Android?', a: 'Yes. Both read Wi-Fi codes with the built-in camera.' },
    ],
  },

  pdf: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the PDF type above and upload the file.',
          'Add a title so people know what they have opened.',
          'Save it as a dynamic code. You can upload a corrected version later and the same print keeps working.',
          'Open it on a phone to check the text is readable without zooming too much.',
        ],
      },
      {
        h: 'Make the PDF phone-friendly',
        p: [
          'Most people will read it on a small screen. Keep the file under a few megabytes, use a single column, and put the key information on the first page. Brochures, price lists, manuals and menus all work well.',
        ],
      },
    ],
    faqs: [
      { q: 'Can people download the PDF?', a: 'Yes. They can read it in the browser and save it.' },
      { q: 'Can I replace the file after printing?', a: 'With a dynamic code, yes; the QR code stays the same.' },
    ],
  },

  video: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the video type above and upload a short MP4, or paste a YouTube or Vimeo link.',
          'Add a title and a line of description.',
          'Save it as a dynamic code so you can swap the video later.',
          'Play it on mobile data, not only Wi-Fi, to check it loads quickly.',
        ],
      },
      {
        h: 'Keep videos short',
        p: [
          'People scanning on the move watch 30 seconds to 2 minutes. Use video for product demos, assembly steps, a thank-you message on a gift or a walkthrough of a property.',
        ],
      },
    ],
    faqs: [
      { q: 'What video length works best?', a: 'Under two minutes for most uses; link to longer content from the page if needed.' },
      { q: 'Can I use a YouTube link instead of uploading?', a: 'Yes, see [QR code for YouTube](/qr-code-for/youtube).' },
    ],
  },

  photos: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the image gallery type above and upload your photos.',
          'Put the best one first; it is the first thing people see.',
          'Add a title, for example “Our wedding, 12 June”.',
          'Save it as dynamic so you can add more photos after the event.',
        ],
      },
      {
        h: 'Ideas',
        list: [
          'Thank-you cards after a wedding or party.',
          'Portfolio pages for photographers and makers.',
          'Before-and-after galleries for builders and salons.',
        ],
      },
    ],
    faqs: [
      { q: 'Can a QR code hold the photos itself?', a: 'No. It holds a link to the gallery page. [Why](/answers/can-a-qr-code-store-an-image).' },
      { q: 'Who can see the gallery?', a: 'Anyone with the code or link. Add a password to a dynamic code for private albums.' },
    ],
  },

  audio: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the audio type above and upload an MP3, or link to a podcast episode.',
          'Add a title and a short description.',
          'Save it as dynamic so you can replace the recording later.',
          'Listen to it through the phone speaker to check the volume.',
        ],
      },
      {
        h: 'Where audio helps',
        p: [
          'Audio guides in museums and on walking trails, voice messages in greeting cards, language practice sheets and podcast promos. Mention that headphones help, especially in quiet places.',
        ],
      },
    ],
    faqs: [
      { q: 'Does it work without an app?', a: 'Yes. The audio plays in the phone’s browser.' },
      { q: 'Can I add several tracks?', a: 'Make one code per stop or track, or use a [link list](/qr-code-for/link-in-bio) with several links.' },
    ],
  },

  'app-download': {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Choose the app store type above.',
          'Paste your App Store link and your Google Play link.',
          'Add a fallback web address for desktops and other devices.',
          'Scan the code with an iPhone and an Android phone to check each one opens the right store.',
        ],
      },
      {
        h: 'Where to promote the app',
        p: [
          'Receipts, counters, table tents, packaging and in-store screens. Say what the app gives people (“Order ahead and skip the queue”), not just “Download our app”.',
        ],
      },
    ],
    faqs: [
      { q: 'What happens on a laptop?', a: 'The code sends desktop visitors to the fallback link you set.' },
      { q: 'Can I see iPhone vs Android scans?', a: 'Yes, the dashboard breaks scans down by device and operating system.' },
    ],
  },

  paypal: {
    sections: [
      {
        h: 'How to set it up',
        steps: [
          'Create your PayPal.Me link in PayPal (paypal.me/yourname).',
          'Optionally add an amount at the end, for example paypal.me/yourname/10.',
          'Paste it above and download the code.',
          'Send yourself a small test payment from another account before printing.',
        ],
      },
      {
        h: 'Stay safe',
        p: [
          'Payment codes are a target for scams where someone sticks their own code over yours. Check your codes regularly, use tamper-evident stickers and print your PayPal name next to the code. [Avoid QR code scams](/answers/qr-code-scams).',
        ],
      },
    ],
    faqs: [
      { q: 'Does the payer need PayPal?', a: 'PayPal.Me works best with a PayPal account; some countries also allow card payments.' },
      { q: 'Can I change the amount later?', a: 'Use a dynamic code and change the link, or leave out the amount so the payer types it.' },
    ],
  },
};
