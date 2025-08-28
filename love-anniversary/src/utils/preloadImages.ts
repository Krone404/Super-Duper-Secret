// src/utils/preloadImages.ts
export async function preloadImages(
  urls: string[],
  concurrency = 4
): Promise<void> {
  let index = 0;

  const loadOne = (url: string) =>
    new Promise<void>((resolve) => {
      const img = new Image();
      // hint: don't lazy-load for prefetch
      (img as any).loading = "eager";
      // start load, then try to decode to avoid jank on swap
      img.onload = () => {
        if ("decode" in img && typeof img.decode === "function") {
          img.decode().then(() => resolve()).catch(() => resolve());
        } else {
          resolve();
        }
      };
      img.onerror = () => resolve(); // ignore failures
      img.src = url;
    });

  await Promise.all(
    Array.from({ length: Math.max(1, concurrency) }, async () => {
      while (index < urls.length) {
        const url = urls[index++];
        // yield to the browser if idle support exists
        if (typeof (window as any).requestIdleCallback === "function") {
          await new Promise<void>((r) =>
            (window as any).requestIdleCallback(() => {
              loadOne(url).then(r);
            }, { timeout: 200 })
          );
        } else {
          await loadOne(url);
        }
      }
    })
  );
}
