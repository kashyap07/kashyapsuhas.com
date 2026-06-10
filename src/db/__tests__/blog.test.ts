import fs from "fs";
import path from "path";

import { getBlogPosts } from "../blog";

const FIXTURE = path.join(
  process.cwd(),
  "content/blog",
  "__test-fixture__.mdx",
);

const frontmatter = (draft: boolean) =>
  `---\npublishedDateTime: 2026-01-01T00:00:00.000Z\ntitle: fixture\ndraft: ${draft}\n---\n`;

afterEach(() => {
  if (fs.existsSync(FIXTURE)) fs.unlinkSync(FIXTURE);
});

describe("drafts and publish gate", () => {
  it("excludes drafts by default, includes them on request", () => {
    // draft with a TODO placeholder: allowed while draft
    fs.writeFileSync(FIXTURE, frontmatter(true) + "hello <TODO fill>\n");
    expect(getBlogPosts().map((p) => p.slug)).not.toContain("__test-fixture__");
    expect(getBlogPosts({ includeDrafts: true }).map((p) => p.slug)).toContain(
      "__test-fixture__",
    );
  });

  it("throws when a published post still contains TODO/FIXME placeholders", () => {
    fs.writeFileSync(FIXTURE, frontmatter(false) + "hello <TODO fill>\n");
    expect(() => getBlogPosts()).toThrow(/placeholders/);
  });
});

describe("getBlogPosts", () => {
  it("should return all blog posts with valid metadata", () => {
    const posts = getBlogPosts();
    expect(posts.length).toBeGreaterThan(0);

    for (const post of posts) {
      expect(post.metadata.title).toBeTruthy();
      expect(post.metadata.publishedDateTime).toBeTruthy();
      expect(post.slug).toBeTruthy();
      expect(post.content).toBeTruthy();
    }
  });

  it("should sort posts by date descending", () => {
    const posts = getBlogPosts();
    for (let i = 1; i < posts.length; i++) {
      const prev = new Date(posts[i - 1].metadata.publishedDateTime).getTime();
      const curr = new Date(posts[i].metadata.publishedDateTime).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });
});
