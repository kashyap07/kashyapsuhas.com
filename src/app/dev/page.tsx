import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "dev tools" };

const TOOLS = [
  {
    href: "/dev/og",
    title: "og preview",
    desc: "every og image: custom cards plus what the rest of the pages inherit",
  },
  {
    href: "/dev/meta",
    title: "meta audit",
    desc: "titles, descriptions, canonicals, json-ld across all pages",
  },
  {
    href: "/dev/content",
    title: "content health",
    desc: "drafts, todo markers, missing frontmatter",
  },
];

// dev-only index so the tools are discoverable without remembering urls
export default function DevIndexPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">dev tools</h1>
      <ul className="mt-8 space-y-4">
        {TOOLS.map((t) => (
          <li key={t.href}>
            <a href={t.href} className="text-lg text-slate-700 hover:underline">
              {t.title}
            </a>
            <p className="text-sm text-slate-500">{t.desc}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
