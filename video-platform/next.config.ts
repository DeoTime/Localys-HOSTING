import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';

    const csp = [
      "default-src 'self'",
      // unsafe-inline required for Next.js 16 inline hydration scripts
      "script-src 'self' 'unsafe-inline' js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: *.supabase.co *.cloudfront.net img.icons8.com via.placeholder.com",
      "connect-src 'self' *.supabase.co wss://*.supabase.co api.stripe.com challenges.cloudflare.com *.tile.openstreetmap.org",
      "frame-src js.stripe.com *.stripe.com challenges.cloudflare.com",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    const headers = [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
    ];

    if (!isDev) {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      });
    }

    return [{ source: '/(.*)', headers }];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      // UberEats CDN hosts for hotlinked store/menu-item images (onboarded stores)
      { protocol: 'https', hostname: 'tb-static.uber.com' },
      { protocol: 'https', hostname: 'd1ralsognjng37.cloudfront.net' },
      { protocol: 'https', hostname: 'cn-geo1.uber.com' },
      { protocol: 'https', hostname: '*.cloudfront.net' },
      { protocol: 'https', hostname: 'duyt4h9nfnj50.cloudfront.net' },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
