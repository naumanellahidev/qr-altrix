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

/**
 * Strings of the interactive generator (homepage and type pages). `{type}`, `{format}`,
 * `{count}` are placeholders. Catalogue field labels and preset names are not here: they
 * come from LocaleContent.phrases, keyed by their English text.
 */
export interface GeneratorCopy {
  makeTitle: string;
  makeLead: string;
  neverExpires: string;
  freeToUse: string;
  step1: string;
  step2: string;
  step3: string;
  dynamicAlertTitle: string;
  dynamicAlertBody: string;
  designTab: string;
  nameTab: string;
  nameLabel: string;
  nameHelp: string;
  /** "{type} code" */
  namePlaceholder: string;
  customiseTitle: string;
  customiseBody: string;
  livePreview: string;
  /** "Fill in the {type} details and your code appears here instantly." */
  previewPlaceholder: string;
  hintGuest: string;
  hintAccount: string;
  hintAccountExpiry: string;
  hintEmpty: string;
  formats: string;
  liveNever: string;
  liveExpiry: string;
  openDashboard: string;
  signupDescription: string;
  download: {
    button: string;
    saveLabel: string;
    google: string;
    googleSub: string;
    email: string;
    emailSub: string;
    guestLabel: string;
    png: string;
    svg: string;
    pdf: string;
    accountNote: string;
    /** "{format} downloaded" */
    downloaded: string;
    failed: string;
  };
  safety: {
    title: string;
    excellent: string;
    good: string;
    risky: string;
    fail: string;
    contrast: string;
    modules: string;
    noProblems: string;
  };
  form: {
    uploadReason: string;
    dropFile: string;
    needAccount: string;
    storedOnServer: string;
    anyFile: string;
    signupCarries: string;
    chooseFile: string;
    createAccount: string;
    removeFile: string;
    nothingYet: string;
    moveUp: string;
    moveDown: string;
    remove: string;
    add: string;
    choose: string;
    chooseOne: string;
  };
  picker: { label: string; search: string; static: string; dynamic: string };
  auth: {
    title: string;
    welcomeBack: string;
    ready: string;
    saved: string;
    freeForever: string;
    loginDescription: string;
    googleSignup: string;
    googleContinue: string;
    or: string;
    name: string;
    optional: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordHelp: string;
    passwordCreate: string;
    passwordYours: string;
    showPassword: string;
    hidePassword: string;
    code: string;
    agree: string;
    termsLink: string;
    and: string;
    privacyLink: string;
    signup: string;
    login: string;
    haveAccount: string;
    forgot: string;
    newHere: string;
    createAccount: string;
    errorCode: string;
    errorGeneric: string;
    errorNetwork: string;
  };
  design: {
    shape: string;
    colour: string;
    logo: string;
    frame: string;
    advanced: string;
    patternStyle: string;
    cornerFrame: string;
    cornerFrameHint: string;
    cornerCentre: string;
    brandKit: string;
    quickLooks: string;
    useColour: string;
    matchPattern: string;
    patternColour: string;
    background: string;
    gradient: string;
    gradientHint: string;
    from: string;
    to: string;
    type: string;
    linear: string;
    radial: string;
    angle: string;
    transparent: string;
    transparentHint: string;
    invert: string;
    invertHint: string;
    cornersSeparately: string;
    uploadLogo: string;
    logoFormats: string;
    builtInIcon: string;
    removeLogo: string;
    logoSize: string;
    logoSizeWarning: string;
    clearSpace: string;
    backingShape: string;
    none: string;
    circle: string;
    roundedSquare: string;
    square: string;
    wideBand: string;
    callToAction: string;
    callToActionHelp: string;
    frameColour: string;
    textColour: string;
    textPosition: string;
    below: string;
    above: string;
    quietZone: string;
    quietZoneHelp: string;
    errorCorrection: string;
    errorCorrectionHelp: string;
    ecL: string;
    ecM: string;
    ecQ: string;
    ecH: string;
    logoTooBig: string;
    logoWrongType: string;
    logoUnreadable: string;
    logoAdded: string;
  };
}

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
  generator: GeneratorCopy;
  /** English catalogue/preset phrase -> translation (see catalog-phrases.ts). Empty for English. */
  phrases: Record<string, string>;
  types: Record<TypeKey, TypePageCopy>;
  useCases: Record<UseCaseSlug, UseCaseCopy>;
  guides: Record<GuideSlug, GuideCopy>;
  compare: CompareCopy;
  tools: ToolsCopy;
}
