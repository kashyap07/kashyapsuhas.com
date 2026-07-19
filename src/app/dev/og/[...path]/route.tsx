// dev-only: serves any og image at /dev/og/<its url path>, sidestepping the
// hashed metadata routes next mounts in dev

import { DYNAMIC_OG, STATIC_OG } from "../registry";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const { path } = await params;
  const load =
    STATIC_OG[path.join("/")] ??
    (path.length === 2 ? DYNAMIC_OG[path[0]]?.load : undefined);
  if (!load) return new Response("Not found", { status: 404 });

  const mod = await load();
  return mod.default({ params: Promise.resolve({ slug: path[1] ?? "" }) });
}
