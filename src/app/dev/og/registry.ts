// registry for the dev-only og preview at /dev/og. static entries are keyed
// by their live url path; dynamic sections enumerate slugs from the db.
// a new goodie's og image is one line in STATIC_OG.

import { readdirSync } from "node:fs";
import path from "node:path";

import { getBlogPosts } from "@db/blog";
import { getReviews } from "@db/reviews";

type OgModule = {
  default: (props: {
    params: Promise<{ slug: string }>;
  }) => Response | Promise<Response>;
};

export const STATIC_OG: Record<string, () => Promise<OgModule>> = {
  "goodies/dreamify": () =>
    import("../../(withNav)/goodies/dreamify/opengraph-image"),
  "goodies/panchanga": () =>
    import("../../(withNav)/goodies/panchanga/opengraph-image"),
  "goodies/raagle": () =>
    import("../../(withNav)/goodies/raagle/opengraph-image"),
};

export const DYNAMIC_OG: Record<
  string,
  { load: () => Promise<OgModule>; slugs: () => string[] }
> = {
  blog: {
    load: () => import("../../(withNav)/blog/[slug]/opengraph-image"),
    // drafts included, previewing those cards is the whole point
    slugs: () => getBlogPosts({ includeDrafts: true }).map((p) => p.slug),
  },
  reviews: {
    load: () => import("../../(withNav)/reviews/[slug]/opengraph-image"),
    slugs: () => getReviews().map((r) => r.slug),
  },
};

export function allOgPaths(): string[] {
  return [
    ...Object.keys(STATIC_OG),
    ...Object.entries(DYNAMIC_OG).flatMap(([section, d]) =>
      d.slugs().map((slug) => `${section}/${slug}`),
    ),
  ];
}

// every concrete page route, discovered from the filesystem so future pages
// show up here without edits. dynamic [slug] pages are the ones enumerated
// by DYNAMIC_OG above, so they're skipped in the walk.
export function allPagePaths(): string[] {
  const pages: string[] = [];
  const walk = (dir: string, url: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && /^page\.(tsx|mdx)$/.test(entry.name)) {
        pages.push(url || "/");
      }
      if (!entry.isDirectory()) continue;
      const seg = entry.name;
      if (seg.startsWith("_") || seg.startsWith("[")) continue;
      if (url === "" && (seg === "dev" || seg === "api")) continue;
      // route groups don't contribute a url segment
      walk(path.join(dir, seg), seg.startsWith("(") ? url : `${url}/${seg}`);
    }
  };
  walk(path.join(process.cwd(), "src/app"), "");
  return pages.sort();
}

// pages already shown by the og-module gallery, to keep the coverage
// section down to the rest
export function ogModulePagePaths(): Set<string> {
  return new Set(allOgPaths().map((p) => `/${p}`));
}
