import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig, defaultOgImages } from "@/lib/seo/siteConfig";

export const metadata: Metadata = {
  title: "How Does Water Ejection Work?",
  description:
    "The science behind using a low-frequency tone to remove water from a phone speaker — what 165 Hz actually does, and why it's safe.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "How Does Water Ejection Work?",
    description:
      "The science behind using a low-frequency tone to remove water from a phone speaker.",
    url: `${siteConfig.url}/how-it-works`,
    images: defaultOgImages,
  },
};

export default function HowItWorksPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          How does water ejection work?
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted">
          A 165 Hz tone moves a speaker cone with enough amplitude to physically push water droplets out
          through the grille. Here&apos;s the physics — and why it&apos;s safe.
        </p>
      </header>

      <div className="prose-water">
        <h2>A speaker is a tiny piston</h2>
        <p>
          Every speaker — whether it&apos;s the bottom-firing driver on your iPhone, the earpiece you hold
          to your face, or a laptop&apos;s side-firing transducer — is built the same way: a paper or
          plastic cone glued to a voice coil that sits inside a magnetic field. When an alternating
          current passes through the coil, the cone moves back and forth. That motion compresses and
          rarefies the air in front of it, and your ear interprets those pressure changes as sound.
        </p>
        <p>
          The <strong>frequency</strong> of the tone determines how fast the cone moves. The{" "}
          <strong>amplitude</strong> (volume) determines how far it moves.
        </p>

        <h2>Why 165 Hz?</h2>
        <p>
          At low frequencies, the cone moves <em>slowly</em> but with <em>large</em> excursion — it
          travels a long way each cycle. At high frequencies, the cone moves fast but barely budges. To
          mechanically displace a droplet of water sitting in the speaker grille, you need amplitude,
          not speed. Low frequencies win.
        </p>
        <p>
          But you can&apos;t go arbitrarily low. Phone speakers are tiny, and their drivers can&apos;t
          reproduce frequencies below ~80&nbsp;Hz at meaningful volume. The sweet spot — loud enough to
          be effective, low enough for maximum cone travel — is around 150–200 Hz. Apple Watch&apos;s
          Water Lock uses about 165 Hz. We default to the same.
        </p>

        <h2>What the sweep mode does</h2>
        <p>
          Every speaker has a slightly different resonant frequency, where it moves more freely than at
          neighboring frequencies. A fixed tone misses that resonance if it&apos;s slightly off. The
          sweep mode varies the frequency between 100 and 165 Hz, guaranteeing that the speaker passes
          through its resonance at least twice per cycle. For stubborn water, sweep usually outperforms
          a fixed tone.
        </p>

        <h2>Is it safe for the speaker?</h2>
        <p>
          Yes, with one caveat. The tone is well within the speaker&apos;s normal operating range — the
          same frequencies and volumes you hit when playing bass-heavy music. The cone is designed to
          move this much. We also ramp the volume up and down over 50 milliseconds at the start and end
          of each session to avoid the audible &quot;click&quot; that comes from instantly switching a
          sine wave on or off.
        </p>
        <p>
          The caveat: <strong>don&apos;t use this if your phone is still actively wet inside.</strong>{" "}
          The tone only helps water that&apos;s sitting in the speaker grille. If the water has reached
          internal components, you need to power the phone off and let it air-dry for 24 hours first.
          Vibrating a wet circuit board doesn&apos;t help.
        </p>

        <h2>Why not just shake the phone?</h2>
        <p>
          You can, and it does help a bit. But a speaker driver can produce hundreds of vibration cycles
          per second at exactly the angle the water needs to leave — far more efficient than any
          shaking you can do by hand. Combining both is fine: run the tone, point the speaker down, and
          gently tap the back of the phone against your palm.
        </p>

        <h2>What this won&apos;t fix</h2>
        <ul>
          <li>
            <strong>Mineral deposits on the cone.</strong> If hard water dried inside the speaker, the
            cone is stiffened and a tone won&apos;t loosen it. Time to visit a repair shop.
          </li>
          <li>
            <strong>A corroded voice coil.</strong> Saltwater damage that&apos;s already set in.
          </li>
          <li>
            <strong>A phone that won&apos;t power on.</strong> That&apos;s a much bigger water-damage
            problem.
          </li>
          <li>
            <strong>Bluetooth headphones with sealed drivers.</strong> The tone needs to be played
            through <em>the wet speaker</em>, not a different one.
          </li>
        </ul>

        <p>
          For everything else: <Link href="/">try the tool</Link>.
        </p>
      </div>
    </article>
  );
}
