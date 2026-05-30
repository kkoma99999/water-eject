import type { NextConfig } from "next";

// Content-Security-Policy for a fully static site. We intentionally do NOT use a
// nonce: a nonce-based strict CSP forces every route to render dynamically,
// defeating static generation. 'unsafe-inline' for script-src is required by
// Next's inline hydration bootstrap on static pages; the remaining directives
// (default-src, object-src, base-uri, frame-ancestors, form-action) still give
// real clickjacking/injection hardening. JSON-LD <script type="application/ld+json">
// is a non-executable data block and is not affected by script-src.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Baseline security headers applied to every route.
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't infer a parent directory when a
  // stray lockfile exists above the project (silences the multi-lockfile warning).
  turbopack: {
    root: import.meta.dirname,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
