// Hero on a slow connection: frames at 0.5 / 1 / 1.5 / 2 / 3 / 4 s after navigation start (4× CPU, slow 4G:
// 150 ms RTT, 1.6 Mbps down, cold cache) for Home, Recipe and About at 390×844 and 1440×900, plus when the hero
// photograph first paints (an <img> that is complete and decoded inside the hero).
//   node scripts/sofra-hero-filmstrip.mjs <label> [baseUrl] → docs/redesign/shots/sofra/round4/hero-<label>.{jpg,json}
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const label = process.argv[2] ?? "now";
const base = process.argv[3] ?? "http://localhost:3000";
const out = path.resolve("../../docs/redesign/shots/sofra/round4");
mkdirSync(out, { recursive: true });
const PAGES = [["Начало", "/", ".hero .hero-ph img"], ["Рецепта", "/catalog/shopska-salata", ".r-hero .hero-ph img"], ["За нас", "/about", ".r-hero .hero-ph img"]];
const TIMES = [500, 1000, 1500, 2000, 3000, 4000];

const browser = await chromium.launch();
const rows = [], result = {};
for (const [width, height, mobile] of [[390, 844, true], [1440, 900, false]]) {
  for (const [name, url, heroSelector] of PAGES) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile, locale: "bg-BG" });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript((sel) => {
      window.__hero = { painted: 0, lcp: 0, lcpEl: "" };
      new PerformanceObserver((list) => { for (const e of list.getEntries()) { window.__hero.lcp = e.startTime; window.__hero.lcpEl = e.element?.tagName ?? ""; } }).observe({ type: "largest-contentful-paint", buffered: true });
      const poll = () => {
        const img = document.querySelector(sel);
        if (img && img.complete && img.naturalWidth > 0 && !window.__hero.painted) { img.decode().then(() => { if (!window.__hero.painted) window.__hero.painted = performance.now(); }); }
        if (!window.__hero.painted) requestAnimationFrame(poll);
      };
      requestAnimationFrame(poll);
    }, heroSelector);
    const start = Date.now();
    const nav = page.goto(base + url, { waitUntil: "load", timeout: 120_000 });
    const frames = [];
    for (const t of TIMES) {
      const wait = start + t - Date.now();
      if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
      const shot = await page.screenshot({ type: "jpeg", quality: 60, scale: "css" }).catch(() => null);
      frames.push({ t, at: Date.now() - start, shot });
    }
    await nav.catch(() => undefined);
    await page.waitForTimeout(1500);
    const hero = await page.evaluate((sel) => {
      const img = document.querySelector(sel);
      return { ...window.__hero, fetchPriority: img?.getAttribute("fetchpriority") ?? null, loading: img?.getAttribute("loading") ?? null, currentSrc: img?.currentSrc?.replace(location.origin, "") ?? null };
    }, heroSelector);
    result[`${name} ${width}`] = { heroPaintedMs: Math.round(hero.painted), lcpMs: Math.round(hero.lcp), lcpEl: hero.lcpEl, fetchPriority: hero.fetchPriority, loading: hero.loading, src: hero.currentSrc, frames: frames.map(f => f.at) };
    rows.push({ title: `${name} · ${width}×${height} · снимката видима ≈ ${Math.round(hero.painted)} ms · LCP ${Math.round(hero.lcp)} ms (${hero.lcpEl})`, frames, width });
    await context.close();
  }
}
const view = await browser.newPage({ viewport: { width: 1800, height: 900 } });
await view.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#3a3434;color:#fff;font:600 13px system-ui;padding:14px}h2{font-size:14px;margin:18px 0 6px}section{display:flex;gap:10px}figure{margin:0}figcaption{font-weight:500;margin-bottom:4px}img{display:block;border:1px solid #777}</style><h1 style="font-size:17px">Hero при бавна връзка (4× CPU, бавна 4G, студен кеш) · ${label}</h1>${rows.map(r => `<h2>${r.title}</h2><section>${r.frames.map(f => `<figure><figcaption>${(f.t / 1000).toFixed(1)} s</figcaption>${f.shot ? `<img src="data:image/jpeg;base64,${f.shot.toString("base64")}" width="${r.width === 390 ? 180 : 280}">` : "—"}</figure>`).join("")}</section>`).join("")}`);
await view.screenshot({ path: path.join(out, `hero-${label}.jpg`), fullPage: true, type: "jpeg", quality: 80 });
await browser.close();
writeFileSync(path.join(out, `hero-${label}.json`), JSON.stringify(result, null, 2));
for (const [key, v] of Object.entries(result)) console.log(key.padEnd(14), "hero painted", v.heroPaintedMs, "ms · LCP", v.lcpMs, v.lcpEl, "· fetchpriority", v.fetchPriority, "· loading", v.loading, "·", v.src);
