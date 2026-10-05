import type { FaqItem } from '@/lib/seo/faq';

/**
 * schema.org structured data. Everything stated here is visible on the site and true for
 * this install — no invented ratings or reviews, which search engines penalise.
 */
const CREATOR = { '@type': 'Person', name: 'Nauman Ellahi', url: 'https://naumanellahi.com' } as const;

export function organizationSchema(base: string) {
  return {
    '@type': 'Organization',
    '@id': `${base}/#organization`,
    name: 'QR ALTRIX',
    url: `${base}/`,
    logo: { '@type': 'ImageObject', url: `${base}/icon-512.png`, width: 512, height: 512 },
    founder: CREATOR,
    sameAs: ['https://github.com/naumanellahidev/qr-altrix'],
  };
}

export function websiteSchema(base: string) {
  return {
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    name: 'QR ALTRIX',
    alternateName: 'QR ALTRIX – Free QR Code Generator',
    url: `${base}/`,
    inLanguage: 'en',
    publisher: { '@id': `${base}/#organization` },
  };
}

export function applicationSchema(base: string, opts: { expiryEnabled: boolean }) {
  return {
    '@type': 'WebApplication',
    '@id': `${base}/#app`,
    name: 'QR ALTRIX',
    url: `${base}/`,
    description: opts.expiryEnabled
      ? 'Free QR code generator for static and dynamic QR codes with logos, frames, live scan analytics, bulk generation, custom domains and a REST API.'
      : 'Free QR code generator for static and dynamic QR codes that never expire, with logos, frames, live scan analytics, bulk generation, custom domains and a REST API.',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'QR code generator',
    operatingSystem: 'Any (runs in a web browser)',
    browserRequirements: 'Requires JavaScript and a modern web browser.',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    featureList: [
      'Static and dynamic QR codes',
      'Unlimited dynamic QR codes with editable destinations',
      opts.expiryEnabled ? 'Expiry dates shown on every code' : 'Dynamic QR codes that never expire',
      'Logos, colours, gradients, shapes and 30+ frames',
      'PNG, JPEG, WebP, SVG, PDF and EPS downloads',
      'Live scan analytics with CSV and XLSX export',
      'Bulk generation from CSV',
      'Free custom short-link domains',
      'Team roles',
      'REST API with webhooks',
    ],
    image: `${base}/opengraph-image`,
    creator: CREATOR,
    publisher: { '@id': `${base}/#organization` },
  };
}

export function faqSchema(base: string, items: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    '@id': `${base}/#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function breadcrumbSchema(
  base: string,
  trail: { name: string; path: string }[],
  homeName = 'Home',
  homePath = '/',
) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: homeName, path: homePath }, ...trail].map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.path === '/' ? `${base}/` : `${base}${crumb.path}`,
    })),
  };
}

export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
