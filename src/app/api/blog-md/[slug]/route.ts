import { getBlogPost, getBlogPostSource, getBlogPosts } from "@db/blog";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, props: Props) {
  const { slug } = await props.params;
  // getBlogPost excludes drafts, so unpublished slugs 404 here (same as before)
  if (!getBlogPost(slug)) {
    return new Response("Not found", { status: 404 });
  }

  // serve the actual .mdx source, byte-for-byte, so the header can't drift from
  // the real frontmatter (the old route hand-rebuilt a lossy header)
  const source = getBlogPostSource(slug);
  if (!source) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(source, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
