import type { SeoDoc, SeoKind } from '@/content/seo/types';
import { ANSWERS } from '@/content/seo/answers';
import { ANSWERS_2 } from '@/content/seo/answers-2';
import { GUIDE_ARTICLES } from '@/content/seo/guides';
import { GUIDE_ARTICLES_2 } from '@/content/seo/guides-2';
import { FOR_PAGES } from '@/content/seo/for-pages';
import { FOR_PAGES_2 } from '@/content/seo/for-pages-2';
import { FOR_EXTRA } from '@/content/seo/for-extra';
import { FOR_EXTRA_2 } from '@/content/seo/for-extra-2';

/** Date the words of the English search content last changed (sitemap <lastmod>, Article dates). */
export const SEO_UPDATED = '2026-11-09';

const DOCS: Record<SeoKind, SeoDoc[]> = {
  answers: [...ANSWERS, ...ANSWERS_2],
  guides: [...GUIDE_ARTICLES, ...GUIDE_ARTICLES_2],
  for: [...FOR_PAGES, ...FOR_PAGES_2].map(withExtra),
};

/** Adds each "QR code for" page's own setup steps, placement advice and FAQs. */
function withExtra(doc: SeoDoc): SeoDoc {
  const extra = FOR_EXTRA[doc.slug] ?? FOR_EXTRA_2[doc.slug];
  return extra ? { ...doc, sections: [...doc.sections, ...extra.sections], faqs: [...doc.faqs, ...extra.faqs] } : doc;
}

export const SEO_KINDS: Record<SeoKind, { path: string; name: string; h1: string; title: string; description: string; intro: string }> = {
  answers: {
    path: '/answers',
    name: 'QR code answers',
    h1: 'QR code questions, answered',
    title: 'QR Code Questions & Answers – Quick, Clear Answers',
    description: 'Short, accurate answers to the questions people ask about QR codes: expiry, size, scanning, safety, colours, tracking, Canva, Word, Excel and more.',
    intro: 'Direct answers to the questions people search for most, each with the detail behind it and a link to the tool that solves it.',
  },
  guides: {
    path: '/guides',
    name: 'Guides',
    h1: 'QR code guides',
    title: 'QR Code Guides – How to Create, Design and Print QR Codes',
    description: 'Practical QR code guides: create, design, size and print QR codes that scan, plus step-by-step guides for menus, reviews, events, inventory and more.',
    intro: 'Step-by-step guides written from how QR codes actually work.',
  },
  for: {
    path: '/qr-code-for',
    name: 'QR code ideas',
    h1: 'Make a QR code for anything',
    title: 'QR Code for Instagram, Google Reviews, Menus & More – Free',
    description: 'Free QR codes for Instagram, YouTube, Google reviews, Google Forms, weddings, restaurants, real estate, inventory, attendance and 50+ other uses.',
    intro: 'Pick what the QR code is for. Each page opens the free generator on the right type and explains how to set it up, print it and get people to scan it.',
  },
};

export const SEO_CATS: Record<string, string> = {
  basics: 'QR code basics',
  scanning: 'Scanning QR codes',
  design: 'Size, colour and design',
  trouble: 'When a QR code does not work',
  safety: 'Safety and scams',
  dynamic: 'Dynamic codes, expiry and tracking',
  apps: 'Canva, Word, Excel and Google',
  making: 'Making a QR code for…',
  howto: 'Create and design',
  business: 'Business and marketing',
  industry: 'Industries',
  social: 'Social media and music',
  google: 'Google',
  events: 'Events and personal',
  print: 'Print and packaging',
  contact: 'Contact and messaging',
  ops: 'Operations',
};

/**
 * Some pages describe what this site does (dynamic codes that do not expire, downloads
 * without sign-up). If the operator changes those settings, the pages that say so are
 * withdrawn (404, out of the sitemap and llms.txt) so the site never advertises
 * something the install does not do.
 */
export interface SeoGate {
  expiryEnabled: boolean;
  guestDownload: boolean;
}

const EXPIRY_CLAIM = /never expire|(?:do|does|will) not expire|(?:don|doesn)['’]t expire|no expir|without expir|not tied to a paid plan/i;
const GUEST_CLAIM = /no sign-up|without (?:an )?account|without sign-up|no account/i;

export function docAllowed(doc: SeoDoc, gate?: SeoGate): boolean {
  if (!gate) return true;
  const text = JSON.stringify(doc);
  if (gate.expiryEnabled && EXPIRY_CLAIM.test(text)) return false;
  if (!gate.guestDownload && GUEST_CLAIM.test(text)) return false;
  return true;
}

/** Words of readable text on a doc (answer, sections, FAQs), links reduced to their words. */
export function docWords(doc: SeoDoc): number {
  const text = [doc.answer, ...doc.sections.flatMap((x) => [x.h, ...(x.p ?? []), ...(x.list ?? []), ...(x.steps ?? [])]), ...doc.faqs.flatMap((f) => [f.q, f.a])].join(' ');
  return text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').split(/\s+/).filter(Boolean).length;
}

/**
 * AdSense does not allow ads on screens with low-value content. Short pages (mostly the
 * "QR code for" pages, whose value is the embedded generator) are kept ad-free.
 */
export const MIN_AD_WORDS = 250;

export function seoDocs(kind: SeoKind, gate?: SeoGate): SeoDoc[] {
  return DOCS[kind].filter((doc) => docAllowed(doc, gate));
}

export function seoPath(kind: SeoKind, slug: string): string {
  return `${SEO_KINDS[kind].path}/${slug}`;
}

export function findSeoDoc(kind: SeoKind, slug: string, gate?: SeoGate): SeoDoc | undefined {
  const doc = DOCS[kind].find((d) => d.slug === slug);
  return doc && docAllowed(doc, gate) ? doc : undefined;
}

export function allSeoDocs(gate?: SeoGate): (SeoDoc & { kind: SeoKind })[] {
  return (Object.keys(DOCS) as SeoKind[]).flatMap((kind) => seoDocs(kind, gate).map((doc) => ({ ...doc, kind })));
}

/**
 * Up to 8 related pages: neighbours in the same group first (so every page is linked from
 * several others), then pages of other kinds about the same QR type.
 */
export function relatedDocs(kind: SeoKind, doc: SeoDoc, gate?: SeoGate): (SeoDoc & { kind: SeoKind })[] {
  const list = seoDocs(kind, gate);
  const same = list.filter((d) => d.cat === doc.cat && d.slug !== doc.slug);
  const at = list.filter((d) => d.cat === doc.cat).findIndex((d) => d.slug === doc.slug);
  const rotated = [...same.slice(at), ...same.slice(0, at)].slice(0, 4).map((d) => ({ ...d, kind }));
  const cross = allSeoDocs(gate).filter((d) => d.kind !== kind && doc.type && d.type === doc.type).slice(0, 2);
  const fill = allSeoDocs(gate).filter((d) => d.kind !== kind && d.cat === doc.cat && !cross.includes(d)).slice(0, 2);
  const seen = new Set<string>();
  return [...rotated, ...cross, ...fill]
    .filter((d) => {
      const key = `${d.kind}/${d.slug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}
