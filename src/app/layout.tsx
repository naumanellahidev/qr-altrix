import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { env } from '@/lib/env';

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: 'QR ALTRIX — free QR codes that never expire',
    template: '%s · QR ALTRIX',
  },
  description:
    'Create static and dynamic QR codes with a premium design editor, live scan analytics, custom domains and bulk generation. Dynamic codes stay permanent — no trials, no expiry.',
  keywords: [
    'QR code generator',
    'dynamic QR code',
    'QR analytics',
    'custom QR design',
    'free QR code',
    'self-hosted QR platform',
  ],
  applicationName: 'QR ALTRIX',
  authors: [{ name: 'QR ALTRIX' }],
  openGraph: {
    type: 'website',
    siteName: 'QR ALTRIX',
    title: 'QR ALTRIX — free QR codes that never expire',
    description:
      'Design beautiful QR codes, track every scan and edit the destination any time. Dynamic codes never expire.',
    url: env.appUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR ALTRIX — free QR codes that never expire',
    description: 'Premium QR code platform with analytics, custom domains and bulk generation.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="min-h-dvh bg-background font-sans">
        <ThemeProvider>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
