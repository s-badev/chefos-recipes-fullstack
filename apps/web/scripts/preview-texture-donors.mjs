import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const names = Object.keys(JSON.parse(await readFile(new URL("./image-crop-exceptions.json", import.meta.url), "utf8"))).map(name => name.replace(/\.png$/, ""));
const out = path.resolve(root, "../../docs/redesign/shots/images-followup/texture");
await mkdir(out, { recursive: true });
const tiles = [];
for (const [i, name] of names.entries()) {
  const input = path.join(root, "public/images/recipes-web", `${name}.webp`);
  const { width, height } = await sharp(input).metadata();
  const crop = { left: width - 400, top: height - 310, width: 400, height: 310 };
  const corner = await sharp(input).extract(crop).jpeg({ quality: 80 }).toBuffer();
  const label = Buffer.from(`<svg width="400" height="30"><rect width="400" height="30" fill="white"/><text x="4" y="20" font-size="13">${name}</text></svg>`);
  tiles.push({ input: corner, left: i % 3 * 400, top: Math.floor(i / 3) * 340 + 30 });
  tiles.push({ input: label, left: i % 3 * 400, top: Math.floor(i / 3) * 340 });
}
await sharp({ create: { width: 1200, height: Math.ceil(names.length / 3) * 340, channels: 3, background: "#222" } }).composite(tiles).jpeg({ quality: 80 }).toFile(path.join(out, "donor-review.jpg"));
