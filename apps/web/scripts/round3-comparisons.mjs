import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
const out = fileURLToPath(new URL("../../../docs/redesign/shots/sofra/round3/", import.meta.url));
for (const page of ["home", "catalog", "catalog-shopska-salata", "about"]) for (const width of [1440, 390]) {
  const panel = width === 390 ? 390 : 720;
  const images = [];
  let height;
  for (const [index, phase] of ["before", "after"].entries()) {
    const input = await sharp(path.join(out, `${page}-${width}-${phase}-first.jpg`)).resize({ width: panel }).jpeg({ quality: 85 }).toBuffer();
    height = (await sharp(input).metadata()).height;
    images.push({ input, left: panel * index, top: 30 });
  }
  const label = Buffer.from(`<svg width="${panel * 2}" height="30"><rect width="100%" height="30" fill="white"/><text x="8" y="21" font-size="16">Преди</text><text x="${panel + 8}" y="21" font-size="16">След — същото оформление</text></svg>`);
  await sharp({ create: { width: panel * 2, height: height + 30, channels: 3, background: "white" } }).composite([...images, { input: label, left: 0, top: 0 }]).jpeg({ quality: 80 }).toFile(path.join(out, `${page}-${width}-comparison.jpg`));
}
