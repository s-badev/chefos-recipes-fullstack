// Mock / site comparison for About, Favorites, Profile and 404 (JPEG, quality 80) against a running
// production server:   node scripts/sofra-pages-compare.mjs [baseUrl] [job,job...] [outDir]
// Jobs: about, notfound, favorites-empty, favorites, profile, profile-empty. Saves the mock (docs/redesign/sofra-mock-pages.html)
// and the site side by side at 1440 and 390, plus block measurements (box, font, colour) of both into
// docs/redesign/shots/sofra/pages/measure-<job>-<width>.json.
//
// Favorites and Profile need a signed-in user, and showing them for a real account can write to the
// database (the favourites user row). So these states are the REAL page components rendered with mocked
// services (scripts/load-typescript.cjs, no database) and placed into the site's own page shell
// (header, footer, production CSS). They are marked "rendered with sample data" on the image.
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);
const { createLoader } = require("./load-typescript.cjs");
const base = process.argv[2] ?? "http://localhost:3000";
const only = process.argv[3]?.split(",");
const mockUrl = pathToFileURL(path.resolve("../../docs/redesign/sofra-mock-pages.html")).href;
const out = path.resolve(process.argv[4] ?? "../../docs/redesign/shots/sofra/pages");
mkdirSync(out, { recursive: true });
const heights = { 390: 844, 1440: 900 };
const hide = ".ctl,.back-to-top{visibility:hidden!important}";
const browser = await chromium.launch();

const HEART = "M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3 5 6.5 5c2 0 3.5 1.1 5.5 3 2-1.9 3.5-3 5.5-3C21 5 22.8 8.6 21.5 11.8 19.5 16.4 12 21 12 21z";
const h = React.createElement;
const root = path.resolve(".");
const { recipes } = createLoader({})(path.join(root, "src/data/recipes.ts"));
/** The three favourites of the mock, in the repository's order (by title). */
const sampleFavorites = ["shopska-salata", "tikvenik", "mekitsi"].map(slug => recipes.find(recipe => recipe.slug === slug))
  .sort((a, b) => a.title.localeCompare(b.title, "bg"));

function rendered(file, services) {
  const load = createLoader({
    "server-only": {},
    "next/image": { __esModule: true, default: ({ src, alt, sizes }) => h("img", { src, alt, sizes, style: { position: "absolute", inset: 0, width: "100%", height: "100%" } }) },
    "next/link": { __esModule: true, default: ({ href, children, ...props }) => h("a", { href, ...props }, children) },
    // Same markup as the real client heart (card-heart.tsx), without the server action.
    "./card-heart": { CardHeart: ({ title, saved }) => h("form", { className: "heart-form" }, h("button", { className: "heart", type: "button", "aria-pressed": saved, "aria-label": `${saved ? "Премахни от любими" : "Запази в любими"}: ${title}` }, h("span", { className: "heart-ico", "aria-hidden": "true" }, h("span", { className: "ring" }), h("svg", { viewBox: "0 0 24 24" }, h("path", { d: HEART }))))) },
    ...services
  });
  return async () => renderToStaticMarkup(await load(path.join(root, file)).default());
}
const favoritesPage = (list) => rendered("src/app/favorites/page.tsx", {
  "../../server/favorites/service": { getCurrentUserFavoriteRecipes: async () => list },
  "../../server/recipes/web-image": { withWebRecipeImage: async (recipe) => recipe }
});
/** The mock's profile: Мария, three favourites (or none), a long e-mail. */
const profilePage = (saved) => rendered("src/app/profile/page.tsx", {
  "../../server/auth/session": { requireUser: async () => ({ name: "Мария", email: "maria.petrova.recepti@example.com", role: "user" }) },
  "../../server/favorites/service": { getCurrentUserFavoriteSlugs: async () => sampleFavorites.slice(0, saved).map(recipe => recipe.slug) },
  "../../server/auth/actions": { logoutAction: async () => undefined }
});

