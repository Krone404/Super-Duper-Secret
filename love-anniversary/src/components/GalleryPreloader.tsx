// src/components/GalleryPreloader.tsx
import { useEffect } from "react";
import { preloadImages } from "../utils/preloadImages.ts";

export default function GalleryPreloader() {
  useEffect(() => {
    const base = "/photos";
    const bust = import.meta.env.DEV ? `?t=${Date.now()}` : "";
    const url = `${base}/manifest.json${bust}`;
    let cancelled = false;

    (async () => {
      try {
        const r = await fetch(url);
        if (!r.ok) return;
        const names: string[] = await r.json();
        if (cancelled) return;
        const urls = names.map((n) => `${base}/${n}`);
        // Preload with small concurrency to stay gentle on bandwidth/CPU
        preloadImages(urls, 3).catch(() => {});
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
