// Single source of truth for site-wide SEO metadata.
// NEXT_PUBLIC_SITE_URL is set once a real domain is attached in production;
// the localhost fallback keeps dev sane.

const RAW_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_URL = RAW_URL.replace(/\/$/, "");

if (process.env.NODE_ENV === "production") {
  // Fail-closed build guardrail. NEXT_PUBLIC_* values are inlined at BUILD time,
  // so a missing/loopback/non-https value here ships canonical/sitemap/robots/OG/
  // JSON-LD URLs that de-index the whole site. A hard build error is far safer
  // than shipping a non-indexable deploy. We reject every realistic misconfig
  // (unset, empty, invalid, http/non-https, and loopback hosts) with a message
  // that points at the cause — not a cryptic "Invalid URL" deep in the build.
  let reason = "";
  if (!process.env.NEXT_PUBLIC_SITE_URL || SITE_URL === "") {
    reason = "it is unset or empty";
  } else {
    let host = "";
    try {
      host = new URL(SITE_URL).hostname;
    } catch {
      reason = `it is not a valid URL ("${SITE_URL}")`;
    }
    if (!reason && !SITE_URL.startsWith("https://")) {
      reason = `it must use https (got "${SITE_URL}")`;
    }
    if (
      !reason &&
      (host === "localhost" ||
        host.endsWith(".localhost") ||
        host === "127.0.0.1" ||
        host === "0.0.0.0")
    ) {
      reason = `it points at a loopback host ("${host}")`;
    }
  }
  if (reason) {
    throw new Error(
      `[siteConfig] NEXT_PUBLIC_SITE_URL must be your production https domain ` +
        `(e.g. https://watereject.dev) for a production build — ${reason}. Every ` +
        `canonical/SEO URL derives from it, so a wrong value ships a non-indexable ` +
        `site. Set it in your host's build environment (Vercel → Settings → ` +
        `Environment Variables) or in .env.local for local production builds.`,
    );
  }
}

export const siteConfig = {
  name: "Water Eject",
  shortName: "Water Eject",
  url: SITE_URL,
  ogImagePath: "/opengraph-image",
  defaultTitle: "Water Eject — Remove Water From Your Phone Speaker",
  titleTemplate: "%s | Water Eject",
  defaultDescription:
    "Free online tool that plays a low-frequency tone to eject water from your phone speaker. Works on iPhone, Android, and most speakers. No app required.",
  keywords: [
    "remove water from phone speaker",
    "water eject",
    "fix water in iPhone speaker",
    "how does water ejection work",
    "phone speaker sounds muffled after water",
  ],
  author: "Water Eject",
  twitterHandle: "@watereject",
} as const;

export type SiteConfig = typeof siteConfig;

// Shared OG image array. Spread into every route's openGraph block because
// Next.js *replaces* the parent openGraph object when a child redefines it
// (it does not deep-merge), which silently drops the images.
export const defaultOgImages = [
  {
    url: siteConfig.ogImagePath,
    width: 1200,
    height: 630,
    alt: siteConfig.name,
  },
];
