// Before/after evidence for the stabilization pass (cover numeral, word masks, category rail,
// header logo, About alignment, LCP). Usage from apps/web, against a running server:
//   node scripts/phase2-evidence.mjs <before|after> [baseUrl]
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const label = process.argv[2] ?? "after";
const base = process.argv[3] ?? "http://localhost:3000";
const out = path.resolve("../../docs/redesign/shots/stabilization/phase2", label);
mkdirSync(out, { recursive: true });
const shot = (name) => path.join(out, `${name}.png`);
/** Screenshot of an element's box grown by 40% of its height, so overflowing glyphs are not cut by the frame. */
async function padded(page, selector, name) {
  const box = await page.locator(selector).first().boundingBox();
  const pad = Math.round(box.height * 0.4);
  const viewport = page.viewportSize();
  const x = Math.max(0, box.x - pad), y = Math.max(0, box.y - pad);
  await page.screenshot({ path: shot(name), clip: { x, y, width: Math.min(viewport.width - x, box.width + pad * 2), height: box.height + pad * 2 } });
}
const sizes = { 390: { width: 390, height: 844 }, 768: { width: 768, height: 1024 }, 1024: { width: 1024, height: 768 }, 1440: { width: 1440, height: 900 } };

const browser = await chromium.launch();
const report = { label, base, lcp: {}, rail: {} };

async function open(width, url = "/", options = {}) {
  const context = await browser.newContext({ viewport: sizes[width], deviceScaleFactor: 1, locale: "bg-BG", ...options });
  const page = await context.newPage();
  await page.goto(base + url, { waitUntil: "networkidle" });
  return { context, page };
}

async function wheelTo(page, selector) {
  for (let i = 0; i < 40; i++) {
    const box = await page.locator(selector).first().boundingBox();
    if (box && box.y > 40 && box.y < 220) break;
    await page.mouse.wheel(0, box && box.y < 40 ? -200 : Math.min(400, Math.max(80, (box?.y ?? 400) - 120)));
    await page.waitForTimeout(80);
  }
}

/** Pauses every running word transition inside `scope` at `fraction` of its own duration. */
async function freezeWords(page, scope, fraction) {
  await page.waitForFunction((s) => document.querySelector(s)?.getAnimations({ subtree: true }).some((a) => a.effect?.target?.classList?.contains("wi")), scope, { timeout: 10000 }).catch(() => null);
  return page.evaluate(([s, f]) => {
    const animations = document.querySelector(s)?.getAnimations({ subtree: true }).filter((a) => a.effect?.target?.classList?.contains("wi")) ?? [];
    for (const animation of animations) {
      const timing = animation.effect.getComputedTiming();
      animation.pause();
      animation.currentTime = (timing.delay ?? 0) + (timing.duration ?? 0) * f;
    }
    return animations.length;
  }, [scope, fraction]);
}

// 1. Cover numeral at 390 / 768 / 1440 (settled).
for (const width of [390, 768, 1440]) {
  const { context, page } = await open(width);
  await wheelTo(page, ".cover");
  // Scroll through the whole section like a reader, so every reveal in it has fired.
  for (let i = 0; i < 30; i++) {
    const box = await page.locator(".cover").boundingBox();
    if (box.y + box.height <= sizes[width].height) break;
    await page.mouse.wheel(0, 250); await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1800);
  // A section taller than the viewport is captured in strips; hide fixed layers so they do not land mid-picture.
  await page.addStyleTag({ content: ".hdr,.skip-link,.back-to-top-control{visibility:hidden!important}" });
  await page.locator(".cover").screenshot({ path: shot(`cover-${width}`) });
  await context.close();
}

// 2. Word masks frozen mid-animation: 50% of the time (as requested) and 12% of the time
//    (with this strong ease-out, ~50% of the travel, where the mask edge is most visible).
for (const width of [390, 1440]) {
  for (const fraction of [0.12, 0.5]) {
    const tag = fraction === 0.5 ? "t50" : "t12";
    const context = await browser.newContext({ viewport: sizes[width], deviceScaleFactor: 2, locale: "bg-BG" });
    const page = await context.newPage();
    await page.goto(base + "/", { waitUntil: "commit" });
    report[`midHero_${tag}_${width}`] = await freezeWords(page, ".hero", fraction);
    await padded(page, ".hero h1", `mid-hero-${tag}-${width}`);
    await page.evaluate(() => document.getAnimations().forEach((a) => { if (Number.isFinite(a.effect?.getComputedTiming().endTime)) a.finish(); }));
    await wheelTo(page, "#cover-title");
    report[`midCover_${tag}_${width}`] = await freezeWords(page, "#cover-title", fraction);
    await padded(page, "#cover-title", `mid-cover-title-${tag}-${width}`);
    await context.close();
  }
}

