// Round 5 evidence: mock / site side by side at 1440 and 390 (JPEG), one case at a time:
//   node scripts/sofra-round5-shots.mjs <case> <label> [baseUrl]   → docs/redesign/shots/sofra/round5/<case>-<label>-<width>.jpg
// Cases: search-focus, login-tab, heart, about, home-mobile (360/390/414 instead of 1440/390).
import { mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const [name, label = "now", base = "http://localhost:3000"] = process.argv.slice(2);
const out = path.resolve("../../docs/redesign/shots/sofra/round5");
mkdirSync(out, { recursive: true });
const mock = pathToFileURL(path.resolve("../../docs/redesign/sofra-mock.html")).href;
const mockPages = pathToFileURL(path.resolve("../../docs/redesign/sofra-mock-pages.html")).href;
const hide = ".ctl,.back-to-top{visibility:hidden!important}";

const settle = async (page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: hide });
  await page.waitForTimeout(1500);
};
/** Tab until the element matching `selector` has focus (real keyboard). */
const tabTo = async (page, selector, max = 40) => {
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    if (await page.evaluate((s) => document.activeElement?.matches(s), selector)) return true;
  }
  return false;
};
const clipOf = async (page, selector, pad = 40) => {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  const b = await el.boundingBox();
  const vw = page.viewportSize().width;
  return { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: Math.min(vw - Math.max(0, b.x - pad), b.width + pad * 2), height: b.height + pad * 2 };
};

const CASES = {
  "search-focus": { widths: [1440, 390], mock: `${mock}#catalog`, site: "/catalog", run: async (page) => { await tabTo(page, "#q, .search input"); await page.waitForTimeout(400); return clipOf(page, ".search", 48); } },
  "login-tab": { widths: [1440, 390], mock: `${mock}#auth`, site: "/login", run: async (page) => { await tabTo(page, ".auth-box button[type=submit], #a-go"); await page.waitForTimeout(300); return clipOf(page, ".auth-box", 24); } },
  heart: { widths: [1440, 390], mock: `${mock}#catalog`, site: "/catalog", run: async (page) => {
    const card = page.locator(".cards .card:visible").nth(1);
    await card.evaluate(node => node.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(600);
    const b = await card.locator(".heart").boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(500);
    const c = await card.boundingBox();
    return { x: Math.max(0, c.x - 16), y: Math.max(0, c.y - 16), width: c.width + 32, height: Math.min(c.height + 32, 520) };
  } },
  about: { widths: [1440, 390], mock: `${mockPages}#about`, site: "/about", run: async () => null },
  "home-mobile": { widths: [360, 390, 414], mock: `${mock}#home`, site: "/", run: async () => null }
};

const job = CASES[name];
if (!job) throw new Error(`unknown case ${name}`);
const browser = await chromium.launch();
for (const width of job.widths) {
  const shots = [];
  for (const [which, url] of [["Макет", job.mock], ["Сайт", base + job.site]]) {
    const page = await browser.newPage({ viewport: { width, height: width <= 414 ? 844 : 900 }, deviceScaleFactor: 1, isMobile: width <= 414, hasTouch: width <= 414 });
    await page.goto(url, { waitUntil: which === "Сайт" ? "networkidle" : "load" });
    await settle(page);
    const clip = await job.run(page);
    shots.push({ which, data: (await page.screenshot({ type: "jpeg", quality: 80, ...(clip ? { clip } : { fullPage: name === "about" }) })).toString("base64") });
    await page.close();
  }
  const view = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await view.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#3a3434;color:#fff;font:600 14px system-ui;padding:14px}main{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}figcaption{margin-bottom:6px}img{display:block;max-width:100%;height:auto;border:1px solid #777}</style><h1 style="font-size:16px">${name} · ${label} · ${width}px</h1><main>${shots.map(s => `<figure style="margin:0"><figcaption>${s.which}</figcaption><img src="data:image/jpeg;base64,${s.data}"></figure>`).join("")}</main>`);
  await view.waitForTimeout(200);
  await view.screenshot({ path: path.join(out, `${name}-${label}-${width}.jpg`), fullPage: true, type: "jpeg", quality: 80 });
  await view.close();
  console.log(`${name}-${label}-${width}.jpg`);
}
await browser.close();
