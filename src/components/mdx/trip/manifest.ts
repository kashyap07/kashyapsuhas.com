import type { Photo } from "./types";

// per-manifest lookup map, cached by array identity so the ~hundreds of
// lookups in a post don't rebuild it each time. keyed by full src AND
// basename so mdx can just say src="IMG_1234.jpg".
const lookupCache = new WeakMap<Photo[], Map<string, Photo>>();

export function findPhoto(photos: Photo[], src: string): Photo | undefined {
  let byName = lookupCache.get(photos);
  if (!byName) {
    byName = new Map();
    for (const p of photos) {
      byName.set(p.src, p);
      const name = p.src.split("/").pop();
      if (name) byName.set(name, p);
    }
    lookupCache.set(photos, byName);
  }
  return byName.get(src);
}

// thumbs live next to the full-size files: img/foo.jpg -> img/thumb/foo.jpg
export function thumbSrc(src: string): string {
  const i = src.lastIndexOf("/");
  return `${src.slice(0, i)}/thumb/${src.slice(i + 1)}`;
}
