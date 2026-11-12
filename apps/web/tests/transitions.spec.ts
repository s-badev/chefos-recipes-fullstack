import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const { createLoader } = require("../scripts/load-typescript.cjs");
const root = fileURLToPath(new URL("../", import.meta.url));

/** Watches <main> for the entrance class and keeps the header node to prove it is not rebuilt. */
async function watchEntrance(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __entered: number; __header: Element | null };
    w.__entered = 0;
    w.__header = document.querySelector("header.hdr");
    new MutationObserver(() => { if (document.getElementById("main-content")!.classList.contains("pg-enter")) w.__entered++; })
      .observe(document.getElementById("main-content")!, { attributes: true, attributeFilter: ["class"] });
  });
}

test("client navigation: the page content rises in (transform + opacity, ~260ms); the header stays the same node", async ({ page }) => {
  await page.goto("/about", { waitUntil: "networkidle" });
  // First load: no entrance (LCP untouched).
  await expect(page.locator("#main-content")).not.toHaveClass(/pg-enter/);
  await watchEntrance(page);
  await page.locator("header").getByRole("link", { name: "Рецепти", exact: true }).click();
  await page.waitForURL("**/catalog");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __entered: number }).__entered)).toBeGreaterThan(0);
  const animation = await page.evaluate(() => {
    const style = getComputedStyle(document.querySelector("#main-content")!);
    return { name: style.animationName, duration: style.animationDuration };
  });
  if (animation.name !== "none") {
    expect(animation.name).toBe("pg-enter");
    expect(parseFloat(animation.duration)).toBeGreaterThanOrEqual(0.22);
    expect(parseFloat(animation.duration)).toBeLessThanOrEqual(0.28);
  }
  // Afterwards <main> carries no transform; the header was never replaced.
  await expect(page.locator("#main-content")).not.toHaveClass(/pg-enter/, { timeout: 2000 });
  expect(await page.evaluate(() => (window as unknown as { __header: Element | null }).__header === document.querySelector("header.hdr"))).toBe(true);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("client navigation without any entrance", async ({ page }) => {
    await page.goto("/about", { waitUntil: "networkidle" });
    await watchEntrance(page);
    await page.locator("header").getByRole("link", { name: "Рецепти", exact: true }).click();
    await page.waitForURL("**/catalog");
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as unknown as { __entered: number }).__entered)).toBe(0);
  });
});

for (const width of [1440, 390]) {
  test(`catalog loading at ${width}: placeholders sit where the real cards land (no jump)`, async ({ page }) => {
    const { default: Loading } = createLoader({})(path.join(root, "src/app/catalog/(list)/loading.tsx"));
    const markup = renderToStaticMarkup(React.createElement(Loading));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/catalog", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const boxes = () => page.evaluate(() => [...document.querySelectorAll("main .cards.cat .card .ci")].slice(0, 6).map(node => {
      const r = node.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
    }));
    const real = await boxes();
    await page.evaluate(html => { document.querySelector("main")!.innerHTML = html; }, markup);
    const placeholders = await boxes();
    expect(placeholders).toHaveLength(6);
    for (const [index, box] of placeholders.entries()) {
      for (const field of ["x", "y", "w", "h"] as const) expect(Math.abs(box[field] - real[index][field]), `card ${index} ${field}`).toBeLessThanOrEqual(4);
    }
    // Calm: one slow pulse, and the whole state fades in only after a short wait.
    const timing = await page.evaluate(() => ({
      pulse: getComputedStyle(document.querySelector(".cat-loading .sk")!).animationDuration,
      delay: getComputedStyle(document.querySelector(".cat-loading > div")!).animationDelay
    }));
    expect(parseFloat(timing.pulse)).toBeGreaterThanOrEqual(1.2);
    expect(parseFloat(timing.delay)).toBeGreaterThan(0);
  });
}

test("pressed states: buttons sink, menu links dim", async ({ page }) => {
  await page.goto("/about", { waitUntil: "networkidle" });
  const button = page.getByRole("main").getByRole("link", { name: "Всички рецепти", exact: true });
  await button.scrollIntoViewIfNeeded();
  const box = (await button.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(250);
  expect(await button.evaluate(node => getComputedStyle(node).transform)).not.toBe("none");
  await page.mouse.up();
  await page.mouse.move(0, 0);
  const link = page.locator("header").getByRole("link", { name: "За нас", exact: true });
  const linkBox = (await link.boundingBox())!;
  await page.mouse.move(linkBox.x + 4, linkBox.y + linkBox.height / 2);
  await page.mouse.down();
  expect(Number(await link.evaluate(node => getComputedStyle(node).opacity))).toBeLessThan(1);
  await page.mouse.up();
});
