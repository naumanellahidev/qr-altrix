import type { GuideSlug, TypeKey, UseCaseSlug } from '@/content/schema';

/**
 * The language-independent half of the public content: URLs, which types a use case
 * recommends, and when each collection last changed (sitemap <lastmod>). Bump a date when
 * the words of that collection change in any language.
 */

/** /qr-code-generator/<slug> for each QR type. Slugs are the search phrase, kept in English. */
export const TYPE_SLUGS: Record<TypeKey, string> = {
  URL: 'url',
  TEXT: 'text',
  WIFI: 'wifi',
  VCARD: 'vcard',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  SMS: 'sms',
  PHONE: 'phone-call',
  LOCATION: 'location',
  EVENT: 'calendar-event',
  CALENDAR: 'calendar-invite',
  CRYPTO: 'crypto-payment',
  WEBSITE: 'dynamic-url',
  PDF: 'pdf',
  IMAGE_GALLERY: 'image-gallery',
  VCARD_PLUS: 'digital-business-card',
  VIDEO: 'video',
  LINK_LIST: 'link-in-bio',
  SOCIAL: 'social-media',
  AUDIO: 'mp3',
  BUSINESS: 'business-page',
  COUPON: 'coupon',
  APP_STORE: 'app-store',
  LANDING_PAGE: 'landing-page',
  PRODUCT: 'product-page',
  EVENT_PAGE: 'event-page',
  MENU: 'restaurant-menu',
  FEEDBACK: 'feedback-form',
  PLAYLIST: 'playlist',
  GS1: 'gs1-digital-link',
  SMART_LINK: 'smart-link',
};

export const TYPE_KEYS = Object.keys(TYPE_SLUGS) as TypeKey[];

export function typeKeyFromSlug(slug: string): TypeKey | null {
  return TYPE_KEYS.find((key) => TYPE_SLUGS[key] === slug) ?? null;
}

/** Other types worth linking from a type page. */
export const RELATED_TYPES: Record<TypeKey, TypeKey[]> = {
  URL: ['WEBSITE', 'LINK_LIST', 'SMART_LINK'],
  TEXT: ['URL', 'SMS', 'LANDING_PAGE'],
  WIFI: ['MENU', 'BUSINESS', 'FEEDBACK'],
  VCARD: ['VCARD_PLUS', 'EMAIL', 'PHONE'],
  EMAIL: ['VCARD', 'SMS', 'FEEDBACK'],
  WHATSAPP: ['SMS', 'PHONE', 'SOCIAL'],
  SMS: ['WHATSAPP', 'PHONE', 'EMAIL'],
  PHONE: ['WHATSAPP', 'VCARD', 'SMS'],
  LOCATION: ['BUSINESS', 'EVENT_PAGE', 'WEBSITE'],
  EVENT: ['EVENT_PAGE', 'CALENDAR', 'LOCATION'],
  CALENDAR: ['EVENT', 'EVENT_PAGE', 'EMAIL'],
  CRYPTO: ['URL', 'LANDING_PAGE', 'COUPON'],
  WEBSITE: ['URL', 'SMART_LINK', 'LANDING_PAGE'],
  PDF: ['MENU', 'IMAGE_GALLERY', 'PRODUCT'],
  IMAGE_GALLERY: ['VIDEO', 'PDF', 'SOCIAL'],
  VCARD_PLUS: ['VCARD', 'LINK_LIST', 'SOCIAL'],
  VIDEO: ['PLAYLIST', 'AUDIO', 'IMAGE_GALLERY'],
  LINK_LIST: ['SOCIAL', 'VCARD_PLUS', 'SMART_LINK'],
  SOCIAL: ['LINK_LIST', 'VCARD_PLUS', 'WHATSAPP'],
  AUDIO: ['PLAYLIST', 'VIDEO', 'LINK_LIST'],
  BUSINESS: ['MENU', 'FEEDBACK', 'LOCATION'],
  COUPON: ['PRODUCT', 'FEEDBACK', 'LANDING_PAGE'],
  APP_STORE: ['SMART_LINK', 'LANDING_PAGE', 'WEBSITE'],
  LANDING_PAGE: ['WEBSITE', 'BUSINESS', 'COUPON'],
  PRODUCT: ['GS1', 'COUPON', 'PDF'],
  EVENT_PAGE: ['EVENT', 'CALENDAR', 'LOCATION'],
  MENU: ['PDF', 'FEEDBACK', 'WIFI'],
  FEEDBACK: ['BUSINESS', 'COUPON', 'MENU'],
  PLAYLIST: ['AUDIO', 'VIDEO', 'LINK_LIST'],
  GS1: ['PRODUCT', 'SMART_LINK', 'PDF'],
  SMART_LINK: ['APP_STORE', 'WEBSITE', 'LINK_LIST'],
};

export const USE_CASES: { slug: UseCaseSlug; icon: string; types: TypeKey[] }[] = [
  { slug: 'restaurant-menu', icon: 'UtensilsCrossed', types: ['MENU', 'PDF', 'WIFI', 'FEEDBACK'] },
  { slug: 'business-card', icon: 'Contact', types: ['VCARD_PLUS', 'VCARD', 'LINK_LIST'] },
  { slug: 'google-reviews', icon: 'Star', types: ['WEBSITE', 'FEEDBACK', 'SMART_LINK'] },
  { slug: 'events-and-weddings', icon: 'CalendarCheck', types: ['EVENT_PAGE', 'EVENT', 'IMAGE_GALLERY', 'LOCATION'] },
  { slug: 'real-estate', icon: 'Building2', types: ['LANDING_PAGE', 'IMAGE_GALLERY', 'VIDEO', 'PHONE'] },
  { slug: 'product-packaging', icon: 'Package', types: ['PRODUCT', 'GS1', 'VIDEO', 'FEEDBACK'] },
  { slug: 'social-media', icon: 'Share2', types: ['SOCIAL', 'LINK_LIST', 'SMART_LINK'] },
  { slug: 'payments', icon: 'Bitcoin', types: ['CRYPTO', 'WEBSITE', 'COUPON'] },
];

export const GUIDES: { slug: GuideSlug; icon: string }[] = [
  { slug: 'how-to-create-a-qr-code', icon: 'Sparkles' },
  { slug: 'static-vs-dynamic-qr-codes', icon: 'Shuffle' },
  { slug: 'qr-code-size-for-print', icon: 'Layers' },
  { slug: 'qr-code-design-best-practices', icon: 'Palette' },
];

/** When each collection's words last changed (YYYY-MM-DD). */
export const CONTENT_UPDATED = {
  hubs: '2026-10-05',
  types: '2026-10-05',
  useCases: '2026-10-05',
  guides: '2026-10-05',
  compare: '2026-10-05',
  tools: '2026-10-05',
} as const;
