// dev-only: resolves the og image a page actually emits by fetching its
// rendered html, so the gallery shows the truth (own card, inherited
// default, or nothing) instead of assumptions

import { SITE_URL } from "@utils/site";

// mirrors the fallback in the root layout's metadata
const DEFAULT_OG = "/kashyapcom-og.png";

export async function GET(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(req.url);
  const page = url.searchParams.get("path") ?? "/";
  const res = await fetch(`${url.origin}${page}`);
  if (!res.ok) {
    return Response.json({ image: null, isDefault: false, error: res.status });
  }

  const html = await res.text();
  const match =
    html.match(/property="og:image"[^>]*content="([^"]+)"/) ??
    html.match(/content="([^"]+)"[^>]*property="og:image"/);
  // site-absolute urls point at prod, serve the local copy instead
  const image = match?.[1].replace(SITE_URL, "") || null;

  return Response.json({ image, isDefault: image === DEFAULT_OG });
}