// 3. Category rail: start and end, arrow state, keyboard video.
for (const width of [390, 1440]) {
  const { context, page } = await open(width);
  await wheelTo(page, "#rail-title");
  await page.waitForTimeout(1500);
  const section = page.locator("section", { has: page.locator("#category-rail") });
  await section.screenshot({ path: shot(`rail-start-${width}`) });
  const state = async () => page.evaluate(() => {
    const rail = document.querySelector("#category-rail");
    const buttons = [...document.querySelectorAll(".rail-head .arrows button, [data-rail-dir]")];
    return {
      title: document.querySelector("#rail-title")?.textContent?.replace(/\s+/g, " ").trim(),
      tiles: rail?.querySelectorAll("a").length,
      scrollLeft: Math.round(rail?.scrollLeft ?? 0),
      maxScroll: Math.round((rail?.scrollWidth ?? 0) - (rail?.clientWidth ?? 0)),
      buttons: buttons.map((b) => ({ label: b.getAttribute("aria-label"), disabled: b.hasAttribute("disabled") || b.getAttribute("aria-disabled") === "true" })),
      status: document.querySelector("#rail-status")?.textContent?.trim() ?? null,
      scrollbarHeight: rail ? rail.offsetHeight - rail.clientHeight : null
    };
  });
  const start = await state();
  await page.evaluate(() => { const r = document.querySelector("#category-rail"); r.scrollTo({ left: r.scrollWidth, behavior: "auto" }); });
  await page.waitForTimeout(900);
  await section.screenshot({ path: shot(`rail-end-${width}`) });
  report.rail[width] = { start, end: await state() };
  await context.close();
}
{
  const context = await browser.newContext({ viewport: sizes[1440], deviceScaleFactor: 1, locale: "bg-BG", recordVideo: { dir: out, size: { width: 1440, height: 900 } } });
  const page = await context.newPage();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await wheelTo(page, "#rail-title");
  await page.waitForTimeout(1200);
  await page.locator("#category-rail").focus();
  const keyLog = [];
  for (const key of ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "End", "ArrowLeft", "Home"]) {
    await page.keyboard.press(key);
    await page.waitForTimeout(700);
    keyLog.push({ key, scrollLeft: await page.evaluate(() => Math.round(document.querySelector("#category-rail").scrollLeft)) });
  }
  report.rail.keyboard = keyLog;
  const video = page.video();
  await context.close();
  report.rail.video = path.basename(await video.path());
}

// 4. Header: on hero and solid, logo hover and focus, mobile menu open.
for (const width of [390, 768, 1440]) {
  const { context, page } = await open(width);
  await page.waitForTimeout(1200);
  await page.locator("header").screenshot({ path: shot(`header-hero-${width}`) });
  await page.mouse.wheel(0, 1400);
  await page.waitForTimeout(900);
  await page.locator("header").screenshot({ path: shot(`header-solid-${width}`) });
  if (width === 1440) {
    await page.locator("header .logo").hover();
    await page.waitForTimeout(600);
    await page.locator("header").screenshot({ path: shot(`header-logo-hover-${width}`) });
    await page.mouse.move(700, 600);
    await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
    await page.waitForTimeout(300);
    await page.locator("header").screenshot({ path: shot(`header-logo-focus-${width}`) });
    report.logoFocused = await page.evaluate(() => document.activeElement?.classList.contains("logo") ?? false);
  } else {
    await page.getByRole("button", { name: /меню/i }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: shot(`menu-open-${width}`) });
  }
  report[`headerWrap${width}`] = await page.evaluate(() => {
    const logo = document.querySelector("header .logo");
    const header = document.querySelector("header .wrap");
    return { logoHeight: logo?.getBoundingClientRect().height, headerHeight: header?.getBoundingClientRect().height };
  });
  await context.close();
}

// 5. About: the "Ритъм" block next to its heading at 768 / 1024 / 1440.
for (const width of [768, 1024, 1440]) {
  const { context, page } = await open(width, "/about");
  await page.waitForTimeout(800);
  await page.screenshot({ path: shot(`about-${width}`) });
  await context.close();
}

// 6. LCP on the home page, production-like throttling (4x CPU, slow 4G), median of 3.
for (const width of [390, 1440]) {
  const runs = [];
  for (let run = 0; run < 3; run++) {
    const context = await browser.newContext({ viewport: sizes[width], deviceScaleFactor: 1, locale: "bg-BG" });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await page.addInitScript(() => {
      window.__lcp = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const el = entry.element;
          window.__lcp.push({ time: Math.round(entry.startTime), size: entry.size, tag: el?.tagName ?? null, id: el?.id || null, cls: el?.className?.toString?.().slice(0, 40) ?? null, text: el?.textContent?.replace(/\s+/g, " ").trim().slice(0, 40) ?? null });
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    await page.goto(base + "/", { waitUntil: "load", timeout: 120000 });
    await page.waitForTimeout(5000);
    const entries = await page.evaluate(() => window.__lcp);
    runs.push(entries.at(-1));
    await context.close();
  }
  const sorted = [...runs].sort((a, b) => a.time - b.time);
  report.lcp[width] = { median: sorted[1], runs };
}

await browser.close();
writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
