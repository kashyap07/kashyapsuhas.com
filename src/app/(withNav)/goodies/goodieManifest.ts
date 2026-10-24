import type { Metadata } from "next";

import goodies from "./goodiesList";

// spread into a goodie layout's metadata so it installs as its own web app
export function goodieAppMetadata(
  slug: string,
): Pick<Metadata, "manifest" | "appleWebApp"> {
  const goodie = goodies.find((g) => g.href === `goodies/${slug}`);
  if (!goodie) throw new Error(`unknown goodie: ${slug}`);
  return {
    manifest: `/manifests/goodies/${slug}`,
    appleWebApp: { title: goodie.name },
  };
}
