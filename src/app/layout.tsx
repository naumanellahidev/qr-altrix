import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { LazyToaster } from '@/components/ui/lazy-toaster';
import { env } from '@/lib/env';

// Fonts are downloaded at build time and served from this domain (the Google Fonts
// stylesheet they replace was a render-blocking request to another host). They are
// preloaded with font-display: optional: used if they arrive within the first paint,
// otherwise that view keeps the fallback and the next one uses the cached font. That
// rules out the late swap that shifted the whole hero on phones without Arial.
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter', display: 'optional' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-jakarta', display: 'optional' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains', display: 'optional', preload: false });

function siteToken(value: string | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  return raw.match(/content="([^"]+)"/)?.[1] ?? raw;
}

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: 'QR ALTRIX – Free QR Code Generator',
    template: '%s · QR ALTRIX',
  },
  description:
    'Free QR code generator: static and dynamic QR codes with your logo and colours, live scan analytics, bulk generation, custom domains and an API.',
  keywords: [
    'QR code generator',
    'dynamic QR code',
    'QR analytics',
    'custom QR design',
    'free QR code',
    'self-hosted QR platform',
  ],
  applicationName: 'QR ALTRIX',
  // Search engine ownership tags, set in the server's .env (no rebuild needed — the
  // homepage renders per request). Each accepts the bare token or the whole <meta> tag.
  verification: {
    google: siteToken(process.env.GOOGLE_SITE_VERIFICATION),
    other: {
      ...(siteToken(process.env.BING_SITE_VERIFICATION) ? { 'msvalidate.01': siteToken(process.env.BING_SITE_VERIFICATION)! } : {}),
      ...(siteToken(process.env.YANDEX_SITE_VERIFICATION) ? { 'yandex-verification': siteToken(process.env.YANDEX_SITE_VERIFICATION)! } : {}),
    },
  },
  authors: [{ name: 'QR ALTRIX' }],
  openGraph: {
    type: 'website',
    siteName: 'QR ALTRIX',
    locale: 'en_US',
    title: 'QR ALTRIX – Free QR Code Generator',
    description: 'Free static and dynamic QR codes with your logo, live scan analytics, bulk generation and an API.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR ALTRIX – Free QR Code Generator',
    description: 'Free static and dynamic QR codes with your logo, live scan analytics, bulk generation and an API.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1120' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-background font-sans">
        <ThemeProvider>
          {children}
          <LazyToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
