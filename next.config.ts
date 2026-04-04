import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent browsers from sniffing MIME types
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Disallow embedding in frames (clickjacking protection)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Enforce HTTPS for 1 year (production only)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Restrict referrer information
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features not needed by the app
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Allow inline styles (needed by Tiptap/GSAP) and self-hosted styles
      "style-src 'self' 'unsafe-inline'",
      // Scripts: self + inline scripts required by Next.js hydration
      "script-src 'self' 'unsafe-inline'",
      // Images: self + data URIs (used by Tiptap) + blob (video thumbnails)
      "img-src 'self' data: blob:",
      // Media: allow self-hosted uploads
      "media-src 'self' blob:",
      // Fonts: self only
      "font-src 'self'",
      // Connect: self (API calls)
      "connect-src 'self'",
      // Frames: none
      "frame-src 'none'",
      // Object: none
      "object-src 'none'",
      // Base URI: restrict to self
      "base-uri 'self'",
      // Form action: restrict to self
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig;