const MEASURE = {
  about: [".r-hero", ".r-hero h1", ".r-hero .eyebrow", ".hero-in > p:not(.eyebrow)", ".rhythm li", ".cols3", ".col h3", ".col p", ".cap-side .sec-h", ".cap-li", ".cap-li .st-n", ".cap-li h3", ".princ-ph", ".princ-list li", ".princ-list h3", ".why-tx .sec-h", ".why-nx .perks li", ".why-nx .btn"],
  notfound: [".nf .eyebrow", ".nf h1", ".nf .t", ".nf-cta .btn", ".sofra", ".plate", ".plate.gap .pi"],
  "favorites-empty": [".pg-head .eyebrow", ".pg-head h1", ".pg-head .lead", ".fav-empty", ".fav-empty h2", ".fav-empty .t", ".fe-table", ".fe-tx .btn"],
  favorites: [".pg-head .eyebrow", ".pg-head h1", ".pg-head .lead", ".fav-top", ".fav-top .eyebrow", ".fav-top .link", ".cards .card", ".card .ci", ".card .ct", ".card .cm", ".heart"],
  profile: [".pg-head .eyebrow", ".pg-head h1", ".pg-head .lead", ".meta.m2", ".meta.m2 dd", ".meta.m2 dd.mail", ".meta.m2 dt", ".prof-cols h2", ".prof-cols p", ".prof-cols .btn"],
  "profile-empty": [".pg-head .lead", ".meta.m2 dd", ".prof-cols p", ".prof-cols .btn"]
};

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 300) { await page.mouse.wheel(0, 300); await page.waitForTimeout(60); }
  await page.waitForTimeout(1600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.addStyleTag({ content: hide });
}
async function measure(page, scope, selectors) {
  return page.evaluate(({ scope, selectors }) => {
    const box = document.querySelector(scope);
    const top = box.getBoundingClientRect().top;
    return Object.fromEntries(selectors.map((selector) => {
      const node = box.querySelector(selector);
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
    for (const field of ["x", "y", "w", "h"]) if (Math.abs(a[field] - b[field]) > Math.max(6, Math.abs(a[field]) * 0.04)) rows.push({ block: key, field, mock: a[field], site: b[field] });
    if (a.font.split(" ").slice(-2).join(" ") !== b.font.split(" ").slice(-2).join(" ")) rows.push({ block: key, field: "font weight/size", mock: a.font, site: b.font });
    if (a.color !== b.color) rows.push({ block: key, field: "color", mock: a.color, site: b.color });
  }
  return rows;
}

const openMock = (view, empty = false) => async (page) => {
  await page.goto(`${mockUrl}#${view}`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  if (empty) { await page.locator("#ctl-tg").click(); await page.locator(`#c-view .chip[data-v="${view}0"]`).click(); await page.waitForTimeout(1200); }
};
const openSite = (url) => async (page) => { await page.goto(base + url, { waitUntil: "networkidle" }); };
/** The site's own shell (a page without a hero), with the rendered page component as <main>'s content. */
const openRendered = (render) => async (page) => {
  const markup = await render();
  await page.goto(`${base}/sofra-pages-compare-shell`, { waitUntil: "networkidle" });
  await page.evaluate((html) => { document.querySelector("main").innerHTML = html; }, markup);
  await page.waitForLoadState("networkidle");
};

async function pair(name, width, mockOpen, siteOpen, { note = "Сайт (production build)" } = {}) {
  const shots = [], measured = [];
  for (const [which, open] of [["mock", mockOpen], ["site", siteOpen]]) {
    const ctx = await browser.newContext({ viewport: { width, height: heights[width] }, deviceScaleFactor: 1, locale: "bg-BG" });
    const page = await ctx.newPage();
    await open(page);
    await settle(page);
    shots.push(await page.screenshot({ fullPage: true, type: "jpeg", quality: 80 }));
    measured.push(await measure(page, which === "mock" ? ".view:not([hidden])" : "main", MEASURE[name]));
    await ctx.close();
  }
  const view = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const img = (buffer) => `data:image/jpeg;base64,${buffer.toString("base64")}`;
  await view.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#3a3434;color:#fff;font:600 15px system-ui}main{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px;align-items:start}figure{margin:0}figcaption{padding:0 0 8px}img{display:block;max-width:100%;height:auto;border:1px solid #777}</style><main><figure><figcaption>Макет (sofra-mock-pages.html)</figcaption><img src="${img(shots[0])}"></figure><figure><figcaption>${note}</figcaption><img src="${img(shots[1])}"></figure></main>`);
  await view.waitForTimeout(200);
  await view.screenshot({ path: path.join(out, `${name}-${width}.jpg`), fullPage: true, type: "jpeg", quality: 80 });
  await view.close();
  const differences = diff(measured[0], measured[1]);
  writeFileSync(path.join(out, `measure-${name}-${width}.json`), JSON.stringify({ mock: measured[0], site: measured[1], differences }, null, 2));
  console.log(`${name}-${width}: ${differences.length} differences`);
}

const RENDERED = "Сайт: реалният компонент с примерни данни (без вход и база), в обвивката на production build";
const jobs = {
  about: (w) => pair("about", w, openMock("about"), openSite("/about")),
  notfound: (w) => pair("notfound", w, openMock("notfound"), openSite("/niama-takava-stranica")),
  "favorites-empty": (w) => pair("favorites-empty", w, openMock("favorites", true), openRendered(favoritesPage([])), { note: RENDERED }),
  favorites: (w) => pair("favorites", w, openMock("favorites"), openRendered(favoritesPage(sampleFavorites)), { note: RENDERED }),
  profile: (w) => pair("profile", w, openMock("profile"), openRendered(profilePage(3)), { note: RENDERED }),
  "profile-empty": (w) => pair("profile-empty", w, openMock("profile", true), openRendered(profilePage(0)), { note: RENDERED })
};
for (const name of only ?? Object.keys(jobs)) for (const width of [1440, 390]) await jobs[name](width);
await browser.close();
