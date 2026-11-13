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
    // Calm: one slow pulse; the state is there at once (no delayed fade that leaves empty frames between pages).
    const timing = await page.evaluate(() => ({
      pulse: getComputedStyle(document.querySelector(".cat-loading .sk")!).animationDuration,
      opacity: getComputedStyle(document.querySelector(".cat-loading > div")!).opacity
    }));
    expect(parseFloat(timing.pulse)).toBeGreaterThanOrEqual(1.2);
    expect(timing.opacity).toBe("1");
    // The real title is visible in the loading state (not waiting under a reveal mask).
    const title = (await page.locator(".cat-loading .cat-h1").boundingBox())!;
    expect(title.height).toBeGreaterThan(30);
    expect(await page.locator(".cat-loading .cat-h1").evaluate(node => [...node.querySelectorAll("*")].every(el => getComputedStyle(el).transform === "none"))).toBe(true);
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

test("client navigation shows one screen at a time: <main> never transparent, at most one underlined menu item, titles never drop", async ({ page }) => {
  for (const [from, link] of [["/", "header nav a[href='/about']"], ["/about", "header nav a[href='/catalog']"]] as const) {
    await page.goto(from, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const w = window as unknown as { __frames: Array<{ opacity: number; underlined: number; drop: number }> };
      w.__frames = [];
      const t0 = performance.now();
      const tick = () => {
        const main = document.getElementById("main-content")!;
        const underlined = [...document.querySelectorAll(".desktop-nav a")].filter(a => { const m = getComputedStyle(a, "::after").transform; return m !== "none" && !m.startsWith("matrix(0,"); }).length;
        const drop = Math.max(0, ...[...document.querySelectorAll("main :is(.hero,.r-hero,.nf-tx,.pg-head,.auth-cap) [data-split] .wi")].map(wi => { const m = new DOMMatrix(getComputedStyle(wi).transform); return m.m42; }));
        w.__frames.push({ opacity: Number(getComputedStyle(main).opacity), underlined, drop });
        if (performance.now() - t0 < 1400) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.locator(link).click();
    await page.waitForTimeout(1500);
    const frames = await page.evaluate(() => (window as unknown as { __frames: Array<{ opacity: number; underlined: number; drop: number }> }).__frames);
    expect(frames.length).toBeGreaterThan(20);
    expect(Math.min(...frames.map(f => f.opacity)), `${from}: <main> opacity`).toBe(1);
    expect(Math.max(...frames.map(f => f.underlined)), `${from}: underlined menu items`).toBeLessThanOrEqual(1);
    expect(Math.max(...frames.map(f => f.drop)), `${from}: hero title words pushed down`).toBeLessThanOrEqual(0.5);
  }
});
