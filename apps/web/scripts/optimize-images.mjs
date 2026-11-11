import sharp from "sharp";
import { readdir, mkdir, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = path.join(root, "public/images/recipes");
const destination = path.join(root, "public/images/recipes-web");
await mkdir(destination, { recursive: true });
const files = (await readdir(source)).filter(name => name.endsWith(".png")).sort();
let before = 0, after = 0;
for (const name of files) {
  const input = path.join(source, name);
  const output = path.join(destination, name.replace(/\.png$/, ".webp"));
  before += (await stat(input)).size;
  await sharp(input).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82 }).toFile(output);
  after += (await stat(output)).size;
}
// A generated manifest also lets client-rendered web cards resolve files without node:fs.
await writeFile(path.join(root, "src/lib/web-images.json"), JSON.stringify(files.map(name => name.replace(/\.png$/, "")), null, 2) + "\n");
console.log(JSON.stringify({ files: files.length, beforeBytes: before, afterBytes: after, reductionPercent: +(100 * (1 - after / before)).toFixed(2) }, null, 2));
