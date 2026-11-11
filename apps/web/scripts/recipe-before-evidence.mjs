// Stage V, step 0: side-by-side evidence (app | approved mock "Рецепта" view) of the current recipe page,
// plus one temporary admin recipe without a custom image that is created, captured and deleted again.
// Usage from apps/web against a running production server:  node scripts/recipe-before-evidence.mjs [baseUrl]
// The demo admin credentials are read from README.md at runtime and are never printed or saved.
import { mkdirSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const mockUrl = pathToFileURL(path.resolve("../../docs/redesign/motion-mock.html")).href;
const out = path.resolve("../../docs/redesign/shots/stage-v/before");
mkdirSync(out, { recursive: true });
const heights = { 390: 844, 1440: 900 };
const hideFixed = ".hdr,header,.skip-link,.skip,.back-to-top-control,#recipe-preview{visibility:hidden!important}";
// App slug → the mock's slug for the same dish (the mock keeps its own sample data).
const pairs = [["shopska-salata", "shopska-salata"], ["bob-chorba", "bob-yahniya"]];
const browser = await chromium.launch();

async function readThrough(page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 300) { await page.mouse.wheel(0, 300); await page.waitForTimeout(90); }
  await page.waitForTimeout(1600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

async function fullPage(url, width, prepare) {
  const context = await browser.newContext({ viewport: { width, height: heights[width] }, deviceScaleFactor: 1, locale: "bg-BG" });
  const page = await context.newPage();
  const response = await page.goto(url, { waitUntil: "networkidle" });
  if (response && response.status() >= 400) throw new Error(`${url} answered ${response.status()}`);
  if (prepare) await prepare(page);
  await page.waitForTimeout(600);
  await readThrough(page);
  await page.addStyleTag({ content: hideFixed });
  const shot = await page.screenshot({ fullPage: true });
  await context.close();
  return shot;
}

async function sideBySide(name, left, right, leftLabel, rightLabel) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const img = (buffer) => `data:image/png;base64,${buffer.toString("base64")}`;
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#cfcfcb;font:600 15px system-ui}main{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px;align-items:start}figure{margin:0}figcaption{padding:0 0 8px}img{display:block;width:100%;height:auto;border:1px solid #999}</style>
    <main><figure><figcaption>${leftLabel}</figcaption><img src="${img(left)}"></figure><figure><figcaption>${rightLabel}</figcaption>${right ? `<img src="${img(right)}">` : "<p>Макетът няма изглед за рецепта без снимка.</p>"}</figure></main>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
  await page.close();
}

for (const [appSlug, mockSlug] of pairs) {
  for (const width of [390, 1440]) {
    const app = await fullPage(`${base}/catalog/${appSlug}`, width);
    const mock = await fullPage(`${mockUrl}#home`, width, async (page) => {
      // The mock's script is private; open the recipe the way a visitor does, through a recipe link.
      await page.evaluate((slug) => {
        const link = Object.assign(document.createElement("a"), { href: "#recipe" });
        link.dataset.slug = slug;
        document.body.append(link);
        link.click();
        link.remove();
      }, mockSlug);
      await page.waitForTimeout(1800);
    });
    await sideBySide(`${appSlug}-${width}`, app, mock, `Приложение сега: /catalog/${appSlug}`, `Макет: изглед „Рецепта“ (${mockSlug})`);
    console.log(`saved ${appSlug}-${width}.png`);
  }
}

function demoAdmin() {
  const line = readFileSync(path.resolve("../../README.md"), "utf8").split("\n").find((row) => /^\|\s*Admin\s*\|/.test(row));
  const fields = line ? [...line.matchAll(/`([^`]+)`/g)].map((match) => match[1]) : [];
  if (fields.length < 2) throw new Error("Documented demo admin account is unavailable");
  return { email: fields[0], password: fields[1] };
}

// Temporary admin recipe without an image: create → capture → delete through the admin UI → confirm 404.
const admin = demoAdmin();
const title = `Временна проверка ${randomUUID().slice(0, 8)}`;
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "bg-BG" });
const page = await context.newPage();
let slug;
try {
  await page.goto(`${base}/login?next=%2Fadmin`);
  await page.getByLabel("Имейл", { exact: true }).fill(admin.email);
  await page.getByLabel("Парола", { exact: true }).fill(admin.password);
  await page.getByRole("button", { name: "Влез", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/admin");
  await page.getByRole("link", { name: "Добави рецепта", exact: true }).first().click();
  await page.getByLabel("Заглавие", { exact: true }).fill(title);
  await page.getByLabel("Категория", { exact: true }).fill("Салати");
  await page.getByLabel("Описание", { exact: true }).fill("Временна рецепта без снимка за сравнение преди редизайна. Изтрива се веднага след снимката.");
  await page.getByLabel("Време за подготовка", { exact: true }).fill("10");
  await page.getByLabel("Време за готвене", { exact: true }).fill("0");
  await page.getByLabel("Порции", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Запази рецепта", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/admin");
  const row = page.locator(".admin-row").filter({ hasText: title });
  const href = await row.getByRole("link", { name: "Редактирай", exact: true }).getAttribute("href");
  slug = decodeURIComponent(href.split("/").at(-2));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: heights[width] });
    await page.goto(`${base}/catalog/${slug}`, { waitUntil: "networkidle" });
    await readThrough(page);
    await page.addStyleTag({ content: hideFixed });
    const shot = await page.screenshot({ fullPage: true });
    await sideBySide(`admin-no-image-${width}`, shot, null, "Приложение сега: admin рецепта без снимка (временна)", "—");
    console.log(`saved admin-no-image-${width}.png`);
  }
} finally {
  if (slug) {
    await page.goto(`${base}/admin`);
    await page.locator(".admin-row").filter({ hasText: title }).getByRole("button", { name: "Изтрий", exact: true }).click();
    await page.waitForTimeout(1500);
    const status = (await page.goto(`${base}/catalog/${slug}`)).status();
    console.log(`temporary recipe deleted, detail now answers ${status}`);
    if (status !== 404) throw new Error(`Temporary recipe ${slug} is still reachable`);
  }
  await context.close();
  await browser.close();
}
