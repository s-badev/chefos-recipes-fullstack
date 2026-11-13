// Client navigation, frame by frame (CDP screencast, one frame per paint, ~16 ms apart when the page moves):
// Home → About, Catalog → Recipe, About → Catalog (Favorites → Catalog needs a sign-in; About → Catalog takes the same
// route into the catalog). Writes a contact sheet of the first 900 ms per navigation and the DOM state of every frame:
//   node scripts/sofra-transition-frames.mjs <label> [baseUrl] → docs/redesign/shots/sofra/round4/transition-<label>.{jpg,json}
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const label = process.argv[2] ?? "now";
const base = process.argv[3] ?? "http://localhost:3000";
const out = path.resolve("../../docs/redesign/shots/sofra/round4");
mkdirSync(out, { recursive: true });
const NAVS = [
  ["Начало → За нас", "/", "header nav a[href='/about']"],
  ["Рецепти → Рецепта", "/catalog", ".cards .card .cb >> nth=0"],
  ["За нас → Рецепти", "/about", "header nav a[href='/catalog']"]
];
const browser = await chromium.launch();
const sheet = [], result = {};
for (const [name, from, link] of NAVS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + from, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", async ({ data, sessionId, metadata }) => {
    frames.push({ t: metadata.timestamp, data });
    await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => undefined);
  });
  // A DOM probe per animation frame: how many page roots are in <main>, the opacity of <main>, the loading state.
  await page.evaluate(() => {
    window.__probe = [];
    const t0 = performance.now();
    const tick = () => {
      const main = document.getElementById("main-content");
      const style = main ? getComputedStyle(main) : null;
      window.__probe.push({ t: Math.round(performance.now() - t0), path: location.pathname, children: main?.children.length ?? 0, loading: !!document.querySelector(".cat-loading"), opacity: style?.opacity, transform: style?.transform, h1: [...document.querySelectorAll("main h1")].map(h => h.textContent.trim().slice(0, 24)) });
      if (performance.now() - t0 < 1500) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 55, maxWidth: 720, maxHeight: 450, everyNthFrame: 1 });
  const clickAt = Date.now() / 1000;
  await page.locator(link).first().click();
  await page.waitForTimeout(1600);
  await cdp.send("Page.stopScreencast");
  const probe = await page.evaluate(() => window.__probe);
  const twoTitles = probe.filter(p => p.h1.length > 1).length;
  result[name] = { frames: frames.length, framesWithTwoH1: twoTitles, probe };
  sheet.push({ name, frames: frames.filter(f => f.t - clickAt <= 0.9).map(f => ({ ms: Math.round((f.t - clickAt) * 1000), data: f.data })) });
  await page.close();
}
const view = await browser.newPage({ viewport: { width: 1800, height: 900 } });
await view.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#3a3434;color:#fff;font:600 12px system-ui;padding:12px}h2{font-size:14px;margin:16px 0 6px}section{display:flex;flex-wrap:wrap;gap:6px}figure{margin:0}figcaption{font-weight:500}img{display:block;width:216px;border:1px solid #777}</style><h1 style="font-size:16px">Клиентска навигация, кадър по кадър (CDP screencast) · ${label}</h1>${sheet.map(s => `<h2>${s.name} · ${s.frames.length} кадъра за 0,9 s</h2><section>${s.frames.map(f => `<figure><figcaption>${f.ms} ms</figcaption><img src="data:image/jpeg;base64,${f.data}"></figure>`).join("")}</section>`).join("")}`);
await view.screenshot({ path: path.join(out, `transition-${label}.jpg`), fullPage: true, type: "jpeg", quality: 72 });
await browser.close();
writeFileSync(path.join(out, `transition-${label}.json`), JSON.stringify(result, null, 2));
for (const [name, v] of Object.entries(result)) console.log(name.padEnd(20), "frames", v.frames, "· frames with two h1 in <main>", v.framesWithTwoH1, "· loading state seen", v.probe.some(p => p.loading));
