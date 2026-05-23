import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-text"
          aria-label="Water Eject — Home"
        >
          <span className="text-xl leading-none" aria-hidden="true">🔊</span>
          <span>Water Eject</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-1 text-sm">
            <li>
              <Link
                href="/how-it-works"
                className="rounded-md px-3 py-2 text-muted hover:text-text"
              >
                How it works
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="rounded-md px-3 py-2 text-muted hover:text-text"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="rounded-md px-3 py-2 text-muted hover:text-text"
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
