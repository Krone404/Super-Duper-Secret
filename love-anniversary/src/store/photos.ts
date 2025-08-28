// src/store/photos.ts
import { useEffect, useState } from "react";

export type Photo = { src: string; alt?: string; caption?: string };

/**
 * Load photos from /public/photos/manifest.json (+ optional captions.json).
 * Falls back to samples if not available yet.
 */
export function usePhotos(): Photo[] {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const base = "/photos";
    const bust = import.meta.env.DEV ? `?t=${Date.now()}` : "";
    const manifestUrl = `${base}/manifest.json${bust}`;
    const captionsUrl = `${base}/captions.json${bust}`;

    let cancelled = false;

    const load = async () => {
      try {
        const r = await fetch(manifestUrl);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const names: string[] = await r.json();

        // captions are optional
        let captions: Record<string, string> = {};
        try {
          const cr = await fetch(captionsUrl);
          if (cr.ok) captions = await cr.json();
        } catch {
          /* ignore */
        }

        if (!cancelled) {
          setPhotos(
            names.map((name, i) => ({
              src: `${base}/${name}`,
              alt: `Photo ${i + 1}`,
              caption: captions[name],
            }))
          );
        }
      } catch {
        if (!cancelled) {
          // Fallback samples so UI still renders
          setPhotos([
            { src: "https://picsum.photos/seed/us-1/1200/900", alt: "Sample 1", caption: "Sample photo 1" },
            { src: "https://picsum.photos/seed/us-2/1200/900", alt: "Sample 2", caption: "Sample photo 2" },
            { src: "https://picsum.photos/seed/us-3/1200/900", alt: "Sample 3", caption: "Sample photo 3" },
          ]);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return photos;
}
