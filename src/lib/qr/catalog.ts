/**
 * The QR type catalogue. Every builder form, the homepage type picker and the API
 * validation layer are generated from this one table, so a new QR type only has to be
 * described once.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'email'
  | 'tel'
  | 'number'
  | 'date'
  | 'datetime'
  | 'time'
  | 'select'
  | 'switch'
  | 'color'
  | 'file'
  | 'files'
  | 'repeater';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  accept?: string;
  max?: number;
  min?: number;
  /** Fields of each row when type === 'repeater'. */
  itemFields?: FieldDef[];
  /** Grouping label shown in the builder. */
  group?: string;
  defaultValue?: unknown;
}

export interface QrTypeDef {
  type: string;
  kind: 'STATIC' | 'DYNAMIC';
  label: string;
  tagline: string;
  description: string;
  /** lucide-react icon name rendered through the Icon helper. */
  icon: string;
  category: 'Popular' | 'Contact' | 'Marketing' | 'Media' | 'Business' | 'Advanced';
  /** Shown on the homepage type strip. */
  featured?: boolean;
  fields: FieldDef[];
  /** Marks types whose content is rendered by QR ALTRIX as a hosted landing page. */
  hosted?: boolean;
}

const SOCIAL_PLATFORMS = [
  'Website',
  'Instagram',
  'Facebook',
  'TikTok',
  'YouTube',
  'X',
  'LinkedIn',
  'WhatsApp',
  'Telegram',
  'Snapchat',
  'Pinterest',
  'Threads',
  'Spotify',
  'GitHub',
  'Behance',
  'Dribbble',
].map((p) => ({ value: p.toLowerCase(), label: p }));

