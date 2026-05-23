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

function parseFile(file: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const fm = data as PostFrontmatter;
  const slug = file.replace(/\.(mdx|md)$/, "");
  const rt = readingTime(content);
  return {
    slug,
    title: fm.title,
    description: fm.description,
    date: fm.date,
    tags: fm.tags,
    cover: fm.cover,
    readingMinutes: Math.max(1, Math.round(rt.minutes)),
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  return listMdxFiles()
    .map((f) => parseFile(f))
    .map(({ content: _content, ...meta }) => meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
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
