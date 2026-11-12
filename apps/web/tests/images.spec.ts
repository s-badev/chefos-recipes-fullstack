import { test, expect } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const evidence = path.resolve(root, "../../docs/redesign/shots/images");

test("image processing never modifies any original PNG, including the supplied untracked file", async () => {
  const hashes = JSON.parse((await readFile(path.join(evidence, "original-hashes-before.json"), "utf8")).replace(/^\uFEFF/, ""));
  const present = new Set(await readdir(path.join(root, "public/images/recipes")));
  for (const row of hashes) {
    // The supplied PNG is intentionally untracked: verify it locally, without requiring it
    // in clean checkouts. Every tracked original remains mandatory.
    if (row.file === "pile-teriyaki.png" && !present.has(row.file)) continue;
    const bytes = await readFile(path.join(root, "public/images/recipes", row.file));
    expect(createHash("sha256").update(bytes).digest("hex").toUpperCase(), row.file).toBe(row.Hash);
  }
});

test("detector rejects a flat bright corner and a dark corner", async () => {
  const { detectMark } = await import("../scripts/detect-image-marks.mjs");
  const sharp = require("sharp");
  for (const background of ["#ffffff", "#171010"]) {
    const image = await sharp({ create: { width: 1000, height: 750, channels: 3, background } }).png().toBuffer();
    expect((await detectMark(image)).found).toBe(false);
  }
});

test("detector recognises a four-ray mark on a synthetic background", async () => {
  const { detectMark } = await import("../scripts/detect-image-marks.mjs");
  const sharp = require("sharp");
  const star = Buffer.from('<svg width="1000" height="750"><rect width="1000" height="750" fill="#534437"/><path d="M953 681 Q953 703 975 703 Q953 703 953 725 Q953 703 931 703 Q953 703 953 681Z" fill="#dedcd5"/></svg>');
  expect((await detectMark(await sharp(star).png().toBuffer())).found).toBe(true);
});

test("the six before/after evidence images are JPEG files", async () => {
  const sharp = require("sharp");
  const names = (await readdir(evidence)).filter(name => name.endsWith("-before-after.jpg"));
  expect(names).toHaveLength(6);
  for (const name of names) expect((await sharp(path.join(evidence, name)).metadata()).format).toBe("jpeg");
});

test("unrepaired composition exceptions retain original master bytes and every master keeps its dimensions", async () => {
  const sharp = require("sharp");
  const exceptions = JSON.parse(await readFile(path.join(root, "scripts/image-crop-exceptions.json"), "utf8"));
  const rows = JSON.parse(await readFile(path.join(evidence, "generation.json"), "utf8"));
  const repairs = JSON.parse(await readFile(path.resolve(evidence, "../images-followup/texture/repairs.json"), "utf8"));
  const repaired = new Set(repairs.filter((row: { applied: boolean }) => row.applied).map((row: { name: string }) => row.name + ".png"));
  expect(rows.filter((row: { crop: unknown }) => row.crop)).toHaveLength(19);
  for (const row of rows) {
    const file = row.file.replace(/\.png$/, ".webp");
    const original = execFileSync("git", ["show", `3e97609:apps/web/public/images/recipes-web/${file}`], { cwd: root, maxBuffer: 2_000_000 });
    const current = await readFile(path.join(root, "public/images/recipes-web", file));
    const before = await sharp(original).metadata(), after = await sharp(current).metadata();
    expect([after.width, after.height], file).toEqual([before.width, before.height]);
    if (exceptions[row.file] && !repaired.has(row.file)) expect(current.equals(original), file).toBe(true);
  }
});

for (const route of ["/", "/catalog", "/catalog/shopska-salata", "/catalog/пиле-тариаки", "/login", "/register", "/about"]) {
  test(`axe: zero violations on ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .8) { scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 60)); }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(900);
    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    const violations = await page.evaluate(async () => {
      const result = await (window as unknown as { axe: { run: () => Promise<{ violations: Array<{ id: string; nodes: Array<{ target: string[] }> }> }> } }).axe.run();
      return result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }));
    });
    expect(violations).toEqual([]);
  });
}

for (const [width, expectedWidth, requestedWidth] of [[390, 358, 384], [1440, 592, 640]]) {
  test(`catalog at ${width}: column-sized variant and only the LCP image is eager/high priority`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto("/catalog", { waitUntil: "networkidle" });
    const images = page.locator(".cards .ci img");
    await expect(images.first()).toHaveAttribute("loading", "eager");
    await expect(images.first()).toHaveAttribute("fetchpriority", "high");
    await expect(page.locator('.cards img[loading="eager"]')).toHaveCount(1);
    await expect(page.locator('.cards img[fetchpriority="high"]')).toHaveCount(1);
    const rest = await images.evaluateAll(nodes => nodes.slice(1).every(node => node.getAttribute("loading") === "lazy"));
    expect(rest).toBe(true);
    expect(Math.round((await images.first().boundingBox())!.width)).toBe(expectedWidth);
    const src = await images.first().evaluate((image: HTMLImageElement) => image.currentSrc);
    expect(new URL(src).searchParams.get("w")).toBe(String(requestedWidth));
  });
}
