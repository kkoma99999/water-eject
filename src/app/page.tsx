import type { Metadata } from "next";
import Link from "next/link";
import { WaterEjector } from "@/components/audio/WaterEjector";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildHowToSchema } from "@/lib/seo/schema";
import { siteConfig, defaultOgImages } from "@/lib/seo/siteConfig";

const HOW_TO_STEPS = [
  {
    name: "Turn volume to maximum",
    text: "Crank your phone volume all the way up. A quiet tone won't move enough air to displace water droplets.",
  },
  {
    name: "Point the speaker down",
    text: "Hold your phone with the speaker grille facing the floor so gravity helps the water leave.",
  },
  {
    name: "Choose a frequency",
    text: "Start with 165 Hz (the same frequency Apple Watch uses for Water Lock). Try the sweep mode if water doesn't clear on the first try.",
  },
  {
    name: "Press start and wait",
    text: "Tap the big play button and let the tone run for 15 to 60 seconds. Water beads will form on the grille — wipe them away with a soft cloth.",
  },
  {
    name: "Test your audio",
    text: "Play music or make a call. If sound is still muffled, repeat with a longer duration or the sweep preset.",
  },
];

export const metadata: Metadata = {
  title: {
    absolute: "Water Eject — Remove Water From Your Phone Speaker (Free Tool)",
  },
  description: siteConfig.defaultDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Water Eject — Remove Water From Your Phone Speaker",
    description: siteConfig.defaultDescription,
    url: siteConfig.url,
    images: defaultOgImages,
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildHowToSchema(HOW_TO_STEPS)} />
      <WaterEjector />

      <section className="mx-auto max-w-3xl px-4 pb-12 pt-4">
        <div className="rounded-2xl border border-white/5 bg-surface p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Phone got wet? Blow it out in 30 seconds 💨
          </h2>
          <p className="mt-3 text-muted">
            Skip the rice, skip the hairdryer. This free tool plays the same kind of low-frequency
            tone that Apple Watch uses for its Water Lock feature — it vibrates the speaker cone
            hard enough to push water droplets out through the grille. Works on iPhone, Samsung,
            Pixel, tablets, laptops, and most Bluetooth speakers.
          </p>

          <h3 className="mt-8 text-lg font-semibold">How it works</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
            {HOW_TO_STEPS.map((s) => (
              <li key={s.name}>
                <strong className="text-text">{s.name}.</strong> {s.text}
              </li>
            ))}
          </ol>

          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            <Link
              href="/how-it-works"
              className="rounded-lg border border-white/10 px-4 py-3 hover:border-accent/40"
            >
              <span className="block font-medium text-text">Read: the science behind it</span>
              <span className="text-muted">Why 165 Hz works and what it doesn&apos;t fix.</span>
            </Link>
            <Link
              href="/faq"
              className="rounded-lg border border-white/10 px-4 py-3 hover:border-accent/40"
            >
              <span className="block font-medium text-text">FAQ</span>
              <span className="text-muted">Is it safe? Will it damage my speaker?</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
