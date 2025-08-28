// src/routes/Gallery.tsx
import { useState, useEffect, useCallback } from "react";
import { usePhotos } from "../store/photos.ts";

function getIdFromSrc(src: string) {
  // "/photos/12.jpg" -> "12"
  const file = src.split("/").pop() || "";
  return file.replace(/\.[^.]+$/, "");
}

export default function Gallery() {
  const photos = usePhotos();
  const [i, setI] = useState(0);
  const n = photos.length;

  // Keep index valid if list changes
  useEffect(() => {
    if (i >= n) setI(0);
  }, [n, i]);

  const next = useCallback(() => {
    if (!n) return;
    setI((p) => (p + 1) % n);
  }, [n]);

  const prev = useCallback(() => {
    if (!n) return;
    setI((p) => (p - 1 + n) % n);
  }, [n]);

  // Keyboard navigation
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!n) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Home") setI(0);
      if (e.key === "End") setI(n - 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [n, next, prev]);

  // Preload first few hero images via <link rel="preload">
  useEffect(() => {
    if (!n) return;
    const count = Math.min(4, n);
    const links: HTMLLinkElement[] = [];
    for (let k = 0; k < count; k++) {
      const id = getIdFromSrc(photos[k].src);

      // Try optimized first (may 404 harmlessly if not generated yet)
      for (const href of [
        `/photos/large/${id}.avif`,
        `/photos/large/${id}.webp`,
        photos[k].src, // original fallback
      ]) {
        const l = document.createElement("link");
        l.rel = "preload";
        l.as = "image";
        l.href = href;
        document.head.appendChild(l);
        links.push(l);
      }
    }
    return () => {
      links.forEach((l) => l.remove());
    };
  }, [n, photos]);

  // Preload neighbor hero images (next & previous)
  useEffect(() => {
    if (!n) return;

    const preload = (idx: number) => {
      const src = photos[idx].src;
      const id = getIdFromSrc(src);
      // Try optimized first, then original
      const urls = [
        `/photos/large/${id}.avif`,
        `/photos/large/${id}.webp`,
        src,
      ];
      urls.forEach((u) => {
        const img = new Image();
        (img as any).loading = "eager";
        img.src = u;
      });
    };

    preload((i + 1) % n);
    preload((i - 1 + n) % n);
  }, [i, n, photos]);

  if (!n) {
    return (
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-2">Gallery</h2>
        <p className="text-dusk">
          Put images in <code>/public/photos</code> (e.g. <code>1.jpg</code>, <code>2.png</code>) and they’ll auto-appear.
        </p>
      </section>
    );
  }

  const p = photos[i];
  const id = getIdFromSrc(p.src);

  return (
    <section className="grid md:grid-cols-[1fr_260px] gap-6">
      {/* Main viewer */}
      <div className="card overflow-hidden">
        <picture>
          {/* Prefer optimized outputs if you ran `npm run photos:optimize` */}
          <source srcSet={`/photos/large/${id}.avif`} type="image/avif" />
          <source srcSet={`/photos/large/${id}.webp`} type="image/webp" />
          {/* Fallback to original */}
          <img
            src={p.src}
            alt={p.alt ?? `Photo ${i + 1}`}
            className="w-full object-cover aspect-[4/3]"
            loading="eager"         // load current image ASAP
            decoding="async"        // decode off main thread when possible
            fetchPriority="high"    // hint browser this is important
          />
        </picture>

        <div className="p-4 flex items-center justify-between">
          <button className="btn-ghost" onClick={prev} aria-label="Previous">← Prev</button>
          <div className="text-sm text-dusk">{i + 1} / {n}</div>
          <button className="btn-ghost" onClick={next} aria-label="Next">Next →</button>
        </div>
      </div>

      {/* Sidebar: caption + thumbs */}
      <aside className="card p-4">
        <h2 className="font-bold mb-2">Caption</h2>
        <p className="text-dusk min-h-[1.5rem]">{p.caption || "—"}</p>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {photos.map((ph, idx) => {
            const tid = getIdFromSrc(ph.src);
            return (
              <button
                key={ph.src}
                onClick={() => setI(idx)}
                className={`border rounded-lg overflow-hidden ${idx === i ? "ring-2 ring-blush" : "opacity-80 hover:opacity-100"}`}
                aria-label={`Go to photo ${idx + 1}`}
              >
                <picture>
                  <source srcSet={`/photos/thumbs/${tid}.avif`} type="image/avif" />
                  <source srcSet={`/photos/thumbs/${tid}.webp`} type="image/webp" />
                  <img
                    src={ph.src} // fallback
                    alt={ph.alt ?? `Photo ${idx + 1}`}
                    className="aspect-square object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </button>
            );
          })}
        </div>
      </aside>
    </section>
  );
}
