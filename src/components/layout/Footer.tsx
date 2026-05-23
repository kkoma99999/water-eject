import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 py-8 text-sm text-muted">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
        <p>© {new Date().getFullYear()} Water Eject</p>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-4">
            <li>
              <Link href="/how-it-works" className="hover:text-text">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-text">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-text">
                Blog
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
