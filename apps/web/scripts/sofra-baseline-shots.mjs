// Sofra step 0: full-page screenshots of the approved mock (docs/redesign/sofra-mock.html) and of the
// current production build, at 390, 768, 1440 and 1920 (JPEG, quality 80).
//   node scripts/sofra-baseline-shots.mjs [baseUrl]
// Mock views: home, catalog, recipe, login and register (the "Регистрация" tab of the auth view).
import { mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const mockUrl = pathToFileURL(path.resolve("../../docs/redesign/sofra-mock.html")).href;
const root = path.resolve("../../docs/redesign/shots/sofra");
const widths = [390, 768, 1440, 1920];
const heights = { 390: 844, 768: 1024, 1440: 900, 1920: 1080 };
const browser = await chromium.launch();

async function readThrough(page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 300) { await page.mouse.wheel(0, 300); await page.waitForTimeout(70); }
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
}

async function capture(dir, name, width, open) {
  const context = await browser.newContext({ viewport: { width, height: heights[width] }, deviceScaleFactor: 1, locale: "bg-BG" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await open(page);
  await page.waitForTimeout(1200);
  await readThrough(page);
  // Fixed layers would repeat or float in a full-page capture; the mock's control panel is not part of the design.
  await page.addStyleTag({ content: ".ctl,.back-to-top-control{visibility:hidden!important}" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.screenshot({ path: path.join(dir, `${name}-${width}.jpg`), fullPage: true, type: "jpeg", quality: 80 });
  await context.close();
  console.log(`${path.basename(dir)}/${name}-${width}.jpg overflowX=${overflow}${errors.length ? ` errors=${errors.join(" | ")}` : ""}`);
}

const mockViews = [
  ["home", (page) => page.goto(`${mockUrl}#home`, { waitUntil: "load" })],
  ["catalog", (page) => page.goto(`${mockUrl}#catalog`, { waitUntil: "load" })],
  ["recipe", (page) => page.goto(`${mockUrl}#recipe`, { waitUntil: "load" })],
  ["login", (page) => page.goto(`${mockUrl}#auth`, { waitUntil: "load" })],
  ["register", async (page) => { await page.goto(`${mockUrl}#auth`, { waitUntil: "load" }); await page.waitForTimeout(800); await page.locator('.atab[data-mode="up"]').first().click(); }]
];
const appPages = [
  ["home", "/"],
  ["catalog", "/catalog"],
  ["recipe-shopska-salata", "/catalog/shopska-salata"],
  ["login", "/login"],
  ["register", "/register"]
];

const mockDir = path.join(root, "mock");
const beforeDir = path.join(root, "before");
mkdirSync(mockDir, { recursive: true });
mkdirSync(beforeDir, { recursive: true });
for (const width of widths) {
  for (const [name, open] of mockViews) await capture(mockDir, name, width, open);
  for (const [name, url] of appPages) await capture(beforeDir, name, width, (page) => page.goto(base + url, { waitUntil: "networkidle" }));
}
await browser.close();
