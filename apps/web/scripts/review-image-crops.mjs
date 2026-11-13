import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const out = path.resolve(root, "../../docs/redesign/shots/images");
export function cropFor(row) {
  const factor = Math.min((row.bbox.left - Math.ceil(row.width * .015)) / row.width, (row.bbox.top - Math.ceil(row.height * .015)) / row.height);
  return { left: 0, top: 0, width: Math.floor(row.width * factor), height: Math.floor(row.height * factor) };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rows = JSON.parse(await readFile(path.join(out, "recipes-marks.json"), "utf8"));
  const tiles = [];
  for (const [i, row] of rows.entries()) {
    const width = 280, height = 210, crop = row.found ? cropFor(row) : { width: row.width, height: row.height };
    const image = await sharp(path.join(root, "public/images/recipes", row.file)).resize(width, height, { fit: "fill" }).toBuffer();
    const boundary = Buffer.from(`<svg width="280" height="240"><path d="M${crop.width / row.width * width} 0V${crop.height / row.height * height}H0" fill="none" stroke="#ff2020" stroke-width="2"/><rect y="210" width="280" height="30" fill="white"/><text x="3" y="230" font-size="13">${row.file}</text></svg>`);
    const tile = await sharp({ create: { width: 280, height: 240, channels: 3, background: "white" } }).composite([{ input: image, top: 0, left: 0 }, { input: boundary, top: 0, left: 0 }]).jpeg({ quality: 80 }).toBuffer();
    tiles.push({ input: tile, left: i % 5 * 280, top: Math.floor(i / 5) * 240 });
  }
  await sharp({ create: { width: 1400, height: Math.ceil(rows.length / 5) * 240, channels: 3, background: "white" } }).composite(tiles).jpeg({ quality: 80 }).toFile(path.join(out, "crop-review.jpg"));
  await writeFile(path.join(out, "crop-proposals.json"), JSON.stringify(rows.filter(row => row.found).map(row => ({ file: row.file, ...cropFor(row) })), null, 2));
}
