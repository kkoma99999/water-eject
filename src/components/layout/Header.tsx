import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-bg/80 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-text"
          aria-label="Water Eject — Home"
        >
          <span className="text-xl leading-none" aria-hidden="true">🔊</span>
          {/* Hide the wordmark below 360px so the logo + 3 nav links never
              overflow the narrowest phones; the link's aria-label keeps the
              brand name available to screen readers. */}
          <span className="hidden min-[360px]:inline">Water Eject</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-1 text-sm">
            <li>
              <Link
                href="/how-it-works"
                className="inline-flex min-h-11 items-center rounded-md px-2.5 text-muted hover:text-text sm:px-3"
              >
                How it works
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="inline-flex min-h-11 items-center rounded-md px-2.5 text-muted hover:text-text sm:px-3"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="inline-flex min-h-11 items-center rounded-md px-2.5 text-muted hover:text-text sm:px-3"
              >
                Blog
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
