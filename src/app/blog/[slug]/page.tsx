import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getPostBySlug } from "@/lib/blog/posts";
import { siteConfig, defaultOgImages } from "@/lib/seo/siteConfig";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogPostingSchema } from "@/lib/seo/schema";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `${siteConfig.url}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
      images: defaultOgImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [siteConfig.ogImagePath],
    },
  };
}

export default async function BlogPostPage({ params }: RouteParams) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        data={buildBlogPostingSchema({
          title: post.title,
          description: post.description,
          slug: post.slug,
          date: post.date,
          cover: post.cover,
        })}
      />
      <header className="mb-8">
        <p className="text-sm text-muted">
          <Link href="/blog" className="hover:text-text">
            ← Back to blog
          </Link>
        </p>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted">{post.description}</p>
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
      </header>

      <div className="prose-water">
        <MDXRemote source={post.content} />
      </div>
    </article>
  );
}
