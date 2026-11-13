const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createLoader } = require("./load-typescript.cjs");

async function main() {
  const root = path.resolve(__dirname, "..");
  const source = path.join(root, "public/images/recipes-web"), output = path.join(root, "public/images/social");
  await fs.mkdir(output, { recursive: true });
  const names = (await fs.readdir(source)).filter(name => /^[a-z0-9-]+\.webp$/.test(name)).sort();
  for (const name of names) {
    await sharp(path.join(source, name)).resize(1200, 630, { fit: "cover", kernel: sharp.kernel.lanczos3 }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(output, name.replace(/\.webp$/, ".jpg")));
  }
  await fs.copyFile(path.join(output, "hero-banitsa-shopska-salad.jpg"), path.join(output, "site.jpg"));
  const { StitchStar } = createLoader()(path.join(root, "src/app/stitch.tsx"));
  const star = renderToStaticMarkup(React.createElement(StitchStar));
  const inner = star.slice(star.indexOf(">") + 1, star.lastIndexOf("</svg>"));
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><rect width="180" height="180" fill="#170F0F"/><svg x="18" y="18" width="144" height="144" viewBox="0 0 150 150" color="#C81E2B">${inner}</svg></svg>\n`;
  await fs.writeFile(path.join(root, "src/app/icon.svg"), icon);
  await sharp(Buffer.from(icon)).jpeg({ quality: 95 }).toFile(path.join(root, "src/app/apple-icon.jpg"));
  const preview = path.resolve(root, "../../docs/redesign/shots/sofra/round3/icon-preview.jpg");
  await sharp(Buffer.from(icon)).resize(540, 540).jpeg({ quality: 90 }).toFile(preview);
  console.log(`Generated ${names.length + 1} social JPEGs (1200×630), StitchStar icon and 180×180 Apple JPEG; sources: current WebP masters only.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
