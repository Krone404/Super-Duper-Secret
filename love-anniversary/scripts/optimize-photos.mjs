// scripts/optimize-photos.mjs
import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
import url from "node:url";

const projectRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const srcDir   = path.join(projectRoot, "public", "photos");
const outLarge = path.join(srcDir, "large");   // e.g. /public/photos/large/1.webp|1.avif
const outThumb = path.join(srcDir, "thumbs");  // e.g. /public/photos/thumbs/1.webp|1.avif

const exts = new Set([".jpg",".jpeg",".png",".gif",".webp",".bmp",".heic",".heif"]);

const CONFIG = {
  large: { width: 1600 },    // max width, keeps aspect, no upscaling
  thumb: { width: 320, height: 320, fit: "cover", position: "attention" },
  webpQuality: 82,           // perceptually near-lossless in most cases
  avifQuality: 50,           // similar perceived quality; AVIF compresses better
  makeAVIF: true,            // set false if you only want webp
  stripMetadata: true,       // remove EXIF/ICC to save bytes (set false to keep)
};

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true }).catch(() => {});
}

async function getFiles() {
  let entries = [];
  try {
    entries = await fs.readdir(srcDir, { withFileTypes: true });
  } catch (e) {
    if (e.code === "ENOENT") {
      console.error(`Folder not found: ${srcDir}`);
      process.exit(1);
    }
    throw e;
  }
  return entries
    .filter(d => d.isFile())
    .map(d => d.name)
    .filter(name => exts.has(path.extname(name).toLowerCase()))
    // numeric sort so 2 < 10
    .sort((a,b) => {
      const ai = parseInt(path.parse(a).name, 10);
      const bi = parseInt(path.parse(b).name, 10);
      if (Number.isFinite(ai) && Number.isFinite(bi)) return ai - bi;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    });
}

async function isFresh(input, outputs) {
  try {
    const srcStat = await fs.stat(input);
    for (const out of outputs) {
      try {
        const outStat = await fs.stat(out);
        if (outStat.mtimeMs < srcStat.mtimeMs) return false; // source is newer
      } catch {
        return false; // missing output
      }
    }
    return true;
  } catch {
    return false;
  }
}

async function processOne(name) {
  const base = path.parse(name).name; // "1"
  const srcPath = path.join(srcDir, name);

  const largeWebp = path.join(outLarge, `${base}.webp`);
  const thumbWebp = path.join(outThumb, `${base}.webp`);
  const outputs = [largeWebp, thumbWebp];

  const avifList = [];
  if (CONFIG.makeAVIF) {
    const largeAvif = path.join(outLarge, `${base}.avif`);
    const thumbAvif = path.join(outThumb, `${base}.avif`);
    outputs.push(largeAvif, thumbAvif);
    avifList.push(largeAvif, thumbAvif);
  }

  if (await isFresh(srcPath, outputs)) {
    console.log(`↷ Skip (fresh): ${name}`);
    return;
  }

  const img = sharp(srcPath, { failOn: "none" });
  let pipelineLarge = img.clone().resize({ width: CONFIG.large.width, withoutEnlargement: true });
  let pipelineThumb = img.clone().resize({
    width: CONFIG.thumb.width,
    height: CONFIG.thumb.height,
    fit: CONFIG.thumb.fit,
    position: CONFIG.thumb.position,
  });

  if (CONFIG.stripMetadata) {
    pipelineLarge = pipelineLarge.withMetadata({ exif: undefined, icc: undefined });
    pipelineThumb = pipelineThumb.withMetadata({ exif: undefined, icc: undefined });
  }

  // Write WEBP
  await pipelineLarge.clone().webp({ quality: CONFIG.webpQuality, effort: 4 }).toFile(largeWebp);
  await pipelineThumb.clone().webp({ quality: CONFIG.webpQuality, effort: 4 }).toFile(thumbWebp);

  // Write AVIF (optional)
  if (CONFIG.makeAVIF) {
    await pipelineLarge.clone().avif({ quality: CONFIG.avifQuality, effort: 4 }).toFile(path.join(outLarge, `${base}.avif`));
    await pipelineThumb.clone().avif({ quality: CONFIG.avifQuality, effort: 4 }).toFile(path.join(outThumb, `${base}.avif`));
  }

  // Report size savings
  try {
    const s = await fs.stat(srcPath);
    const w = await fs.stat(largeWebp);
    console.log(`✓ ${name}  →  large.webp: ${(w.size/1024).toFixed(1)} KB (src ${(s.size/1024).toFixed(1)} KB)`);
  } catch {}
}

async function main() {
  await ensureDir(outLarge);
  await ensureDir(outThumb);
  const files = await getFiles();
  if (!files.length) {
    console.log("No source images in /public/photos.");
    return;
  }
  // Process sequentially (keeps CPU/RAM tame). Change to parallel if you like.
  for (const f of files) {
    try {
      await processOne(f);
    } catch (e) {
      console.error(`✗ Failed: ${f}`, e.message || e);
    }
  }
  console.log("Done.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
