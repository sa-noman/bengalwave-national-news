import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Next.js hydration and the cookieless analytics snippet still require
  // inline JavaScript. Tighten network and HTML-handler boundaries without
  // risking the existing public layout, theme initialization, or analytics.
  // A full nonce-based policy requires a separate controlled rollout.
  { key: "Content-Security-Policy", value: [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    process.env.VERCEL_ENV==="production"
      ? "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com https://www.google-analytics.com https://*.googletagmanager.com https://*.doubleclick.net"
      : "connect-src 'self' https: wss:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ") },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: "30mb" } },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/auth/recovery",
        headers: [
          {key: "Referrer-Policy", value: "no-referrer"},
          {key: "Cache-Control", value: "no-store, max-age=0"},
          {key: "X-Robots-Tag", value: "noindex, nofollow"},
        ],
      },
      {
        source: "/auth/confirm",
        headers: [
          {key: "Referrer-Policy", value: "no-referrer"},
          {key: "Cache-Control", value: "no-store, max-age=0"},
          {key: "X-Robots-Tag", value: "noindex, nofollow"},
        ],
      },
    ];
  },
};
export default nextConfig;
