import sharp from "sharp";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { detectMark } from "./detect-image-marks.mjs";

export async function generateImageVariants(only) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const source = path.join(root, "public/images/recipes-web"), destination = path.join(root, "public/images/recipes-responsive");
  await mkdir(destination, { recursive: true });
  const names = (await readdir(source)).filter(name => /^[a-z0-9-]+\.webp$/.test(name)).sort();
  const selected = only ? names.filter(name => name.replace(/\.webp$/, "") === only.replace(/\.(png|webp)$/, "")) : names;
  if (!selected.length) throw new Error("No matching existing web master");
  const rows = [];
  for (const file of selected) {
    const input = await readFile(path.join(source, file)), metadata = await sharp(input).metadata();
    const name = file.replace(/\.webp$/, "");
    const cleanMaster = !(await detectMark(input)).found;
    for (const width of [160, 320, 480, 640, 800, 1200, 1600].filter(width => width <= metadata.width)) {
      for (const format of ["avif", "webp"]) {
        const output = `${name}-${width}.${format}`;
        const encode = quality => {
          const resized = sharp(input).resize({ width, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 });
          return (format === "avif" ? resized.avif({ quality, effort: 6, chromaSubsampling: "4:2:0" }) : resized.webp({ quality })).toBuffer();
        };
        let quality = format === "avif" ? 38 : 78;
        let bytes = await encode(quality);
        // Raise quality if quantization produces a detector-positive shape in a clean master.
        // No crop, retouch or detector threshold change is used for derivatives.
        if (cleanMaster && [480, 640, 800, 1200].includes(width)) {
          for (const higher of [45, 55, 65, 75, 85, 95, 100].filter(value => value > quality)) {
            if (!(await detectMark(bytes)).found) break;
            quality = higher; bytes = await encode(quality);
          }
          if ((await detectMark(bytes)).found) throw new Error(`Derivative mark check failed: ${output}`);
        }
        await writeFile(path.join(destination, output), bytes);
        rows.push({ name, width, format, quality, bytes: bytes.length, sourceSha256: createHash("sha256").update(input).digest("hex") });
      }
    }
    console.log(`Responsive variants: ${name}`);
  }
  const available = await readdir(destination), manifest = {};
  for (const file of names) {
    const name = file.replace(/\.webp$/, "");
    const widths = [160, 320, 480, 640, 800, 1200, 1600].filter(width => ["avif", "webp"].every(format => available.includes(`${name}-${width}.${format}`)));
    if (widths.length) manifest[name] = widths;
  }
  await writeFile(path.join(root, "src/lib/image-variants.json"), JSON.stringify(manifest, null, 2) + "\n");
  const evidence = path.resolve(root, "../../docs/redesign/shots/sofra/round3");
  await mkdir(evidence, { recursive: true });
  const report = path.join(evidence, "variant-generation.json");
  const previous = only ? await readFile(report, "utf8").then(JSON.parse).catch(error => { if (error.code === "ENOENT") return []; throw error; }) : [];
  const selectedNames = new Set(selected.map(name => name.replace(/\.webp$/, "")));
  await writeFile(report, JSON.stringify([...previous.filter(row => !selectedNames.has(row.name)), ...rows], null, 2) + "\n");
  console.log(JSON.stringify({ variants: rows.length, bytes: rows.reduce((sum, row) => sum + row.bytes, 0) }));
}
