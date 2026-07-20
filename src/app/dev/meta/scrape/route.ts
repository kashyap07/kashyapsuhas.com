// dev-only: pulls the head tags a page actually renders (title, description,
// canonical, og, json-ld) so the /dev/meta audit reports the truth instead of
// whatever the metadata exports look like in source

import { SITE_URL } from "@utils/site";

export type PageMeta = {
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  jsonLd: string[];
  error?: number;
};

// next escapes attribute values, undo the common entities for display
const decode = (s: string) =>
  s
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'");

// attribute order isn't guaranteed, try both
function metaContent(html: string, attr: string, value: string) {
  const m =
    html.match(new RegExp(`<meta[^>]*${attr}="${value}"[^>]*content="([^"]*)"`)) ??
    html.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${value}"`));
  return m?.[1] ? decode(m[1]) : null;
}

// json-ld scripts, reported as their @type (flattening @graph)
function jsonLdTypes(html: string): string[] {
  const types: string[] = [];
  for (const m of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs,
  )) {
    try {
      const parsed = JSON.parse(m[1]) as Record<string, unknown>;
      const nodes = parsed["@graph"] ?? parsed;
      for (const node of Array.isArray(nodes) ? nodes : [nodes]) {
        types.push(String((node as Record<string, unknown>)["@type"] ?? "?"));
      }
    } catch {
      types.push("invalid json");
    }
  }
  return types;
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(req.url);
  const page = url.searchParams.get("path") ?? "/";
  const res = await fetch(`${url.origin}${page}`);
  if (!res.ok) {
    return Response.json({ error: res.status } satisfies Partial<PageMeta>);
  }

  const html = await res.text();
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const canonical =
    html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/) ??
    html.match(/<link[^>]*href="([^"]*)"[^>]*rel="canonical"/);

  const meta: PageMeta = {
    title: title ? decode(title) : null,
    description: metaContent(html, "name", "description"),
    canonical: canonical?.[1]?.replace(SITE_URL, "") || null,
    ogTitle: metaContent(html, "property", "og:title"),
    ogDescription: metaContent(html, "property", "og:description"),
    // site-absolute urls point at prod, keep just the path
    ogImage: metaContent(html, "property", "og:image")?.replace(SITE_URL, "") ?? null,
    jsonLd: jsonLdTypes(html),
  };

  return Response.json(meta);
}
