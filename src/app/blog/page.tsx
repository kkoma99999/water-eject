import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog/posts";
import { siteConfig, defaultOgImages } from "@/lib/seo/siteConfig";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles about phone speakers, water damage recovery, and troubleshooting muffled audio.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description:
      "Articles about phone speakers, water damage recovery, and troubleshooting muffled audio.",
    url: `${siteConfig.url}/blog`,
    images: defaultOgImages,
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Blog
        </h1>
        <p className="mt-3 text-muted">
          Practical, no-fluff guides on fixing wet speakers, muffled audio, and water damage.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted">No posts yet.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-xl border border-white/5 bg-surface p-5 transition hover:border-accent/40"
              >
                <article>
                  <h2 className="text-pretty text-xl font-semibold text-text">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-muted">{post.description}</p>
                  <p className="mt-3 text-xs text-muted">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span aria-hidden="true"> · </span>
                    <span>{post.readingMinutes} min read</span>
                  </p>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
