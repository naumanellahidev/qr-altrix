import type { CatalogCopy } from '@/content/schema';
import { QR_TYPES } from '@/lib/qr/catalog';

/**
 * Catalogue strings that read the same in every language: brand and network names,
 * coin tickers, sample addresses and technical labels. A translation may still
 * override them; a missing one simply shows the English text.
 */
export const KEEP_PHRASES: readonly string[] = [
  'Behance', 'Dribbble', 'Facebook', 'GitHub', 'Instagram', 'LinkedIn', 'Pinterest', 'Snapchat', 'Spotify',
  'Telegram', 'Threads', 'TikTok', 'WhatsApp', 'X', 'YouTube',
  'Bitcoin (BTC)', 'Bitcoin Cash (BCH)', 'Dogecoin (DOGE)', 'Ethereum (ETH)', 'Litecoin (LTC)', 'Monero (XMR)',
  'Solana (SOL)', 'Tron (TRX)',
  'https://your-site.com', 'https://your-site.com/landing', 'Cafe-Guest', 'Mall Road, Lahore',
  'CC', 'PDF', 'SMS', 'vCard Plus', 'WPA / WPA2 / WPA3', 'GTIN (01)',
];

/** The type names and taglines of one language, read from its phrase dictionary. */
export function catalogFromPhrases(phrases: Record<string, string>): CatalogCopy {
  return Object.fromEntries(
    QR_TYPES.map((type) => [
      type.type,
      { label: phrases[type.label] ?? type.label, tagline: phrases[type.tagline] ?? type.tagline },
    ]),
  ) as CatalogCopy;
}