export const QR_TYPES: QrTypeDef[] = [
  // ---------------------------------------------------------------- static ---
  {
    type: 'URL',
    kind: 'STATIC',
    label: 'Website',
    tagline: 'Open any link',
    description: 'Encode a web address directly in the code. Works forever, offline, with no tracking.',
    icon: 'Globe',
    category: 'Popular',
    featured: true,
    fields: [
      { name: 'url', label: 'Website address', type: 'url', placeholder: 'https://your-site.com', required: true, help: 'Include https:// so every phone opens it correctly.' },
    ],
  },
  {
    type: 'TEXT',
    kind: 'STATIC',
    label: 'Plain text',
    tagline: 'Show a message',
    description: 'Any text, shown instantly in the camera app — notes, serials, instructions.',
    icon: 'Type',
    category: 'Popular',
    featured: true,
    fields: [
      { name: 'text', label: 'Text', type: 'textarea', placeholder: 'Type the message you want people to see', required: true, max: 1200 },
    ],
  },
  {
    type: 'WIFI',
    kind: 'STATIC',
    label: 'Wi-Fi',
    tagline: 'One-tap network join',
    description: 'Guests join your network without typing a password.',
    icon: 'Wifi',
    category: 'Popular',
    featured: true,
    fields: [
      { name: 'ssid', label: 'Network name (SSID)', type: 'text', required: true, placeholder: 'Cafe-Guest' },
      {
        name: 'encryption',
        label: 'Security',
        type: 'select',
        defaultValue: 'WPA',
        options: [
          { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
          { value: 'WEP', label: 'WEP (legacy)' },
          { value: 'NONE', label: 'Open network' },
        ],
      },
      { name: 'password', label: 'Password', type: 'text', placeholder: 'Network password' },
      { name: 'hidden', label: 'Hidden network', type: 'switch', help: 'Enable only if the network name is not broadcast.' },
    ],
  },
  {
    type: 'VCARD',
    kind: 'STATIC',
    label: 'Contact card',
    tagline: 'Save to phonebook',
    description: 'A full vCard saved straight into the contacts app.',
    icon: 'Contact',
    category: 'Contact',
    featured: true,
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', required: true },
      { name: 'lastName', label: 'Last name', type: 'text' },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'jobTitle', label: 'Job title', type: 'text' },
      { name: 'phone', label: 'Mobile', type: 'tel' },
      { name: 'phoneWork', label: 'Work phone', type: 'tel' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'website', label: 'Website', type: 'url' },
      { name: 'street', label: 'Street', type: 'text', group: 'Address' },
      { name: 'city', label: 'City', type: 'text', group: 'Address' },
      { name: 'state', label: 'State / region', type: 'text', group: 'Address' },
      { name: 'zip', label: 'Postcode', type: 'text', group: 'Address' },
      { name: 'country', label: 'Country', type: 'text', group: 'Address' },
      { name: 'note', label: 'Note', type: 'textarea' },
    ],
  },
  {
    type: 'EMAIL',
    kind: 'STATIC',
    label: 'Email',
    tagline: 'Pre-filled message',
    description: 'Opens the mail app with recipient, subject and body already filled in.',
    icon: 'Mail',
    category: 'Contact',
    fields: [
      { name: 'to', label: 'To', type: 'email', required: true },
      { name: 'subject', label: 'Subject', type: 'text' },
      { name: 'body', label: 'Message', type: 'textarea' },
      { name: 'cc', label: 'CC', type: 'text' },
    ],
  },
  {
    type: 'WHATSAPP',
    kind: 'STATIC',
    label: 'WhatsApp',
    tagline: 'Start a chat',
    description: 'Opens a WhatsApp conversation with your number and an optional first message.',
    icon: 'MessageCircle',
    category: 'Contact',
    featured: true,
    fields: [
      { name: 'phone', label: 'Phone number with country code', type: 'tel', required: true, placeholder: '+92 300 0000000' },
      { name: 'message', label: 'First message', type: 'textarea', placeholder: 'Hi! I scanned your QR code…' },
    ],
  },
  {
    type: 'SMS',
    kind: 'STATIC',
    label: 'SMS',
    tagline: 'Pre-written text',
    description: 'Opens the messaging app with your number and message ready to send.',
    icon: 'MessageSquare',
    category: 'Contact',
    fields: [
      { name: 'phone', label: 'Phone number', type: 'tel', required: true },
      { name: 'message', label: 'Message', type: 'textarea' },
    ],
  },
  {
    type: 'PHONE',
    kind: 'STATIC',
    label: 'Phone call',
    tagline: 'Tap to call',
    description: 'Dials your number as soon as the code is scanned.',
    icon: 'Phone',
    category: 'Contact',
    fields: [{ name: 'phone', label: 'Phone number', type: 'tel', required: true, placeholder: '+92 300 0000000' }],
  },
  {
    type: 'LOCATION',
    kind: 'STATIC',
    label: 'Location',
    tagline: 'Open in maps',
    description: 'Drops a pin on your exact coordinates or searches an address.',
    icon: 'MapPin',
    category: 'Business',
    fields: [
      { name: 'latitude', label: 'Latitude', type: 'text', placeholder: '31.5204' },
      { name: 'longitude', label: 'Longitude', type: 'text', placeholder: '74.3587' },
      { name: 'label', label: 'Pin label', type: 'text' },
      { name: 'query', label: 'or search this address instead', type: 'text', placeholder: 'Mall Road, Lahore' },
    ],
  },
  {
    type: 'EVENT',
    kind: 'STATIC',
    label: 'Calendar event',
    tagline: 'Add to calendar',
    description: 'Saves an event with time, place and description into any calendar app.',
    icon: 'CalendarDays',
    category: 'Marketing',
    fields: [
      { name: 'title', label: 'Event name', type: 'text', required: true },
      { name: 'start', label: 'Starts', type: 'datetime', required: true },
      { name: 'end', label: 'Ends', type: 'datetime' },
      { name: 'allDay', label: 'All-day event', type: 'switch' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'url', label: 'More info link', type: 'url' },
    ],
  },
  {
    type: 'CALENDAR',
    kind: 'STATIC',
    label: 'Calendar invite',
    tagline: 'iCal invite',
    description: 'A standards-compliant iCal invite for meetings and appointments.',
    icon: 'CalendarPlus',
    category: 'Business',
    fields: [
      { name: 'title', label: 'Subject', type: 'text', required: true },
      { name: 'start', label: 'Starts', type: 'datetime', required: true },
      { name: 'end', label: 'Ends', type: 'datetime' },
      { name: 'location', label: 'Where', type: 'text' },
      { name: 'description', label: 'Agenda', type: 'textarea' },
    ],
  },
  {
    type: 'CRYPTO',
    kind: 'STATIC',
    label: 'Crypto payment',
    tagline: 'Receive crypto',
    description: 'A wallet address with optional amount, ready for any wallet app.',
    icon: 'Bitcoin',
    category: 'Advanced',
    fields: [
      {
        name: 'coin',
        label: 'Currency',
        type: 'select',
        defaultValue: 'bitcoin',
        options: [
          { value: 'bitcoin', label: 'Bitcoin (BTC)' },
          { value: 'ethereum', label: 'Ethereum (ETH)' },
          { value: 'litecoin', label: 'Litecoin (LTC)' },
          { value: 'dogecoin', label: 'Dogecoin (DOGE)' },
          { value: 'bitcoincash', label: 'Bitcoin Cash (BCH)' },
          { value: 'monero', label: 'Monero (XMR)' },
          { value: 'solana', label: 'Solana (SOL)' },
          { value: 'tron', label: 'Tron (TRX)' },
        ],
      },
      { name: 'address', label: 'Wallet address', type: 'text', required: true },
      { name: 'amount', label: 'Amount (optional)', type: 'text' },
      { name: 'label', label: 'Label', type: 'text' },
      { name: 'message', label: 'Message', type: 'text' },
    ],
  },

  // --------------------------------------------------------------- dynamic ---
  {
    type: 'WEBSITE',
    kind: 'DYNAMIC',
    label: 'Website redirect',
    tagline: 'Editable link + stats',
    description: 'The printed code never changes — swap the destination whenever you like and watch the scans.',
    icon: 'Link2',
    category: 'Popular',
    featured: true,
    fields: [
      { name: 'url', label: 'Destination URL', type: 'url', required: true, placeholder: 'https://your-site.com/landing' },
    ],
  },
  {
    type: 'PDF',
    kind: 'DYNAMIC',
    label: 'PDF',
    tagline: 'Menus, brochures, manuals',
    description: 'Upload a PDF and QR ALTRIX hosts a fast viewer with a download button.',
    icon: 'FileText',
    category: 'Popular',
    featured: true,
    hosted: true,
    fields: [
      { name: 'file', label: 'PDF file', type: 'file', accept: 'application/pdf', required: true },
      { name: 'title', label: 'Title', type: 'text', placeholder: 'Spring menu 2026' },
      { name: 'description', label: 'Short description', type: 'textarea' },
      { name: 'allowDownload', label: 'Allow download', type: 'switch', defaultValue: true },
      { name: 'directOpen', label: 'Skip the viewer and open the PDF directly', type: 'switch' },
    ],
  },
  {
    type: 'IMAGE_GALLERY',
    kind: 'DYNAMIC',
    label: 'Image gallery',
    tagline: 'Photo album',
    description: 'A clean, swipeable gallery for products, properties or event photos.',
    icon: 'Images',
    category: 'Media',
    featured: true,
    hosted: true,
    fields: [
      { name: 'title', label: 'Gallery title', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'images', label: 'Images', type: 'files', accept: 'image/*', required: true, max: 40 },
      { name: 'allowDownload', label: 'Let visitors download images', type: 'switch' },
    ],
  },
  {
    type: 'VCARD_PLUS',
    kind: 'DYNAMIC',
    label: 'vCard Plus',
    tagline: 'Digital business card',
    description: 'A hosted business card page with photo, buttons, socials and a save-to-contacts action.',
    icon: 'IdCard',
    category: 'Contact',
    featured: true,
    hosted: true,
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', required: true },
      { name: 'lastName', label: 'Last name', type: 'text' },
      { name: 'jobTitle', label: 'Job title', type: 'text' },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'photo', label: 'Profile photo', type: 'file', accept: 'image/*' },
      { name: 'coverColor', label: 'Accent colour', type: 'color', defaultValue: '#4F46E5' },
      { name: 'about', label: 'About', type: 'textarea' },
      { name: 'phone', label: 'Mobile', type: 'tel' },
      { name: 'phoneWork', label: 'Work phone', type: 'tel' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'website', label: 'Website', type: 'url' },
      { name: 'address', label: 'Address', type: 'text' },
      {
        name: 'socials',
        label: 'Social links',
        type: 'repeater',
        max: 16,
        itemFields: [
          { name: 'platform', label: 'Platform', type: 'select', options: SOCIAL_PLATFORMS },
          { name: 'url', label: 'Link', type: 'url' },
        ],
      },
    ],
  },
  {
    type: 'VIDEO',
    kind: 'DYNAMIC',
    label: 'Video',
    tagline: 'Hosted or embedded',
    description: 'Play a video from a link or an uploaded file on a distraction-free page.',
    icon: 'Video',
    category: 'Media',
    featured: true,
    hosted: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'videoUrl', label: 'Video link (YouTube, Vimeo, MP4…)', type: 'url' },
      { name: 'file', label: 'or upload a video', type: 'file', accept: 'video/*' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'autoplay', label: 'Autoplay (muted)', type: 'switch' },
    ],
  },
  {
    type: 'LINK_LIST',
    kind: 'DYNAMIC',
    label: 'List of links',
    tagline: 'Link-in-bio page',
    description: 'One code, many destinations — a branded page of buttons you can reorder any time.',
    icon: 'ListTree',
    category: 'Marketing',
    featured: true,
    hosted: true,
    fields: [
      { name: 'title', label: 'Page title', type: 'text', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'text' },
      { name: 'avatar', label: 'Logo or photo', type: 'file', accept: 'image/*' },
      { name: 'accentColor', label: 'Accent colour', type: 'color', defaultValue: '#4F46E5' },
      {
        name: 'links',
        label: 'Links',
        type: 'repeater',
        max: 50,
        required: true,
        itemFields: [
          { name: 'label', label: 'Button text', type: 'text' },
          { name: 'url', label: 'Link', type: 'url' },
          { name: 'description', label: 'Small print', type: 'text' },
        ],
      },
    ],
  },
  {
    type: 'SOCIAL',
    kind: 'DYNAMIC',
    label: 'Social media',
    tagline: 'All your profiles',
    description: 'A follow page that puts every social profile one tap away.',
    icon: 'Share2',
    category: 'Marketing',
    hosted: true,
    fields: [
      { name: 'title', label: 'Display name', type: 'text', required: true },
      { name: 'bio', label: 'Bio', type: 'textarea' },
      { name: 'avatar', label: 'Profile image', type: 'file', accept: 'image/*' },
      { name: 'accentColor', label: 'Accent colour', type: 'color', defaultValue: '#0EA5E9' },
      {
        name: 'profiles',
        label: 'Profiles',
        type: 'repeater',
        max: 20,
        required: true,
        itemFields: [
          { name: 'platform', label: 'Platform', type: 'select', options: SOCIAL_PLATFORMS },
          { name: 'url', label: 'Profile link', type: 'url' },
        ],
      },
    ],
  },
  {
    type: 'AUDIO',
    kind: 'DYNAMIC',
    label: 'MP3 / audio',
    tagline: 'Play a track',
    description: 'A player page for a song, voice note, audio guide or podcast episode.',
    icon: 'Music',
    category: 'Media',
    hosted: true,
    fields: [
      { name: 'title', label: 'Track title', type: 'text' },
      { name: 'artist', label: 'Artist / author', type: 'text' },
      { name: 'cover', label: 'Cover image', type: 'file', accept: 'image/*' },
      { name: 'file', label: 'Audio file', type: 'file', accept: 'audio/*' },
      { name: 'audioUrl', label: 'or audio link', type: 'url' },
      { name: 'allowDownload', label: 'Allow download', type: 'switch' },
    ],
  },
  {
    type: 'BUSINESS',
    kind: 'DYNAMIC',
    label: 'Business page',
    tagline: 'Mini website',
    description: 'Hours, address, phone, services and photos on a single hosted page.',
    icon: 'Building2',
    category: 'Business',
    featured: true,
    hosted: true,
    fields: [
      { name: 'name', label: 'Business name', type: 'text', required: true },
      { name: 'tagline', label: 'Tagline', type: 'text' },
      { name: 'logo', label: 'Logo', type: 'file', accept: 'image/*' },
      { name: 'cover', label: 'Cover image', type: 'file', accept: 'image/*' },
      { name: 'accentColor', label: 'Accent colour', type: 'color', defaultValue: '#0F766E' },
      { name: 'about', label: 'About', type: 'textarea' },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'whatsapp', label: 'WhatsApp', type: 'tel' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'website', label: 'Website', type: 'url' },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'mapsUrl', label: 'Map link', type: 'url' },
      {
        name: 'hours',
        label: 'Opening hours',
        type: 'repeater',
        max: 7,
        itemFields: [
          {
            name: 'day',
            label: 'Day',
            type: 'select',
            options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => ({ value: d, label: d })),
          },
          { name: 'open', label: 'Opens', type: 'time' },
          { name: 'close', label: 'Closes', type: 'time' },
          { name: 'closed', label: 'Closed', type: 'switch' },
        ],
      },
      {
        name: 'services',
        label: 'Services',
        type: 'repeater',
        max: 24,
        itemFields: [
          { name: 'name', label: 'Service', type: 'text' },
          { name: 'detail', label: 'Detail', type: 'text' },
          { name: 'price', label: 'Price', type: 'text' },
        ],
      },
    ],
  },
  {
    type: 'COUPON',
    kind: 'DYNAMIC',
    label: 'Coupon',
    tagline: 'Discount offer',
    description: 'A redeemable offer page with code, terms and an expiry you control.',
    icon: 'TicketPercent',
    category: 'Marketing',
    hosted: true,
    fields: [
      { name: 'headline', label: 'Offer headline', type: 'text', required: true, placeholder: '20% off your first order' },
      { name: 'code', label: 'Coupon code', type: 'text' },
      { name: 'business', label: 'Business name', type: 'text' },
      { name: 'logo', label: 'Logo', type: 'file', accept: 'image/*' },
      { name: 'accentColor', label: 'Accent colour', type: 'color', defaultValue: '#DB2777' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'terms', label: 'Terms and conditions', type: 'textarea' },
      { name: 'validUntil', label: 'Valid until', type: 'date', help: 'Only the offer text expires — the QR code itself keeps working.' },
      { name: 'buttonLabel', label: 'Button text', type: 'text', defaultValue: 'Redeem now' },
      { name: 'buttonUrl', label: 'Button link', type: 'url' },
    ],
  },
  {
    type: 'APP_STORE',
    kind: 'DYNAMIC',
    label: 'App store',
    tagline: 'Right store per device',
    description: 'iPhone users land in the App Store, Android users in Play — from one code.',
    icon: 'Smartphone',
    category: 'Business',
    hosted: true,
    fields: [
      { name: 'appName', label: 'App name', type: 'text', required: true },
      { name: 'icon', label: 'App icon', type: 'file', accept: 'image/*' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'iosUrl', label: 'App Store link', type: 'url' },
      { name: 'androidUrl', label: 'Google Play link', type: 'url' },
      { name: 'otherUrl', label: 'Fallback link (desktop / other)', type: 'url' },
      { name: 'autoRedirect', label: 'Redirect automatically by device', type: 'switch', defaultValue: true },
    ],
  },
  {
    type: 'LANDING_PAGE',
    kind: 'DYNAMIC',
    label: 'Landing page',
    tagline: 'Campaign page',
    description: 'A hosted page with headline, image, rich text and a call-to-action button.',
    icon: 'LayoutTemplate',
    category: 'Marketing',
    hosted: true,
    fields: [
      { name: 'headline', label: 'Headline', type: 'text', required: true },
      { name: 'subheadline', label: 'Subheadline', type: 'text' },
      { name: 'image', label: 'Hero image', type: 'file', accept: 'image/*' },
      { name: 'accentColor', label: 'Accent colour', type: 'color', defaultValue: '#4F46E5' },
      { name: 'body', label: 'Body text', type: 'textarea' },
      { name: 'buttonLabel', label: 'Button text', type: 'text' },
      { name: 'buttonUrl', label: 'Button link', type: 'url' },
      {
        name: 'highlights',
        label: 'Highlights',
        type: 'repeater',
        max: 8,
        itemFields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'text', label: 'Text', type: 'text' },
        ],
      },
    ],
  },
  {
    type: 'PRODUCT',
    kind: 'DYNAMIC',
    label: 'Product page',
    tagline: 'Specs and buy link',
    description: 'Product photos, price, specification table and a buy button.',
    icon: 'Package',
    category: 'Business',
    hosted: true,
    fields: [
      { name: 'name', label: 'Product name', type: 'text', required: true },
      { name: 'brand', label: 'Brand', type: 'text' },
      { name: 'price', label: 'Price', type: 'text' },
      { name: 'images', label: 'Product images', type: 'files', accept: 'image/*', max: 12 },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'buyUrl', label: 'Buy link', type: 'url' },
      { name: 'accentColor', label: 'Accent colour', type: 'color', defaultValue: '#1D4ED8' },
      {
        name: 'specs',
        label: 'Specifications',
        type: 'repeater',
        max: 30,
        itemFields: [
          { name: 'key', label: 'Label', type: 'text' },
          { name: 'value', label: 'Value', type: 'text' },
        ],
      },
    ],
  },
  {
    type: 'EVENT_PAGE',
    kind: 'DYNAMIC',
    label: 'Event page',
    tagline: 'Invite + add to calendar',
    description: 'Event details, map, agenda and an add-to-calendar button people actually use.',
    icon: 'CalendarCheck',
    category: 'Marketing',
    hosted: true,
    fields: [
      { name: 'title', label: 'Event name', type: 'text', required: true },
      { name: 'start', label: 'Starts', type: 'datetime', required: true },
      { name: 'end', label: 'Ends', type: 'datetime' },
      { name: 'venue', label: 'Venue', type: 'text' },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'mapsUrl', label: 'Map link', type: 'url' },
      { name: 'cover', label: 'Cover image', type: 'file', accept: 'image/*' },
      { name: 'accentColor', label: 'Accent colour', type: 'color', defaultValue: '#7C3AED' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'ticketUrl', label: 'Tickets / RSVP link', type: 'url' },
      {
        name: 'agenda',
        label: 'Agenda',
        type: 'repeater',
        max: 30,
        itemFields: [
          { name: 'time', label: 'Time', type: 'text' },
          { name: 'title', label: 'What happens', type: 'text' },
        ],
      },
    ],
  },
  {
    type: 'MENU',
    kind: 'DYNAMIC',
    label: 'Restaurant menu',
    tagline: 'Digital menu',
    description: 'Sections, dishes, prices and allergen notes — editable from your phone in seconds.',
    icon: 'UtensilsCrossed',
    category: 'Business',
    featured: true,
    hosted: true,
    fields: [
      { name: 'name', label: 'Restaurant name', type: 'text', required: true },
      { name: 'logo', label: 'Logo', type: 'file', accept: 'image/*' },
      { name: 'currency', label: 'Currency symbol', type: 'text', defaultValue: 'Rs' },
      { name: 'accentColor', label: 'Accent colour', type: 'color', defaultValue: '#B45309' },
      { name: 'note', label: 'Note shown at the top', type: 'textarea' },
      {
        name: 'sections',
        label: 'Menu sections',
        type: 'repeater',
        max: 30,
        required: true,
        itemFields: [
          { name: 'name', label: 'Section name', type: 'text' },
          { name: 'items', label: 'Items (one per line: Name | Price | Description)', type: 'textarea' },
        ],
      },
    ],
  },
  {
    type: 'FEEDBACK',
    kind: 'DYNAMIC',
    label: 'Feedback form',
    tagline: 'Collect reviews',
    description: 'A star rating and comment form, with an optional redirect to your public review page.',
    icon: 'Star',
    category: 'Business',
    hosted: true,
    fields: [
      { name: 'title', label: 'Question', type: 'text', required: true, defaultValue: 'How was your experience?' },
      { name: 'business', label: 'Business name', type: 'text' },
      { name: 'logo', label: 'Logo', type: 'file', accept: 'image/*' },
      { name: 'accentColor', label: 'Accent colour', type: 'color', defaultValue: '#F59E0B' },
      { name: 'askEmail', label: 'Ask for an email address', type: 'switch' },
      { name: 'thanksMessage', label: 'Thank-you message', type: 'textarea', defaultValue: 'Thank you — your feedback helps us improve.' },
      { name: 'positiveRedirectUrl', label: 'Send 4–5 star ratings to', type: 'url', help: 'For example your Google review page.' },
    ],
  },
  {
    type: 'PLAYLIST',
    kind: 'DYNAMIC',
    label: 'Playlist',
    tagline: 'Share a set',
    description: 'A list of tracks or videos with links to the platforms they live on.',
    icon: 'ListMusic',
    category: 'Media',
    hosted: true,
    fields: [
      { name: 'title', label: 'Playlist title', type: 'text', required: true },
      { name: 'cover', label: 'Cover image', type: 'file', accept: 'image/*' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'accentColor', label: 'Accent colour', type: 'color', defaultValue: '#9333EA' },
      {
        name: 'tracks',
        label: 'Tracks',
        type: 'repeater',
        max: 100,
        required: true,
        itemFields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'artist', label: 'Artist', type: 'text' },
          { name: 'url', label: 'Link', type: 'url' },
        ],
      },
    ],
  },
  {
    type: 'GS1',
    kind: 'DYNAMIC',
    label: '2D barcode / GS1',
    tagline: 'Product identity',
    description: 'A GS1 Digital Link code carrying GTIN, batch and expiry for retail and logistics.',
    icon: 'ScanBarcode',
    category: 'Advanced',
    fields: [
      { name: 'gtin', label: 'GTIN (01)', type: 'text', required: true, placeholder: '09506000134352' },
      { name: 'batch', label: 'Batch / lot (10)', type: 'text' },
      { name: 'serial', label: 'Serial (21)', type: 'text' },
      { name: 'expiry', label: 'Expiry (17)', type: 'date' },
      { name: 'url', label: 'Product information page', type: 'url', required: true },
    ],
  },
  {
    type: 'SMART_LINK',
    kind: 'DYNAMIC',
    label: 'Smart multi-link',
    tagline: 'Rules-based routing',
    description: 'One code that routes by country, language, device or time of day.',
    icon: 'Shuffle',
    category: 'Advanced',
    fields: [
      { name: 'url', label: 'Default destination', type: 'url', required: true, help: 'Used whenever no rule matches.' },
    ],
  },
];

export const QR_TYPE_MAP: Record<string, QrTypeDef> = Object.fromEntries(
  QR_TYPES.map((t) => [t.type, t]),
);

export function getTypeDef(type: string): QrTypeDef | undefined {
  return QR_TYPE_MAP[type];
}

export const STATIC_TYPES = QR_TYPES.filter((t) => t.kind === 'STATIC');
export const DYNAMIC_TYPES = QR_TYPES.filter((t) => t.kind === 'DYNAMIC');
export const FEATURED_TYPES = QR_TYPES.filter((t) => t.featured);

export const CATEGORIES: QrTypeDef['category'][] = [
  'Popular',
  'Contact',
  'Marketing',
  'Media',
  'Business',
  'Advanced',
];

/** Hosted dynamic types are rendered by QR ALTRIX rather than redirecting away. */
export function isHostedType(type: string): boolean {
  return Boolean(getTypeDef(type)?.hosted);
}
