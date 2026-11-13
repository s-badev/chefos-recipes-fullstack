import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
for (const slug of ["baklava-s-orehi", "bob-chorba", "krem-karamel", "musaka-s-kartofi", "pileshka-supa", "tarator"]) {
  const images = [];
  for (const [index, directory] of ["recipes", "recipes-web"].entries()) {
    const file = path.join(root, "public/images", directory, slug + (index ? ".webp" : ".png"));
    images.push({ input: await sharp(file).resize(600, 448).jpeg({ quality: 80 }).toBuffer(), left: index * 600, top: 30 });
  }
  const caption = Buffer.from('<svg width="1200" height="30"><rect width="1200" height="30" fill="white"/><text x="12" y="21" font-size="18">Преди (оригинал)</text><text x="612" y="21" font-size="18">След (web master)</text></svg>');
  await sharp({ create: { width: 1200, height: 478, channels: 3, background: "white" } }).composite([...images, { input: caption, left: 0, top: 0 }]).jpeg({ quality: 80 }).toFile(path.resolve(root, "../../docs/redesign/shots/images", `${slug}-before-after.jpg`));
}
