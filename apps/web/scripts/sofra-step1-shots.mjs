// Sofra step 1 evidence (JPEG, quality 80) against a running production server:
//   node scripts/sofra-step1-shots.mjs [baseUrl]
// header over the hero and solid, the menu at 390, the footer, and the pages that are not redesigned
// yet (about, profile, favorites, admin, admin new/edit, 404) at 390 and 1440, plus a print PDF.
// The demo admin account is read from README.md at runtime and never printed or saved.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const out = path.resolve("../../docs/redesign/shots/sofra/step1");
mkdirSync(out, { recursive: true });
const heights = { 390: 844, 1440: 900 };
const jpeg = { type: "jpeg", quality: 80 };
const browser = await chromium.launch();
const problems = [];

function demoAdmin() {
  const line = readFileSync(path.resolve("../../README.md"), "utf8").split("\n").find((row) => /^\|\s*Admin\s*\|/.test(row));
  const fields = line ? [...line.matchAll(/`([^`]+)`/g)].map((match) => match[1]) : [];
  if (fields.length < 2) throw new Error("Documented demo admin account is unavailable");
  return { email: fields[0], password: fields[1] };
}
async function newPage(width, context) {
  const ctx = context ?? await browser.newContext({ viewport: { width, height: heights[width] }, deviceScaleFactor: 1, locale: "bg-BG" });
  const page = await ctx.newPage();
  page.on("pageerror", (error) => problems.push(`${page.url()}: ${error.message}`));
  return { ctx, page };
}
async function settle(page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 400) { await page.mouse.wheel(0, 400); await page.waitForTimeout(60); }
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

// Header over the hero and solid after it; footer.
for (const width of [390, 1440]) {
  const { ctx, page } = await newPage(width);
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(out, `header-over-hero-${width}.jpg`), clip: { x: 0, y: 0, width, height: 160 }, ...jpeg });
  await page.evaluate(() => window.scrollTo(0, document.querySelector("[data-hero]").offsetHeight + 200));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(out, `header-solid-${width}.jpg`), clip: { x: 0, y: 0, width, height: 160 }, ...jpeg });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(800);
  await page.locator("footer").screenshot({ path: path.join(out, `footer-${width}.jpg`), ...jpeg });
  await ctx.close();
}

// Menu at 390.
{
  const { ctx, page } = await newPage(390);
  await page.goto(`${base}/about`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Меню", exact: true }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(out, "menu-390.jpg"), ...jpeg });
  await ctx.close();
}

// Pages that are not redesigned yet (tokens only).
for (const width of [390, 1440]) {
  const { ctx, page } = await newPage(width);
  for (const [name, url] of [["about", "/about"], ["404", "/takava-stranitsa-nyama"]]) {
    await page.goto(base + url, { waitUntil: "networkidle" });
    await settle(page);
    await page.screenshot({ path: path.join(out, `${name}-${width}.jpg`), fullPage: true, ...jpeg });
  }
  const admin = demoAdmin();
  await page.goto(`${base}/login?next=%2Fprofile`);
  await page.getByLabel("Имейл", { exact: true }).fill(admin.email);
  await page.getByLabel("Парола", { exact: true }).fill(admin.password);
  await page.getByRole("button", { name: "Влез", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/profile");
  for (const [name, url] of [["profile", "/profile"], ["favorites", "/favorites"], ["admin", "/admin"], ["admin-new", "/admin/recipes/new"], ["admin-edit", "/admin/recipes/shopska-salata/edit"]]) {
    await page.goto(base + url, { waitUntil: "networkidle" });
    await settle(page);
    await page.screenshot({ path: path.join(out, `${name}-${width}.jpg`), fullPage: true, ...jpeg });
  }
  await ctx.close();
  console.log(`pages ${width}`);
}

// Print stays light.
{
  const { ctx, page } = await newPage(1440);
  await page.goto(`${base}/catalog/shopska-salata`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.screenshot({ path: path.join(out, "print-shopska.jpg"), fullPage: true, ...jpeg });
  writeFileSync(path.join(out, "print-shopska.pdf"), await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true }));
  await ctx.close();
}
await browser.close();
console.log(problems.length ? `page errors:\n${problems.join("\n")}` : "no page errors");
