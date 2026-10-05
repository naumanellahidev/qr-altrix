/**
 * Shape of the translated content for the public site. Every language file must satisfy
 * LocaleContent, so a missing translation is a type error, not a blank on the page.
 * Things that are not words — slugs, related types, icons, dates — live in registry.ts.
 */

export interface Faq {
  q: string;
  a: string;
}

/** /qr-code-generator/<slug> — one per QR type. */
export interface TypePageCopy {
  /** <title>, about 60 characters before the brand suffix. */
  title: string;
  /** Meta description, 120-155 characters. */
  description: string;
  h1: string;
  intro: string;
  uses: string[];
  steps: string[];
  tips: string[];
  faqs: Faq[];
}

/** /use-cases/<slug> */
export interface UseCaseCopy {
  title: string;
  description: string;
  h1: string;
  /** Short name for cards and links. */
  name: string;
  intro: string;
  benefits: string[];
  steps: string[];
  faqs: Faq[];
}

/** /guides/<slug> */
export interface GuideCopy {
  title: string;
  description: string;
  h1: string;
  /** Short name for cards and links. */
  name: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
  faqs: Faq[];
}

/** /best-free-qr-code-generator */
export interface CompareCopy {
  title: string;
  description: string;
  h1: string;
  intro: string;
  checklistHeading: string;
  checklist: { point: string; why: string }[];
  tableHeading: string;
  tableColumns: [string, string, string];
  table: { feature: string; typical: string; ours: string }[];
  verdictHeading: string;
  verdict: string[];
  faqs: Faq[];
}

/** /tools/qr-code-scanner and /tools/bulk-qr-code-generator */
export interface ToolsCopy {
  scanner: {
    title: string;
    description: string;
    h1: string;
    intro: string;
    drop: string;
    choose: string;
    reading: string;
    found: string;
    notFound: string;
    openLink: string;
    copy: string;
    copied: string;
    privacy: string;
    faqs: Faq[];
  };
  bulk: {
    title: string;
    description: string;
    h1: string;
    intro: string;
    steps: string[];
    features: string[];
    cta: string;
    template: string;
    faqs: Faq[];
  };
}

/** Words shared by the page templates, header, footer and hubs. */
export interface UiCopy {
  nav: {
    features: string;
    types: string;
    useCases: string;
    guides: string;
    faq: string;
    api: string;
    login: string;
    startFree: string;
    dashboard: string;
    menu: string;
    closeMenu: string;
    language: string;
  };
  footer: {
    tagline: string;
    neverExpire: string;
    expiryShown: string;
    product: string;
    resources: string;
    platform: string;
    trust: string;
    createQr: string;
    allTypes: string;
    bulk: string;
    scanner: string;
    compare: string;
    developers: string;
    customDomains: string;
    analytics: string;
    templates: string;
    support: string;
    terms: string;
    privacy: string;
    report: string;
    copyright: string;
    trademark: string;
    credit: string;
  };
  common: {
    home: string;
    static: string;
    dynamic: string;
    free: string;
    createFree: string;
    openGenerator: string;
    faqHeading: string;
    related: string;
    readGuide: string;
    seeAll: string;
    updated: string;
    staticNote: string;
    dynamicNote: string;
  };
  typePage: {
    breadcrumb: string;
    usesHeading: string;
    stepsHeading: string;
    tipsHeading: string;
    whyHeading: string;
    why: string[];
    ctaHeading: string;
    ctaBody: string;
  };
  hubs: {
    typesTitle: string;
    typesDescription: string;
    typesH1: string;
    typesIntro: string;
    staticGroup: string;
    dynamicGroup: string;
    useCasesTitle: string;
    useCasesDescription: string;
    useCasesH1: string;
    useCasesIntro: string;
    guidesTitle: string;
    guidesDescription: string;
    guidesH1: string;
    guidesIntro: string;
    recommended: string;
  };
}

/** The homepage. Variants ending in "Expiry" are used when the operator has an expiry policy on. */
export interface HomeCopy {
  title: string;
  titleExpiry: string;
  description: string;
  descriptionExpiry: string;
  badge: string;
  badgeExpiry: string;
  eyebrow: string;
  h1: string;
  h1Accent: string;
  h1AccentExpiry: string;
  lead: string;
  leadTail: string;
  leadTailExpiry: string;
  stats: string;
  noCard: string;
  noCardExpiry: string;
  trust: { noExpiry: string; clearExpiry: string; privacy: string; domain: string; unlimited: string; api: string };
  featuresBadge: string;
  featuresTitle: string;
  featuresLead: string;
  /** Nine features, in the order of the icons in the view. */
  features: { title: string; body: string }[];
  useCasesTitle: string;
  useCasesLead: string;
  /** Six audiences, in the order of the icons in the view. */
  useCases: { title: string; body: string }[];
  /** "{count} QR code types" */
  typesTitle: string;
  typesLead: string;
  staticSubtitle: string;
  dynamicSubtitle: string;
  /** "{count} types" */
  typesCount: string;
  stepsTitle: string;
  steps: { title: string; body: string }[];
  openBuilder: string;
  faqTitle: string;
  faqLead: string;
  faqNeverExpire: Faq;
  faqExpiry: Faq;
  faqAccountGuest: Faq;
  faqAccountNoGuest: Faq;
  /** The remaining FAQ entries, after the expiry and account questions. */
  faqs: Faq[];
  ctaBadge: string;
  ctaTitle: string;
  ctaBody: string;
  ctaSignup: string;
  ctaApi: string;
}

/** Short names and taglines of the QR types, as shown in pickers and lists. */
export type CatalogCopy = Record<TypeKey, { label: string; tagline: string }>;

export type TypeKey =
  | 'URL' | 'TEXT' | 'WIFI' | 'VCARD' | 'EMAIL' | 'WHATSAPP' | 'SMS' | 'PHONE' | 'LOCATION' | 'EVENT'
  | 'CALENDAR' | 'CRYPTO' | 'WEBSITE' | 'PDF' | 'IMAGE_GALLERY' | 'VCARD_PLUS' | 'VIDEO' | 'LINK_LIST'
  | 'SOCIAL' | 'AUDIO' | 'BUSINESS' | 'COUPON' | 'APP_STORE' | 'LANDING_PAGE' | 'PRODUCT' | 'EVENT_PAGE'
  | 'MENU' | 'FEEDBACK' | 'PLAYLIST' | 'GS1' | 'SMART_LINK';

export type UseCaseSlug =
  | 'restaurant-menu' | 'business-card' | 'google-reviews' | 'events-and-weddings'
  | 'real-estate' | 'product-packaging' | 'social-media' | 'payments';

export type GuideSlug =
  | 'static-vs-dynamic-qr-codes' | 'qr-code-size-for-print' | 'qr-code-design-best-practices' | 'how-to-create-a-qr-code';

export interface LocaleContent {
  ui: UiCopy;
  home: HomeCopy;
  catalog: CatalogCopy;
  types: Record<TypeKey, TypePageCopy>;
  useCases: Record<UseCaseSlug, UseCaseCopy>;
  guides: Record<GuideSlug, GuideCopy>;
  compare: CompareCopy;
  tools: ToolsCopy;
}
