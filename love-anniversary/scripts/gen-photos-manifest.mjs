// scripts/gen-photos-manifest.mjs
import { promises as fs } from "node:fs";
import path from "node:path";
import url from "node:url";

const projectRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const photosDir = path.join(projectRoot, "public", "photos");
const manifestPath = path.join(photosDir, "manifest.json");

const exts = new Set([".jpg",".jpeg",".png",".gif",".webp",".bmp",".heic",".heif"]);

async function main() {
  let entries = [];
  try {
    entries = await fs.readdir(photosDir, { withFileTypes: true });
  } catch (e) {
    if (e.code === "ENOENT") {
      console.error(`Folder not found: ${photosDir}`);
      process.exit(1);
    }
    throw e;
  }

  // files only, allowed extensions
  const files = entries
    .filter(d => d.isFile())
    .map(d => d.name)
    .filter(name => exts.has(path.extname(name).toLowerCase()));

  // sort numerically by base name (so 2 < 10)
  files.sort((a, b) => {
    const ai = parseInt(path.parse(a).name, 10);
    const bi = parseInt(path.parse(b).name, 10);
    if (Number.isFinite(ai) && Number.isFinite(bi)) return ai - bi;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  });

  await fs.writeFile(manifestPath, JSON.stringify(files, null, 2), "utf8");
  console.log(`Wrote ${files.length} entries to ${manifestPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
