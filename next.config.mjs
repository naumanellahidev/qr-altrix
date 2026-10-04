/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  // Render <title>, description, canonical and Open Graph tags in <head> for every
  // visitor. By default Next streams them into <body> for user agents outside its bot
  // list — fine for Googlebot, but Bing's and AI crawlers' parsers, social card fetchers
  // and Lighthouse then see a page with no description.
  htmlLimitedBots: /.*/,
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ['sharp', 'pdfkit', 'bullmq', 'ioredis', '@prisma/client'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  experimental: {
    serverActions: { bodySizeLimit: '12mb' },
  },
  async rewrites() {
    return [
      // Custom-domain ownership proof, fetched over the customer's own host.
      {
        source: '/.well-known/qr-altrix-domain-verification',
        destination: '/api/domain-verification',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
