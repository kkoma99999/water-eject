import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildFaqSchema } from "@/lib/seo/schema";
import { siteConfig, defaultOgImages } from "@/lib/seo/siteConfig";

const FAQ_ITEMS = [
  {
    question: "Is it safe to use the water ejection tone on my phone speaker?",
    answer:
      "Yes. The tone uses frequencies and volumes that are well within the speaker's normal operating range — the same as playing bass-heavy music. The tool also ramps the volume up and down over 50 milliseconds at the start and end of each session to prevent audible clicks. The only situation to avoid: don't use it if water has reached the inside of your phone (i.e., internal components are still wet). In that case, power off and air-dry for 24 hours first.",
  },
  {
    question: "How long should I run the tone for?",
    answer:
      "Most water clears within 15 to 30 seconds. If the speaker still sounds muffled after one cycle, try the 60-second duration or the sweep mode, which varies the frequency to better match your speaker's natural resonance.",
  },
  {
    question: "Does this work on iPhone?",
    answer:
      "Yes. iPhones don't ship with a built-in water ejection feature like Apple Watch does, but the underlying physics works the same way on any speaker, including iPhone's bottom-firing driver. Hold the phone with the speaker pointing down, turn volume to max, and run the tone.",
  },
  {
    question: "Does this work on Android?",
    answer:
      "Yes — Samsung, Pixel, OnePlus, Xiaomi, and other Android phones all have speakers that respond to the same low-frequency tone. The tool runs in any modern browser; no app is needed.",
  },
  {
    question: "What frequency does it use, and why?",
    answer:
      "The default is 165 Hz, which is the same frequency Apple Watch uses for its Water Lock feature. Low frequencies cause the speaker cone to move with larger amplitude, which physically pushes water droplets out through the grille. The tool also offers 200 Hz (more aggressive) and a sweep mode that varies the frequency between 100 and 165 Hz to match different speaker resonances.",
  },
  {
    question: "Why does my speaker still sound muffled after running the tone?",
    answer:
      "A few possibilities: the water has dried and left mineral deposits on the cone (mostly an issue with hard tap water or pool water); lint or dust is clogging the grille; or the speaker hardware has been damaged by past water exposure. Try a soft-bristle toothbrush to clean the grille, and if it persists, a repair shop can diagnose hardware issues.",
  },
  {
    question: "Should I put my phone in rice?",
    answer:
      "No. Rice does not absorb water meaningfully through a sealed phone — it just gets dusty grains lodged in your charging port. Apple explicitly recommends against this. Air-drying in a cool, dry place is more effective.",
  },
  {
    question: "Can I use a hairdryer instead?",
    answer:
      "No. Heat can warp adhesives and damage internal components long before it dries water out from inside. Stick to the tone method and patience.",
  },
  {
    question: "Does this work on Bluetooth speakers, AirPods, or earbuds?",
    answer:
      "It works on most Bluetooth speakers and laptops — anywhere you can play audio through the wet speaker. It does NOT work on AirPods or earbuds whose drivers are sealed inside a small chamber: the cone can't move enough air to displace water in that configuration. For AirPods, Apple recommends tapping them against a soft cloth with the mesh facing down.",
  },
  {
    question: "Is this an app, and does it cost anything?",
    answer:
      "It runs entirely in your browser — no app, no signup, no payment. Just open the site, tap start, and wait.",
  },
];

export const metadata: Metadata = {
  title: "Water Eject FAQ",
  description:
    "Common questions about ejecting water from phone speakers — safety, frequency, iPhone vs Android, and what to do if the tone doesn't work.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Water Eject FAQ",
    description: "Common questions about ejecting water from phone speakers.",
    url: `${siteConfig.url}/faq`,
    images: defaultOgImages,
  },
};

export default function FaqPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={buildFaqSchema(FAQ_ITEMS)} />
      <header className="mb-10">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-3 text-muted">
          Quick answers to common questions about ejecting water from phone speakers.
        </p>
      </header>

      <dl className="flex flex-col gap-6">
        {FAQ_ITEMS.map((item) => (
          <div
            key={item.question}
            className="rounded-xl border border-white/5 bg-surface p-5"
          >
            <dt className="text-lg font-semibold text-text">{item.question}</dt>
            <dd className="mt-2 text-muted">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
