import { getBlogPosts } from "../blog";

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
