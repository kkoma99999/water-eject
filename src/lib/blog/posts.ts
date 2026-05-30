import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string; // ISO date
  tags?: string[];
  cover?: string;
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
  readingMinutes: number;
}

export interface Post extends PostMeta {
  content: string;
}

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

function ensurePostsDir(): void {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
}

function listMdxFiles(): string[] {
  ensurePostsDir();
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
}

// Pure, testable parser. Validates frontmatter and fails fast with a clear
// message: gray-matter returns `data` as `any`, and an unvalidated cast lets a
// post with a missing/invalid `date` flow into `new Date(post.date)` in
// sitemap.ts, where it becomes an Invalid Date and throws
// "RangeError: Invalid time value" at build — a cryptic failure far from the
// actual cause.
export function parsePost(raw: string, file: string): Post {
  const { data, content } = matter(raw);
  const fm = data as Record<string, unknown>;
  const slug = file.replace(/\.(mdx|md)$/, "");

  const title = fm.title;
  const description = fm.description;
  let date = fm.date;
  // Unquoted YAML dates (date: 2026-05-15) are auto-parsed into Date objects;
  // normalize to an ISO date string so the rest of the app can treat it as one.
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    date = date.toISOString().slice(0, 10);
  }

  const missing: string[] = [];
  if (typeof title !== "string" || title.trim() === "") missing.push("title");
  if (typeof description !== "string" || description.trim() === "")
    missing.push("description");
  if (typeof date !== "string" || date.trim() === "") missing.push("date");
  if (missing.length > 0) {
    throw new Error(
      `Invalid frontmatter in content/blog/${file}: missing or empty ${missing.join(", ")}.`,
    );
  }
  if (Number.isNaN(new Date(date as string).getTime())) {
    throw new Error(
      `Invalid frontmatter in content/blog/${file}: "date" is not a parseable date ` +
        `(got "${String(date)}"). Use an ISO date like 2026-05-15.`,
    );
  }

  const tags = fm.tags;
  if (tags !== undefined && !Array.isArray(tags)) {
    throw new Error(
      `Invalid frontmatter in content/blog/${file}: "tags" must be an array if present.`,
    );
  }
  const cover = fm.cover;
  if (cover !== undefined && typeof cover !== "string") {
    throw new Error(
      `Invalid frontmatter in content/blog/${file}: "cover" must be a string if present.`,
    );
  }

  const rt = readingTime(content);
  return {
    slug,
    title: title as string,
    description: description as string,
    date: date as string,
    tags: tags as string[] | undefined,
    cover: cover as string | undefined,
    readingMinutes: Math.max(1, Math.round(rt.minutes)),
    content,
  };
}

function parseFile(file: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  return parsePost(raw, file);
}

export function getAllPosts(): PostMeta[] {
  return listMdxFiles()
    .map((f) => parseFile(f))
    .map(({ content: _content, ...meta }) => meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post | null {
  const file = listMdxFiles().find(
    (f) => f.replace(/\.(mdx|md)$/, "") === slug,
  );
  if (!file) return null;
  return parseFile(file);
}

export function getAllSlugs(): string[] {
  return listMdxFiles().map((f) => f.replace(/\.(mdx|md)$/, ""));
}
