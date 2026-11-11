// Side-by-side evidence (app | approved mock) for the home cover and the index with a hovered row.
// Usage from apps/web against a running server:  node scripts/cover-index-evidence.mjs [baseUrl]
import { mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const mockUrl = pathToFileURL(path.resolve("../../docs/redesign/motion-mock.html")).href;
const out = path.resolve("../../docs/redesign/shots/stabilization/no-numerals");
mkdirSync(out, { recursive: true });
const heights = { 390: 844, 768: 1024, 1440: 900 };
const hideFixed = ".hdr,.skip-link,.skip,.back-to-top-control{visibility:hidden!important}";
const browser = await chromium.launch();

async function readThrough(page, selector) {
  for (let i = 0; i < 40; i++) {
    const box = await page.locator(selector).first().boundingBox();
    if (box && box.y + box.height <= (page.viewportSize()?.height ?? 900)) break;
    await page.mouse.wheel(0, 250);
    await page.waitForTimeout(110);
  }
  await page.waitForTimeout(1600);
}

async function capture(url, scope, width) {
  const context = await browser.newContext({ viewport: { width, height: heights[width] }, deviceScaleFactor: 1, locale: "bg-BG" });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const cover = `${scope} .cover`;
  await page.locator(cover).scrollIntoViewIfNeeded();
  await readThrough(page, cover);
  await page.addStyleTag({ content: hideFixed });
  const coverShot = await page.locator(cover).screenshot();

  const index = `${scope} .idx`;
  await page.locator(index).scrollIntoViewIfNeeded();
  await readThrough(page, index);
  const row = page.locator(`${index} .row`).nth(3);
  await row.scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, -120);
  await page.waitForTimeout(400);
  const title = (await row.locator(".row-t").boundingBox());
  await page.mouse.move(title.x + 60, title.y + title.height / 2, { steps: 6 });
  await page.waitForTimeout(1100);
  const indexShot = await page.screenshot();
  await context.close();
  return { coverShot, indexShot };
}

async function sideBySide(name, left, right) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const img = (buffer) => `data:image/png;base64,${buffer.toString("base64")}`;
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#cfcfcb;font:600 15px system-ui}main{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px;align-items:start}figure{margin:0}figcaption{padding:0 0 8px}img{display:block;width:100%;height:auto;border:1px solid #999}</style>
    <main><figure><figcaption>Приложение (production build)</figcaption><img src="${img(left)}"></figure><figure><figcaption>Макет (docs/redesign/motion-mock.html)</figcaption><img src="${img(right)}"></figure></main>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
  await page.close();
}

for (const width of [390, 768, 1440]) {
  const app = await capture(base + "/", "main", width);
  const mock = await capture(mockUrl, "#v-home", width);
  await sideBySide(`cover-${width}`, app.coverShot, mock.coverShot);
  await sideBySide(`index-hover-${width}`, app.indexShot, mock.indexShot);
  console.log(`saved cover-${width}.png and index-hover-${width}.png`);
}
await browser.close();
