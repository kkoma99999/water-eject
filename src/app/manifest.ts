import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/siteConfig";

// Web app manifest — makes the tool installable ("Add to Home Screen") and
// gives Android/Chrome the name, theme color, and icons. Next serves this at
// /manifest.webmanifest and injects the <link rel="manifest"> automatically.
// Icons point at the generated /icon and /apple-icon routes.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
