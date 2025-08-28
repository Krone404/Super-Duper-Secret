import { useState, useEffect, useCallback } from "react";
import { photos } from "../store/photos";

export default function Gallery() {
  if (!photos.length) {
    return (
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-2">Gallery</h2>
        <p className="text-dusk">
          Drop images into <code>/public/photos</code> (e.g. <code>01.jpg</code>, <code>02.jpg</code>) and then add them to
          <code> src/store/photos.ts</code>.
        </p>
      </section>
    );
  }

  const [i, setI] = useState(0);
  const n = photos.length;

  const next = useCallback(() => setI((p) => (p + 1) % n), [n]);
  const prev = useCallback(() => setI((p) => (p - 1 + n) % n), [n]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  const p = photos[i];

  return (
    <section className="grid md:grid-cols-[1fr_260px] gap-6">
      <div className="card overflow-hidden">
        <img src={p.src} alt={p.alt} className="w-full object-cover aspect-[4/3]" />
        <div className="p-4 flex items-center justify-between">
          <button className="btn-ghost" onClick={prev} aria-label="Previous">← Prev</button>
          <div className="text-sm text-dusk">{i + 1} / {n}</div>
          <button className="btn-ghost" onClick={next} aria-label="Next">Next →</button>
        </div>
      </div>

      <aside className="card p-4">
        <h2 className="font-bold mb-2">Caption</h2>
        <p className="text-dusk">{p.caption || "—"}</p>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {photos.map((ph, idx) => (
            <button
              key={ph.src}
              onClick={() => setI(idx)}
              className={`border rounded-lg overflow-hidden ${idx===i ? "ring-2 ring-blush" : "opacity-80 hover:opacity-100"}`}
              aria-label={`Go to photo ${idx+1}`}
            >
              <img src={ph.src} alt={ph.alt} className="aspect-square object-cover" />
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}
