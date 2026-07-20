import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { allOgPaths, allPagePaths } from "../og/registry";
import { MetaTable } from "./MetaTable";

export const metadata: Metadata = { title: "meta audit" };

// dev-only head-tag audit: every page (static routes plus enumerated blog and
// review slugs) scraped for what its head actually says
export default function MetaAuditPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const paths = [
    ...allPagePaths(),
    ...allOgPaths()
      .filter((p) => !p.startsWith("goodies/"))
      .map((p) => `/${p}`),
  ].sort();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">meta audit</h1>
      <MetaTable paths={paths} />
    </main>
  );
}
