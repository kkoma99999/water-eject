import { describe, it, expect } from "vitest";
import {
  buildHowToSchema,
  buildFaqSchema,
  buildBlogPostingSchema,
  buildWebsiteSchema,
  buildOrganizationSchema,
} from "@/lib/seo/schema";

describe("schema builders", () => {
  it("buildHowToSchema numbers steps starting at 1", () => {
    const s = buildHowToSchema([
      { name: "A", text: "do a" },
      { name: "B", text: "do b" },
    ]);
    expect(s["@type"]).toBe("HowTo");
    expect(s.step).toHaveLength(2);
    expect(s.step[0].position).toBe(1);
    expect(s.step[1].position).toBe(2);
    expect(s.step[1].name).toBe("B");
  });

  it("buildFaqSchema maps each item to a Question/Answer pair", () => {
    const s = buildFaqSchema([{ question: "Q?", answer: "A." }]);
    expect(s["@type"]).toBe("FAQPage");
    expect(s.mainEntity[0]["@type"]).toBe("Question");
    expect(s.mainEntity[0].acceptedAnswer.text).toBe("A.");
  });

  it("buildBlogPostingSchema sets headline, dates and canonical @id", () => {
    const s = buildBlogPostingSchema({
      title: "T",
      description: "D",
      slug: "my-slug",
      date: "2026-05-15",
    });
    expect(s["@type"]).toBe("BlogPosting");
    expect(s.headline).toBe("T");
    expect(s.datePublished).toBe("2026-05-15");
    expect(s.dateModified).toBe("2026-05-15");
    expect(s.mainEntityOfPage["@id"]).toContain("/blog/my-slug");
  });

  it("website and organization schemas declare the right @type", () => {
    expect(buildWebsiteSchema()["@type"]).toBe("WebSite");
    expect(buildOrganizationSchema()["@type"]).toBe("Organization");
  });
});
