import { describe, it, expect } from "vitest";
import { parsePost } from "@/lib/blog/posts";

const valid = `---
title: "Test Post"
description: "A test description"
date: "2026-05-15"
tags: ["a", "b"]
---

# Hello

Some body content with enough words to register a reading time.
`;

describe("parsePost", () => {
  it("parses valid frontmatter and derives the slug", () => {
    const post = parsePost(valid, "test-post.mdx");
    expect(post.slug).toBe("test-post");
    expect(post.title).toBe("Test Post");
    expect(post.description).toBe("A test description");
    expect(post.date).toBe("2026-05-15");
    expect(post.tags).toEqual(["a", "b"]);
    expect(post.readingMinutes).toBeGreaterThanOrEqual(1);
    expect(post.content).toContain("Hello");
  });

  it("strips both .md and .mdx extensions from the slug", () => {
    expect(parsePost(valid, "foo.md").slug).toBe("foo");
    expect(parsePost(valid, "bar.mdx").slug).toBe("bar");
  });

  it("normalizes an unquoted YAML date into an ISO string", () => {
    const raw = `---\ntitle: "t"\ndescription: "d"\ndate: 2026-01-02\n---\nbody`;
    expect(parsePost(raw, "unquoted.mdx").date).toBe("2026-01-02");
  });

  it("throws when title is missing", () => {
    const raw = `---\ndescription: "d"\ndate: "2026-05-15"\n---\nbody`;
    expect(() => parsePost(raw, "no-title.mdx")).toThrow(/title/);
  });

  it("throws when date is missing", () => {
    const raw = `---\ntitle: "t"\ndescription: "d"\n---\nbody`;
    expect(() => parsePost(raw, "no-date.mdx")).toThrow(/date/);
  });

  it("throws when date is unparseable (the sitemap RangeError this prevents)", () => {
    const raw = `---\ntitle: "t"\ndescription: "d"\ndate: "not-a-date"\n---\nbody`;
    expect(() => parsePost(raw, "bad-date.mdx")).toThrow(/parseable date/);
  });

  it("throws when tags is present but not an array", () => {
    const raw = `---\ntitle: "t"\ndescription: "d"\ndate: "2026-05-15"\ntags: "oops"\n---\nbody`;
    expect(() => parsePost(raw, "bad-tags.mdx")).toThrow(/tags/);
  });
});
