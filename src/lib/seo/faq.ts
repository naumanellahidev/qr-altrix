import type { HomeCopy } from '@/content/schema';
import { home as englishHome } from '@/content/locales/en/home';

/**
 * The homepage FAQ, in plain text. One source feeds both the visible questions and the
 * FAQPage structured data, which search engines require to match. Answers depend on the
 * operator's live settings so the page never states something this install does not do.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export function homeFaqs(
  opts: { expiryEnabled: boolean; guestStaticDownload: boolean },
  copy: HomeCopy = englishHome,
): FaqItem[] {
  const [free, staticVsDynamic, ...rest] = copy.faqs;
  return [
    opts.expiryEnabled ? copy.faqExpiry : copy.faqNeverExpire,
    free,
    staticVsDynamic,
    opts.guestStaticDownload ? copy.faqAccountGuest : copy.faqAccountNoGuest,
    ...rest,
  ];
}
