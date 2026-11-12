import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = path.join(root, "public/images", process.argv[2] || "recipes");
const output = path.resolve(root, "../../docs/redesign/shots/images");
await mkdir(output, { recursive: true });
const files = (await readdir(source)).filter(file => /\.(png|webp)$/.test(file)).sort();
const tiles = [];
for (const [index, file] of files.entries()) {
  const input = path.join(source, file);
  const { width, height } = await sharp(input).metadata();
  const w = Math.ceil(width * .08), h = Math.ceil(height * .08);
  const corner = await sharp(input).extract({ left: width - w, top: height - h, width: w, height: h })
    .resize(180, 180, { fit: "contain", background: "#222" }).jpeg({ quality: 80 }).toBuffer();
  const left = index % 7 * 180, top = Math.floor(index / 7) * 210;
  tiles.push({ input: corner, left, top });
  const label = Buffer.from(`<svg width="180" height="30"><rect width="180" height="30" fill="white"/><text x="3" y="18" font-size="10">${file}</text></svg>`);
  tiles.push({ input: label, left, top: top + 180 });
}
await sharp({ create: { width: 1260, height: Math.ceil(files.length / 7) * 210, channels: 3, background: "#222" } })
  .composite(tiles).jpeg({ quality: 80 }).toFile(path.join(output, `corners-${path.basename(source)}.jpg`));
