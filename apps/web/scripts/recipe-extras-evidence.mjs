// Stage V, owner decisions 1-5: evidence against a running production server.
//   node scripts/recipe-extras-evidence.mjs [baseUrl]
// back-to-top on the home page (over the dark quote), the recipe and the catalog at 390 and 1440;
// "Следваща рецепта" with hover (app | mock) at 1440 and at 390; the meta row (app | mock) at 390/768/1440.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const mockUrl = pathToFileURL(path.resolve("../../docs/redesign/motion-mock.html")).href;
const out = path.resolve("../../docs/redesign/shots/stage-v/extras");
mkdirSync(out, { recursive: true });
const heights = { 390: 844, 768: 1024, 1440: 900 };
const browser = await chromium.launch();

async function context(width) {
  return browser.newContext({ viewport: { width, height: heights[width] }, deviceScaleFactor: 1, locale: "bg-BG" });
}
async function openMockRecipe(page, slug) {
  await page.goto(`${mockUrl}#home`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".ctl{visibility:hidden!important}" });
  await page.evaluate((value) => {
    const link = Object.assign(document.createElement("a"), { href: "#recipe" });
    link.dataset.slug = value;
    document.body.append(link);
    link.click();
    link.remove();
  }, slug);
  await page.waitForTimeout(1800);
}
async function revealAll(page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 300) { await page.mouse.wheel(0, 300); await page.waitForTimeout(70); }
  await page.waitForTimeout(1300);
}
async function sideBySide(name, left, right, leftLabel = "Приложение (production build)", rightLabel = "Макет (docs/redesign/motion-mock.html)") {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const img = (buffer) => `data:image/png;base64,${buffer.toString("base64")}`;
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#cfcfcb;font:600 15px system-ui}main{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px;align-items:start}figure{margin:0}figcaption{padding:0 0 8px}img{display:block;max-width:100%;height:auto;border:1px solid #999}</style>
    <main><figure><figcaption>${leftLabel}</figcaption><img src="${img(left)}"></figure><figure><figcaption>${rightLabel}</figcaption><img src="${img(right)}"></figure></main>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
  await page.close();
}

// 1. Back to top: read down, then scroll up a little so it shows; on the home page over the dark quote.
for (const width of [390, 1440]) {
  for (const [name, url, anchor] of [["home", "/", ".quote"], ["recipe", "/catalog/bob-chorba", ".st-list"], ["catalog", "/catalog", null]]) {
    const ctx = await context(width);
    const page = await ctx.newPage();
    await page.goto(base + url, { waitUntil: "networkidle" });
    const target = await page.evaluate((selector) => {
      const footerTop = document.querySelector("footer").getBoundingClientRect().top + scrollY;
      // The home page puts the dark quote under the button (its bottom edge at the bottom of the screen).
      const node = selector && document.querySelector(selector);
      const at = !node ? 900 : selector === ".quote" ? node.getBoundingClientRect().bottom + scrollY - innerHeight + 30 : node.getBoundingClientRect().top + scrollY - innerHeight / 3;
      return Math.max(0, Math.min(at, footerTop - innerHeight - 200));
    }, anchor);
    for (let y = 0; y < target + 200; y += 200) { await page.mouse.wheel(0, Math.min(200, target + 200 - y)); await page.waitForTimeout(70); }
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(900);
    const shown = await page.evaluate(() => !document.querySelector(".back-to-top").hasAttribute("data-hidden"));
    await page.screenshot({ path: path.join(out, `back-to-top-${name}-${width}.png`) });
    if (width === 1440 && shown) {
      await page.locator(".back-to-top").hover();
      await page.waitForTimeout(600);
      await page.locator(".back-to-top").screenshot({ path: path.join(out, `back-to-top-${name}-${width}-hover.png`) });
    }
    console.log(`back-to-top ${name} ${width}: ${shown ? "shown" : "hidden (page too short to read past the first screen)"}`);
    await ctx.close();
  }
}

// 2. Next recipe: hover with the photo beside the row (1440) and the phone layout (390).
for (const width of [1440, 390]) {
  const shots = [];
  for (const which of ["app", "mock"]) {
    const ctx = await context(width);
    const page = await ctx.newPage();
    if (which === "app") await page.goto(`${base}/catalog/shopska-salata`, { waitUntil: "networkidle" });
    else await openMockRecipe(page, "shopska-salata");
    await revealAll(page);
    await page.addStyleTag({ content: ".hdr,.back-to-top,.ctl{visibility:hidden!important}" });
    const row = page.locator(".next-row").first();
    await row.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 260);
    await page.waitForTimeout(500);
    if (width === 1440) {
      const box = await row.locator(".row-t").boundingBox();
      await page.mouse.move(box.x + 60, box.y + box.height / 2, { steps: 6 });
      await page.waitForTimeout(1100);
    }
    shots.push(await page.screenshot());
    await ctx.close();
  }
  await sideBySide(`next-recipe-${width}${width === 1440 ? "-hover" : ""}`, shots[0], shots[1]);
  console.log(`next-recipe ${width}`);
}

// 3. Meta row: words smaller than numbers and on one line.
for (const width of [390, 768, 1440]) {
  const shots = [];
  for (const which of ["app", "mock"]) {
    const ctx = await context(width);
    const page = await ctx.newPage();
    if (which === "app") await page.goto(`${base}/catalog/shopska-salata`, { waitUntil: "networkidle" });
    else await openMockRecipe(page, "shopska-salata");
    await page.locator(".meta").first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page.addStyleTag({ content: ".hdr,.back-to-top,.ctl{visibility:hidden!important}" });
    shots.push(await page.locator(".meta").first().screenshot());
    await ctx.close();
  }
  await sideBySide(`meta-${width}`, shots[0], shots[1]);
  console.log(`meta ${width}`);
}
// Bob chorba's preparation note (app only: the note lives in the web layer).
{
  const ctx = await context(1440);
  const page = await ctx.newPage();
  await page.goto(`${base}/catalog/bob-chorba`, { waitUntil: "networkidle" });
  await page.locator(".meta").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await page.addStyleTag({ content: ".hdr,.back-to-top{visibility:hidden!important}" });
  await page.locator(".meta").screenshot({ path: path.join(out, "meta-bob-chorba-prep-note-1440.png") });
  await ctx.close();
}
await browser.close();
