// JSON-LD builders. Each returns a plain object that gets stringified inside
// <script type="application/ld+json"> via the <JsonLd> component.
// Google's Rich Results Test validates these.

import { siteConfig } from "./siteConfig";

interface HowToStep {
  name: string;
  text: string;
}

export function buildHowToSchema(steps: HowToStep[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to eject water from a phone speaker",
    description:
      "Use a low-frequency tone to vibrate water out of your phone speaker. Works on iPhone and Android.",
    totalTime: "PT1M",
    supply: [],
    tool: [{ "@type": "HowToTool", name: "A phone with a wet speaker" }],
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

interface BlogPostingArgs {
  title: string;
  description: string;
  slug: string;
  date: string;
  cover?: string;
}

export function buildBlogPostingSchema({
  title,
  description,
  slug,
  date,
  cover,
}: BlogPostingArgs) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: date,
    dateModified: date,
    author: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${siteConfig.ogImagePath}`,
        width: 1200,
        height: 630,
      },
    },
    image: [cover ? `${siteConfig.url}${cover}` : `${siteConfig.url}${siteConfig.ogImagePath}`],
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${slug}`,
    },
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.defaultDescription,
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.ogImagePath}`,
  };
}
