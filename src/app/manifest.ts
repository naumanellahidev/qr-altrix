import type { MetadataRoute } from 'next';

/** Web app manifest: name, colours and icons for "Add to home screen" and app stores. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QR ALTRIX – Free QR Code Generator',
    short_name: 'QR ALTRIX',
    description:
      'Free QR code generator: static and dynamic QR codes with your logo, live scan analytics, bulk generation and an API.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#4F46E5',
    categories: ['business', 'productivity', 'utilities'],
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      { src: '/icon-maskable-512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
    ],
  };
}
