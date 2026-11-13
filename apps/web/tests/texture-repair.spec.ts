import { test, expect } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const require = createRequire(import.meta.url);
const sharp = require("sharp");
const root = fileURLToPath(new URL("../", import.meta.url));
const evidence = path.resolve(root, "../../docs/redesign/shots/images-followup/texture");
const hash = (buffer: Buffer) => createHash("sha256").update(buffer).digest("hex");

test("only visually accepted masters change; lossless output preserves every pixel outside the feather mask", async () => {
  const { textureMask } = await import("../scripts/texture-repair.mjs");
  const reviews = JSON.parse(await readFile(path.join(root, "scripts/texture-repair-review.json"), "utf8"));
  const rows = JSON.parse(await readFile(path.join(evidence, "repairs.json"), "utf8"));
  expect(rows).toHaveLength(7);
  const changed: string[] = [];
  for (const file of (await readdir(path.join(root, "public/images/recipes-web"))).filter(name => name.endsWith(".webp"))) {
    const before = execFileSync("git", ["show", `44f77ad:apps/web/public/images/recipes-web/${file}`], { cwd: root, maxBuffer: 4_000_000 });
    const after = await readFile(path.join(root, "public/images/recipes-web", file));
    if (before.equals(after)) continue;
    const name = file.replace(/\.webp$/, ""); changed.push(name);
    expect(reviews[name].apply, file).toBe(true);
    const row = rows.find((item: { name: string }) => item.name === name);
    expect(row.applied).toBe(true); expect(hash(before)).toBe(row.beforeHash); expect(hash(after)).toBe(row.afterHash);
    const a = await sharp(before).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
    const b = await sharp(after).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
    expect(b.info.width).toBe(a.info.width); expect(b.info.height).toBe(a.info.height);
    const patch = textureMask(a.info.width, a.info.height);
    let outside = 0, inside = 0;
    for (let y = 0; y < a.info.height; y++) for (let x = 0; x < a.info.width; x++) {
      const i = (y * a.info.width + x) * 3;
      if (a.data[i] === b.data[i] && a.data[i + 1] === b.data[i + 1] && a.data[i + 2] === b.data[i + 2]) continue;
      const local = x >= patch.left && x < patch.left + patch.width && y >= patch.top && y < patch.top + patch.height;
      if (local && patch.mask[(y - patch.top) * patch.width + x - patch.left]) inside++; else outside++;
    }
    expect(outside, file).toBe(0); expect(inside, file).toBeGreaterThan(0); expect(inside).toBe(row.changedPixels);
  }
  expect(changed.sort()).toEqual(Object.keys(reviews).filter(name => reviews[name].apply).sort());
});

test("all seven candidates have full-frame and enlarged JPEG comparisons", async () => {
  const rows = JSON.parse(await readFile(path.join(evidence, "repairs.json"), "utf8"));
  for (const row of rows) for (const [view, width, height] of [["full", 1200, 478], ["zoom", 1120, 510]] as const) {
    const metadata = await sharp(path.join(evidence, `${row.name}-${view}.jpg`)).metadata();
    expect(metadata.format).toBe("jpeg"); expect([metadata.width, metadata.height]).toEqual([width, height]);
  }
});

test("same detector over all 27 masters finds only the six deliberately retained marks", async () => {
  const { detectMark } = await import("../scripts/detect-image-marks.mjs");
  const reviews = JSON.parse(await readFile(path.join(root, "scripts/texture-repair-review.json"), "utf8"));
  const files = (await readdir(path.join(root, "public/images/recipes-web"))).filter(name => name.endsWith(".webp")).sort();
  expect(files).toHaveLength(27);
  const found = [];
  for (const file of files) if ((await detectMark(path.join(root, "public/images/recipes-web", file))).found) found.push(file);
  expect(found.sort()).toEqual(Object.keys(reviews).filter(name => !reviews[name].apply).map(name => name + ".webp").sort());
});

test("the repaired lossless master is served to cards as a small optimized AVIF", async ({ request }) => {
  const response = await request.get("/_next/image?url=%2Fimages%2Frecipes-web%2Ftikvenik.webp&w=384&q=75", { headers: { Accept: "image/avif,image/webp" } });
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/avif");
  expect((await response.body()).length).toBeLessThan(150_000);
});
