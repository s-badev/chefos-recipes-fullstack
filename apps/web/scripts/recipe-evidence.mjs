// Stage V evidence for the recipe page against a running production server:
//   node scripts/recipe-evidence.mjs [baseUrl]
// 1. app | approved mock side by side at 390, 768 and 1440 (hero, meta row + body, actions);
// 2. ticked ingredients at 390 and 1440;
// 3. worst-pixel contrast of the white hero type (and the transparent header) against the photo + scrim.
// Screens that need a signed-in user or an admin recipe are captured by tests/recipe.spec.ts (STAGE_V_SHOTS=1).
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const mockUrl = pathToFileURL(path.resolve("../../docs/redesign/motion-mock.html")).href;
const out = path.resolve("../../docs/redesign/shots/stage-v");
mkdirSync(out, { recursive: true });
const heights = { 390: 844, 768: 1024, 1440: 900 };
const hideFixed = ".hdr,.skip-link,.skip,.back-to-top-control,.ctl{visibility:hidden!important}";
const browser = await chromium.launch();

async function openMock(page, slug) {
  await page.goto(`${mockUrl}#home`, { waitUntil: "networkidle" });
  await page.evaluate((value) => {
    const link = Object.assign(document.createElement("a"), { href: "#recipe" });
    link.dataset.slug = value;
    document.body.append(link);
    link.click();
    link.remove();
  }, slug);
  await page.waitForTimeout(1800);
}

async function readThrough(page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 300) { await page.mouse.wheel(0, 300); await page.waitForTimeout(80); }
  await page.waitForTimeout(1500);
}

async function sections(page, scope) {
  await page.addStyleTag({ content: ".ctl{visibility:hidden!important}" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  const hero = await page.screenshot();
  await readThrough(page);
  // A full-page capture would freeze the sticky ingredients column wherever the scroll left it.
  await page.addStyleTag({ content: `${hideFixed} .ings{position:static!important}` });
  const body = await page.locator(`${scope} .meta`).evaluate((node) => {
    const end = node.closest(".wrap").getBoundingClientRect();
    return { y: node.getBoundingClientRect().top + window.scrollY, h: end.bottom - node.getBoundingClientRect().top };
  });
  const width = page.viewportSize().width;
  const full = await page.screenshot({ fullPage: true, clip: { x: 0, y: body.y, width, height: body.h } });
  await page.locator(`${scope} .actions`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const actions = await page.locator(`${scope} .actions`).screenshot();
  return { hero, body: full, actions };
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

async function context(width) {
  return browser.newContext({ viewport: { width, height: heights[width] ?? 900 }, deviceScaleFactor: 1, locale: "bg-BG" });
}

// 1. Side by side.
for (const width of [390, 768, 1440]) {
  const appContext = await context(width);
  const app = await appContext.newPage();
  await app.goto(`${base}/catalog/shopska-salata`, { waitUntil: "networkidle" });
  await app.waitForTimeout(1900);
  const appShots = await sections(app, "main");
  await appContext.close();
  const mockContext = await context(width);
  const mock = await mockContext.newPage();
  await openMock(mock, "shopska-salata");
  const mockShots = await sections(mock, "#v-recipe");
  await mockContext.close();
  for (const part of ["hero", "body", "actions"]) await sideBySide(`${part}-${width}`, appShots[part], mockShots[part]);
  console.log(`saved hero/body/actions-${width}.png`);
}

// 2. Ticked ingredients (ticks are cleared again afterwards).
for (const width of [390, 1440]) {
  const ctx = await context(width);
  const page = await ctx.newPage();
  await page.goto(`${base}/catalog/shopska-salata`, { waitUntil: "networkidle" });
  for (const name of ["4 зрели домата", "1 краставица", "150 г бяло сирене"]) await page.getByRole("checkbox", { name }).check();
  await page.locator(".ings").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await page.addStyleTag({ content: hideFixed });
  await page.locator(".ings").screenshot({ path: path.join(out, `ticked-${width}.png`) });
  await page.getByRole("button", { name: "Изчисти отметките" }).click();
  await ctx.close();
  console.log(`saved ticked-${width}.png`);
}

// 3. Worst-pixel contrast: shoot the hero with the white type hidden, then compare white against every
// pixel behind each text box (relative luminance, WCAG formula).
const rows = [];
for (const slug of ["shopska-salata", "bob-chorba", "musaka-s-kartofi"]) {
  for (const width of [390, 768, 1440]) {
    const ctx = await context(width);
    const page = await ctx.newPage();
    await page.goto(`${base}/catalog/${slug}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2200); // intro zoom settled
    const boxes = await page.evaluate(() => {
      // Each box carries its real text colour and effective opacity (the logo kicker is white at .75).
      const pick = (selector, label) => [...document.querySelectorAll(selector)].map((node) => {
        const range = document.createRange(); range.selectNodeContents(node);
        let alpha = 1;
        for (let el = node; el; el = el.parentElement) alpha *= Number(getComputedStyle(el).opacity);
        const rgb = getComputedStyle(node).color.match(/[\d.]+/g).map(Number);
        return [...range.getClientRects()].filter((r) => r.width && r.height).map((r) => ({ label, x: r.x, y: r.y, w: r.width, h: r.height, rgb, alpha: alpha * (rgb[3] ?? 1) }));
      }).flat();
      return [...pick(".rh-eyebrow", "eyebrow"), ...pick(".recipe-hero h1", "h1"), ...pick(".rh-desc", "описание"), ...pick(".hdr .logo-kicker", "лого: kicker"), ...pick(".hdr .logo-name", "лого: име"), ...pick(".hdr .desktop-nav a, .hdr .menu-toggle", "навигация")];
    });
    await page.addStyleTag({ content: ".recipe-hero .hero-in,.hdr{visibility:hidden!important}" });
    await page.waitForTimeout(200);
    const png = await page.screenshot();
    const worst = await page.evaluate(async ({ data, boxes: textBoxes }) => {
      const luminanceOf = (r, g, b) => {
        const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      };
      const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode();
      const canvas = new OffscreenCanvas(image.width, image.height); const ctx2d = canvas.getContext("2d"); ctx2d.drawImage(image, 0, 0);
      const px = ctx2d.getImageData(0, 0, image.width, image.height).data;
      const result = {};
      for (const box of textBoxes) {
        for (let y = Math.max(0, Math.floor(box.y)); y < Math.min(image.height, Math.ceil(box.y + box.h)); y++) {
          for (let x = Math.max(0, Math.floor(box.x)); x < Math.min(image.width, Math.ceil(box.x + box.w)); x++) {
            const i = (y * image.width + x) * 4;
            const bg = [px[i], px[i + 1], px[i + 2]];
            const fg = bg.map((v, c) => box.alpha * box.rgb[c] + (1 - box.alpha) * v);
            const [hi, lo] = [luminanceOf(...fg), luminanceOf(...bg)].sort((a, b) => b - a);
            const ratio = (hi + 0.05) / (lo + 0.05);
            if (!(box.label in result) || ratio < result[box.label]) result[box.label] = ratio;
          }
        }
      }
      return result;
    }, { data: png.toString("base64"), boxes });
    rows.push({ slug, width, ...Object.fromEntries(Object.entries(worst).map(([k, v]) => [k, Number(v.toFixed(2))])) });
    await ctx.close();
  }
}
writeFileSync(path.join(out, "contrast.json"), JSON.stringify(rows, null, 2));
console.table(rows);
await browser.close();
