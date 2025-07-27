import { useEffect, useState } from 'react';
import { get, set } from 'idb-keyval';

/**
 * Loads an image from IndexedDB if available. If not cached, the image is
 * fetched from the network and stored for future visits.
 */
export default function useIndexedImage(src: string) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | undefined;

    async function load() {
      if (typeof window === 'undefined') return;
      try {
        const cached = await get<Blob>(src);
        if (cached) {
          objectUrl = URL.createObjectURL(cached);
          if (!cancelled) setUrl(objectUrl);
          return;
        }
        const res = await fetch(src);
        const blob = await res.blob();
        await set(src, blob);
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setUrl(objectUrl);
      } catch {
        // fall back to network src if anything fails
        if (!cancelled) setUrl(src);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return url || src;
}
