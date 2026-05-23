// Single source of truth for site-wide SEO metadata.
// NEXT_PUBLIC_SITE_URL is set once a real domain is attached in production;
// the localhost fallback keeps dev sane.

const RAW_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_URL = RAW_URL.replace(/\/$/, "");

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
