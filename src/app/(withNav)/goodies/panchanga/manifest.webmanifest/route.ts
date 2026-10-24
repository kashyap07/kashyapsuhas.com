import type { MetadataRoute } from "next";

import siteManifest from "../../../../manifest";

// own manifest so "add to home screen" opens panchanga, not the homepage.
// iOS uses the manifest's start_url + name over the current url.
export const dynamic = "force-static";

export function GET() {
  const manifest: MetadataRoute.Manifest = {
    ...siteManifest(),
    id: "/goodies/panchanga",
    name: "Panchanga",
    short_name: "Panchanga",
    description:
      "Panchanga and sankalpa mantra elements for any date: tithi, nakshatra, maasa and more.",
    start_url: "/goodies/panchanga",
    scope: "/goodies/panchanga",
  };
  return Response.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
