// Mock / site comparison for the Sofra redesign (JPEG, quality 80) against a running production server:
//   node scripts/sofra-compare.mjs [baseUrl] [page,page...] [outDir]
// Pages: home, catalog, recipe, auth. For each page and width (1440, 390) it saves the mock and the site
// side by side per state and writes measurements of the key blocks (box, font, colour) of both into
// docs/redesign/shots/sofra/compare/measure-<page>-<width>.json, with a list of differences.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const only = process.argv[3]?.split(",");
const mockUrl = pathToFileURL(path.resolve("../../docs/redesign/sofra-mock.html")).href;
const out = path.resolve(process.argv[4] ?? "../../docs/redesign/shots/sofra/compare");
mkdirSync(out, { recursive: true });
const heights = { 390: 844, 1440: 900 };
const browser = await chromium.launch();
const hide = ".ctl,.back-to-top-control,.back-to-top{visibility:hidden!important}";

/** Key blocks measured on both sides (same class names in the mock and the site). */
const MEASURE = {
  home: [".hero h1", ".hero .eyebrow", ".hero-row p", ".hero-cta .btn", ".hero .stitch-band, .hero .band", "#sofra .sec-h", ".sofra", ".plate", ".cat-now .cat-name", ".mini", ".week-ph", ".week-tx h2", ".facts", ".week-tx .btn", ".sec-top .sec-h", ".cards .card", ".card .ct", ".card .ce", ".card .cm", ".heart", ".story q", ".ftr-grid"],
  catalog: [".cat-head .eyebrow", ".cat-head h1", ".search", ".fbar", ".tab", ".count", ".cards .card", ".card .ct", ".card .ci"],
  recipe: [".r-hero", ".r-hero h1", ".r-hero .eyebrow", ".r-hero p", ".meta", ".meta dd", ".meta dt", ".tags", ".ings h2", ".ing", ".steps h2", ".st-n", ".st p", ".actions .btn", ".next b", ".next .ni"],
  auth: [".auth-ph", ".auth-cap h1", ".atabs", ".atab", ".auth-box h2", ".auth-box .sub", ".fld", ".fld input", ".auth-box .btn", ".alt", ".perks li", ".perks b"]
};

async function openMock(page, view, prepare) {
  await page.goto(`${mockUrl}#${view}`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  if (prepare) await prepare(page, true);
}
async function openSite(page, url, prepare) {
  await page.goto(base + url, { waitUntil: "networkidle" });
  if (prepare) await prepare(page, false);
}
async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 300) { await page.mouse.wheel(0, 300); await page.waitForTimeout(60); }
  await page.waitForTimeout(1600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.addStyleTag({ content: hide });
}
async function measure(page, scope, selectors) {
  return page.evaluate(({ scope, selectors }) => {
    const root = document.querySelector(scope);
    const top = root.getBoundingClientRect().top;
    return Object.fromEntries(selectors.map((selector) => {
      const node = root.querySelector(selector);
      if (!node) return [selector, null];
      const r = node.getBoundingClientRect(), s = getComputedStyle(node);
      return [selector, { x: Math.round(r.x), y: Math.round(r.top - top), w: Math.round(r.width), h: Math.round(r.height), font: `${s.fontFamily.split(",")[0].replace(/["']/g, "").replace(/^__|_[a-z0-9]+$/gi, "")} ${s.fontWeight} ${s.fontSize}`, color: s.color, bg: s.backgroundColor }];
    }));
  }, { scope, selectors });
}
function diff(mock, site) {
  const rows = [];
  for (const key of Object.keys(mock)) {
    const a = mock[key], b = site[key];
    if (!a || !b) { if (a || b) rows.push({ block: key, issue: a ? "missing on the site" : "missing in the mock" }); continue; }
    for (const field of ["x", "w", "h"]) if (Math.abs(a[field] - b[field]) > Math.max(6, a[field] * 0.04)) rows.push({ block: key, field, mock: a[field], site: b[field] });
    if (a.font.split(" ").slice(-2).join(" ") !== b.font.split(" ").slice(-2).join(" ")) rows.push({ block: key, field: "font weight/size", mock: a.font, site: b.font });
    if (a.color !== b.color) rows.push({ block: key, field: "color", mock: a.color, site: b.color });
  }
  return rows;
}
async function pair(name, width, mockOpen, siteOpen, { scope = "main", mockScope, selectors, clip } = {}) {
  const shots = [];
  const measured = [];
  for (const [which, open] of [["mock", mockOpen], ["site", siteOpen]]) {
    const ctx = await browser.newContext({ viewport: { width, height: heights[width] }, deviceScaleFactor: 1, locale: "bg-BG" });
    const page = await ctx.newPage();
    await open(page);
    await settle(page);
    if (clip) await clip(page, which === "mock");
    shots.push(await page.screenshot({ fullPage: !clip, type: "jpeg", quality: 80 }));
    if (selectors) measured.push(await measure(page, which === "mock" ? mockScope : scope, selectors));
    await ctx.close();
  }
  const view = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const img = (buffer) => `data:image/jpeg;base64,${buffer.toString("base64")}`;
  await view.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#3a3434;color:#fff;font:600 15px system-ui}main{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px;align-items:start}figure{margin:0}figcaption{padding:0 0 8px}img{display:block;max-width:100%;height:auto;border:1px solid #777}</style><main><figure><figcaption>Макет (sofra-mock.html)</figcaption><img src="${img(shots[0])}"></figure><figure><figcaption>Сайт (production build)</figcaption><img src="${img(shots[1])}"></figure></main>`);
  await view.waitForTimeout(200);
  await view.screenshot({ path: path.join(out, `${name}-${width}.jpg`), fullPage: true, type: "jpeg", quality: 80 });
  await view.close();
  if (selectors) writeFileSync(path.join(out, `measure-${name}-${width}.json`), JSON.stringify({ mock: measured[0], site: measured[1], differences: diff(measured[0], measured[1]) }, null, 2));
  console.log(`${name}-${width}${selectors ? ` (${diff(measured[0], measured[1]).length} differences)` : ""}`);
}

