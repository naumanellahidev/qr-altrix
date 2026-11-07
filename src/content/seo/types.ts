import type { Faq, TypeKey } from '@/content/schema';

/**
 * English-only search content (answers, long guides, "QR code for …" pages).
 *
 * Paragraph text may contain inline links written as [words](/path); they are rendered
 * as internal links. Keep facts accurate: every claim must hold for QR codes in general
 * (ISO/IEC 18004) or describe what QR ALTRIX itself does.
 */
export interface SeoSection {
  h: string;
  p?: string[];
  /** Bulleted list shown after the paragraphs. */
  list?: string[];
  /** Numbered steps shown after the paragraphs. */
  steps?: string[];
}

export interface SeoDoc {
  slug: string;
  /** <title> text before the " · QR ALTRIX" suffix; aim for <= 60 characters. */
  title: string;
  /** Meta description, 120-160 characters. */
  description: string;
  h1: string;
  /** Short name used in link lists and breadcrumbs. */
  name: string;
  /** The direct answer (40-70 words) shown first: what answer engines quote. */
  answer: string;
  sections: SeoSection[];
  faqs: Faq[];
  /** QR type the page is about: opens the generator on it and links its type page. */
  type?: TypeKey;
  /** Group used for hubs and related links. */
  cat: string;
}

export type SeoKind = 'answers' | 'guides' | 'for';
