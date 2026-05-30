import { describe, it, expect } from "vitest";
import { safeStringify } from "@/components/seo/JsonLd";

describe("safeStringify", () => {
  it("escapes angle brackets so JSON-LD cannot break out of <script>", () => {
    const out = safeStringify({ a: "<b>" });
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).toContain("\\u003c");
    expect(out).toContain("\\u003e");
  });

  it("neutralizes a literal closing script tag", () => {
    const out = safeStringify({ x: "</script><script>alert(1)</script>" });
    expect(out.toLowerCase()).not.toContain("</script>");
  });

  it("escapes the U+2028 and U+2029 line/paragraph separators", () => {
    const out = safeStringify({ s: "a b c" });
    expect(out).toContain("\\u2028");
    expect(out).toContain("\\u2029");
    expect(out).not.toContain(" ");
    expect(out).not.toContain(" ");
  });

  it("still produces valid, parseable JSON", () => {
    const data = { hello: "world", n: 42, nested: { ok: true, list: [1, 2] } };
    expect(JSON.parse(safeStringify(data))).toEqual(data);
  });
});
