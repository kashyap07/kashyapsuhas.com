import type { MetadataRoute } from "next";

import goodies from "../../../(withNav)/goodies/goodiesList";
import siteManifest from "../../../manifest";

// per-goodie manifest so "add to home screen" opens the tool, not the
// homepage. iOS uses the manifest's start_url + name over the current url.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return goodies.map((g) => ({ slug: g.href.replace("goodies/", "") }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const goodie = goodies.find((g) => g.href === `goodies/${slug}`);
  if (!goodie) return new Response("not found", { status: 404 });

  const path = `/${goodie.href}`;
  const manifest: MetadataRoute.Manifest = {
    ...siteManifest(),
    id: path,
    name: goodie.name,
    short_name: goodie.name,
    description: goodie.description,
    start_url: path,
    scope: path,
  };
  return Response.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