const scrollTo = (selector) => async (page, isMock) => {
  const node = page.locator(isMock ? `[data-view]:not([hidden]) ${selector}` : `main ${selector}`).first();
  await node.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
};
const sofraPick = (index) => async (page, isMock) => {
  const plates = page.locator(isMock ? "#spin .plate" : "#sofra .plate");
  await plates.nth(index).click();
  await page.waitForTimeout(1300);
};
const catalogFilter = (category, q) => async (page, isMock) => {
  if (category) await page.locator(isMock ? `.tab[data-c="${category}"]` : ".tab").filter({ hasText: category }).first().click();
  if (q !== undefined) await page.locator(isMock ? "#q" : ".search input").fill(q);
  await page.waitForTimeout(900);
};
const registerTab = async (page, isMock) => { if (isMock) await page.locator('.atab[data-mode="up"]').first().click(); await page.waitForTimeout(500); };

const jobs = {
  home: async (width) => {
    await pair("home", width, (p) => openMock(p, "home"), (p) => openSite(p, "/"), { mockScope: '[data-view="home"]', selectors: MEASURE.home });
    await pair("home-sofra-2", width, (p) => openMock(p, "home", sofraPick(2)), (p) => openSite(p, "/", sofraPick(2)), { clip: scrollTo("#sofra .sofra") });
  },
  catalog: async (width) => {
    await pair("catalog", width, (p) => openMock(p, "catalog"), (p) => openSite(p, "/catalog"), { mockScope: '[data-view="catalog"]', selectors: MEASURE.catalog });
    await pair("catalog-supi", width, (p) => openMock(p, "catalog", catalogFilter("Супи")), (p) => openSite(p, "/catalog", catalogFilter("Супи")));
    await pair("catalog-search", width, (p) => openMock(p, "catalog", catalogFilter(null, "боб")), (p) => openSite(p, "/catalog", catalogFilter(null, "боб")));
    await pair("catalog-empty", width, (p) => openMock(p, "catalog", catalogFilter(null, "няма-такава")), (p) => openSite(p, "/catalog", catalogFilter(null, "няма-такава")));
  },
  recipe: async (width) => {
    await pair("recipe", width, (p) => openMock(p, "recipe"), (p) => openSite(p, "/catalog/shopska-salata"), { mockScope: '[data-view="recipe"]', selectors: MEASURE.recipe });
  },
  auth: async (width) => {
    await pair("login", width, (p) => openMock(p, "auth"), (p) => openSite(p, "/login"), { mockScope: '[data-view="auth"]', selectors: MEASURE.auth });
    await pair("register", width, (p) => openMock(p, "auth", registerTab), (p) => openSite(p, "/register"), { mockScope: '[data-view="auth"]', selectors: MEASURE.auth });
  }
};
for (const name of only ?? Object.keys(jobs)) for (const width of [1440, 390]) await jobs[name](width);
await browser.close();
