# Water Eject

A free web tool that plays a low-frequency tone to vibrate water out of a phone
speaker — the same technique Apple Watch uses for Water Lock. No app, no signup,
runs entirely in the browser via the Web Audio API.

Deploy target: `https://watereject.dev` — set `NEXT_PUBLIC_SITE_URL` to your own
domain in Vercel's Environment Variables before the first deploy.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript, strict mode
- Tailwind CSS v4
- MDX blog via `next-mdx-remote` + `gray-matter`
- Web Audio API (no audio assets — tones are synthesised live)

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint flat config |

## Environment

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production only | Canonical site URL. Drives sitemap, robots, OG, and JSON-LD. Falls back to `http://localhost:3000` in dev. |

## Project layout

```
src/
  app/                     # App Router routes
    page.tsx               # Home (tool + intro)
    how-it-works/          # Science explainer
    faq/                   # FAQ + FAQPage JSON-LD
    blog/                  # Blog index + [slug] post pages
    sitemap.ts, robots.ts  # SEO infrastructure
    opengraph-image.tsx    # Dynamic OG image (1200x630)
  components/
    audio/                 # WaterEjector tool + hook
    layout/                # Header, Footer
    seo/                   # JsonLd renderer
  lib/
    audio/engine.ts        # Framework-agnostic Web Audio engine
    blog/posts.ts          # MDX frontmatter loader
    seo/                   # siteConfig + schema builders
content/
  blog/                    # MDX posts
.docker/
  Dockerfile               # Sandboxed Claude Code container
```

## Deployment

Deploy to Vercel (zero config — it auto-detects Next.js):

1. Push the repo to GitHub.
2. Import on https://vercel.com/new.
3. Set `NEXT_PUBLIC_SITE_URL` in Environment Variables to your production URL.
4. Deploy. First build takes ~90 s.
5. Add your custom domain under **Settings → Domains**.

## How the audio works

`src/lib/audio/engine.ts` constructs a single `AudioContext` lazily on first
user gesture (required by iOS Safari), then wires an `OscillatorNode` →
`GainNode` → `ctx.destination`. The oscillator runs at 165 Hz, 200 Hz, or a
165 ↔ 100 Hz sweep. Gain ramps over 50 ms at start and end to avoid clicks.
Loop mode (`durationSeconds = Infinity`) skips the end-ramp and uses a rolling
30-second sweep scheduler so the WebAudio event queue stays bounded.

## License

UNLICENSED — not yet decided. Do not redistribute without permission.
