/**
 * How to reach the people who run QR ALTRIX (AltRix): one number for calls, SMS and
 * WhatsApp, and the qraltrix.co.uk mailboxes (all real, 1 GB each): support@ for
 * accounts, codes, privacy and legal; help@ for how-to questions; info@ for anything
 * else. Shown on the support pages, the footer, the legal pages and in every email.
 */
export const SUPPORT_EMAIL = 'support@qraltrix.co.uk';
export const HELP_EMAIL = 'help@qraltrix.co.uk';
export const INFO_EMAIL = 'info@qraltrix.co.uk';
export const SUPPORT_PHONE_DISPLAY = '+92 337 2606337';
export const SUPPORT_PHONE_E164 = '+923372606337';
export const SUPPORT_TEL = `tel:${SUPPORT_PHONE_E164}`;
export const SUPPORT_SMS = `sms:${SUPPORT_PHONE_E164}`;

export function supportWhatsApp(text?: string): string {
  const base = 'https://wa.me/923372606337';
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
