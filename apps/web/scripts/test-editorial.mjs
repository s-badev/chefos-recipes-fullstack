import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
function load(relative) {
  const filename = path.join(root, relative);
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: createRequire(filename), Date, Set });
  return exports;
}
const { isoWeek, weeklyRecipe } = load("src/lib/weekly.ts");
for (const [date, expected] of [["2021-01-01", 53], ["2021-01-04", 1], ["2024-12-30", 1], ["2020-12-31", 53]]) assert.equal(isoWeek(new Date(date)), expected, date);
const list = Object.freeze(Array.from({ length: 24 }, (_, i) => i));
assert.equal(weeklyRecipe(list, new Date("2021-01-01")).number, "05");
assert.equal(weeklyRecipe(list, new Date("2021-01-04")).recipe, 0);
assert.throws(() => weeklyRecipe([]));
const { webImageSrc } = load("src/lib/images.ts");
assert.equal(webImageSrc("/images/recipes/shopska-salata.png"), "/images/recipes-web/shopska-salata.webp");
assert.equal(webImageSrc("/images/recipes/admin-unknown.png"), "/images/recipes/admin-unknown.png");
assert.equal(webImageSrc("https://example.com/photo.png"), "https://example.com/photo.png");
const names = JSON.parse(fs.readFileSync(path.join(root, "src/lib/web-images.json"), "utf8"));
for (const name of names) {
  const image = await sharp(path.join(root, "public/images/recipes-web", name + ".webp")).metadata();
  assert.equal(image.format, "webp"); assert.ok(image.width <= 2000); assert.equal(image.exif, undefined);
  assert.ok(fs.existsSync(path.join(root, "public/images/recipes", name + ".png")));
}
console.log("PASS: ISO week-year boundaries, deterministic weekly selection, image fallback and 26 generated assets.");
