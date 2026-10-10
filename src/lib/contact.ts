/**
 * How to reach the people who run QR ALTRIX (AltRix): one number for calls, SMS and
 * WhatsApp, and a mailbox that exists. Shown on the support pages, the footer and the
 * legal pages.
 */
export const SUPPORT_EMAIL = 'support@altrixcore.com';
export const SUPPORT_PHONE_DISPLAY = '+92 337 2606337';
export const SUPPORT_PHONE_E164 = '+923372606337';
export const SUPPORT_TEL = `tel:${SUPPORT_PHONE_E164}`;
export const SUPPORT_SMS = `sms:${SUPPORT_PHONE_E164}`;

export function supportWhatsApp(text?: string): string {
  const base = 'https://wa.me/923372606337';
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
