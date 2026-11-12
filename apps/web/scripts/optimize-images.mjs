import sharp from "sharp";
import { readdir, mkdir, stat, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { detectMark } from "./detect-image-marks.mjs";
import { cropFor } from "./review-image-crops.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = path.join(root, "public/images/recipes");
const destination = path.join(root, "public/images/recipes-web");
await mkdir(destination, { recursive: true });

// `--atmosphere` only writes the tiny pre-blurred table photo behind every page (public/images/atmosphere.webp);
// CSS stretches and blurs it further, so it costs well under 2 KB and never competes with the LCP image.
if (process.argv.includes("--atmosphere")) {
  const output = path.join(root, "public/images/atmosphere.webp");
  await sharp(path.join(source, "hero-banitsa-shopska-salad.png")).resize({ width: 96 }).blur(1.2).webp({ quality: 45 }).toFile(output);
  const bytes = (await stat(output)).size;
  console.log(JSON.stringify({ atmosphere: path.relative(root, output), bytes }));
  if (bytes >= 2048) throw new Error(`atmosphere.webp is ${bytes} bytes; it must stay under 2 KB`);
  process.exit(0);
}
const exceptions = JSON.parse(await readFile(new URL("./image-crop-exceptions.json", import.meta.url), "utf8"));
// An explicit input keeps newly supplied, untracked originals out of a full regeneration.
const only = process.argv.find(arg => arg.startsWith("--only="))?.slice(7);
const files = (await readdir(source)).filter(name => name.endsWith(".png") && (only ? name === only : name !== "pile-teriyaki.png")).sort();
if (only && !files.length) throw new Error("Requested source PNG does not exist");
const decisions = [];
let before = 0, after = 0;
for (const name of files) {
  const input = path.join(source, name);
  const output = path.join(destination, name.replace(/\.png$/, ".webp"));
  before += (await stat(input)).size;
  const mark = await detectMark(input);
  const crop = mark.found && !exceptions[name] ? cropFor(mark) : null;
  decisions.push({ file: name, ...mark, crop, exception: exceptions[name] });
  // Preserve existing masters byte-for-byte for absent marks and composition exceptions.
  if (!crop && !only) { after += (await stat(output)).size; continue; }
  const master = await readFile(output).then(buffer => sharp(buffer).metadata()).catch(error => {
    if (error.code === "ENOENT") return { width: Math.min(mark.width, 2000), height: Math.round(mark.height * Math.min(mark.width, 2000) / mark.width) };
    throw error;
  });
  let pipeline = sharp(input).rotate();
  if (crop) pipeline = pipeline.extract(crop);
  const encoded = await pipeline.resize(master.width, master.height, { fit: "fill", kernel: sharp.kernel.lanczos3 }).webp({ quality: 82 }).toBuffer();
  await writeFile(output, encoded);
  after += (await stat(output)).size;
}
// A generated manifest also lets client-rendered web cards resolve files without node:fs.
if (!only) await writeFile(path.join(root, "src/lib/web-images.json"), JSON.stringify(files.map(name => name.replace(/\.png$/, "")), null, 2) + "\n");
await writeFile(path.resolve(root, "../../docs/redesign/shots/images/generation.json"), JSON.stringify(decisions, null, 2) + "\n");
console.log(JSON.stringify({ files: files.length, beforeBytes: before, afterBytes: after, reductionPercent: +(100 * (1 - after / before)).toFixed(2) }, null, 2));
