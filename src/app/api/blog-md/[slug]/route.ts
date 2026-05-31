import { getBlogPosts } from "@db/blog";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, props: Props) {
  const { slug } = await props.params;
  const post = getBlogPosts().find((p) => p.slug === slug);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  // reconstruct frontmatter-style header + content for agents
  const { title, description, publishedDateTime, categories } = post.metadata;
  const header = [
    "---",
    `title: ${title}`,
    `description: ${description}`,
    `publishedDateTime: ${publishedDateTime}`,
    categories ? `categories: ${categories}` : null,
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  return new Response(header + post.content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
