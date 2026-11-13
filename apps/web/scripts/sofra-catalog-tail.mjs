// The last rows of the catalog grid for N = 24…32 (24 curated + k manual recipes without a photograph) at 1440,
// 1024, 768 and 390, and Favorites with 1…8 cards at 1440 and 390: the real RecipeTile markup with sample data
// placed into the production catalog page. Checks that the last row has no empty columns (catalog) and writes
// JPEG strips + JSON to docs/redesign/shots/sofra/round4/.   node scripts/sofra-catalog-tail.mjs [baseUrl]
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);
const { createLoader } = require("./load-typescript.cjs");
const base = process.argv[2] ?? "http://localhost:3000";
const out = path.resolve("../../docs/redesign/shots/sofra/round4");
mkdirSync(out, { recursive: true });
const h = React.createElement;
const load = createLoader({
  "server-only": {},
  "next/link": { __esModule: true, default: ({ href, children, ...props }) => h("a", { href, ...props }, children) },
  "next/image": { __esModule: true, default: ({ src, alt, sizes }) => h("img", { src, alt, sizes, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } }) },
  "./card-heart": { CardHeart: ({ title, saved }) => h("form", { className: "heart-form" }, h("button", { className: "heart", type: "button", "aria-pressed": saved, "aria-label": `Запази в любими: ${title}` }, h("span", { className: "heart-ico", "aria-hidden": "true" }, h("svg", { viewBox: "0 0 24 24" }, h("path", { d: "M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3 5 6.5 5c2 0 3.5 1.1 5.5 3 2-1.9 3.5-3 5.5-3C21 5 22.8 8.6 21.5 11.8 19.5 16.4 12 21 12 21z" }))))) }
});
const { recipes } = load(path.resolve("src/data/recipes.ts"));
const { toCardRecipe } = load(path.resolve("src/lib/catalog.ts"));
const { catalogVariants } = load(path.resolve("src/lib/catalog-layout.ts"));
const { RecipeTile } = load(path.resolve("src/app/recipe-tile.tsx"));
const extra = ["Пиле с ориз", "Леща яхния", "Пиле терияки", "Мусака с тиквички", "Ябълков пай", "Печен патладжан", "Риба на фурна", "Крем с шоколад"]
  .map((title, i) => ({ ...toCardRecipe(recipes[i]), slug: `primer-${i}`, title, imageSrc: undefined, imageAlt: undefined }));
const cards = (list, layout) => renderToStaticMarkup(h(React.Fragment, null, list.map((recipe, index) => h(RecipeTile, {
  key: recipe.slug, recipe, index, redirectTo: "/catalog", reveal: false, saved: false,
  variant: layout ? layout[index] : "", oddLast: layout ? list.length % 2 === 1 && index === list.length - 1 : false
}))));

const browser = await chromium.launch();
const result = { catalog: {}, favorites: {} };
const strips = {};
async function shoot(width, html, key, rows) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(`${base}/catalog`, { waitUntil: "networkidle" });
  await page.evaluate((markup) => { const grid = document.querySelector(".cards.cat"); grid.innerHTML = markup; grid.classList.remove("swap"); }, html);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const info = await page.evaluate((rowsWanted) => {
    const grid = document.querySelector(".cards.cat");
    const g = grid.getBoundingClientRect();
    const items = [...grid.children].map(c => { const r = c.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), left: r.left, right: r.right, bottom: r.bottom + scrollY, cls: c.className }; });
    const tops = [...new Set(items.map(i => i.top))].sort((a, b) => a - b);
    const last = items.filter(i => i.top === tops.at(-1));
    const filled = Math.round((Math.max(...last.map(i => i.right)) - Math.min(...last.map(i => i.left))) / g.width * 1000) / 10;
    const from = tops[Math.max(0, tops.length - rowsWanted)];
    return { rows: tops.length, lastRow: last.map(i => i.cls.replace(/^card\s*/, "")), lastRowFilledPct: filled, clip: { y: from - 24, h: Math.max(...items.map(i => i.bottom)) - from + 48, x: g.left } };
  }, rows);
  await page.evaluate((y) => window.scrollTo(0, y), info.clip.y);
  await page.waitForTimeout(300);
  const shot = await page.screenshot({ type: "jpeg", quality: 70, fullPage: true, clip: { x: 0, y: info.clip.y, width, height: Math.min(info.clip.h, 2400) } });
  (strips[key] ??= []).push({ label: key.startsWith("fav") ? `${rows === 99 ? "" : ""}` : "", shot, info });
  await page.close();
  return { info, shot };
}
for (const width of [1440, 1024, 768, 390]) {
  for (let k = 0; k <= 8; k++) {
    const list = [...recipes.map(toCardRecipe), ...extra.slice(0, k)];
    const { info, shot } = await shoot(width, cards(list, catalogVariants(list.length)), `catalog-${width}`, width === 390 ? 2 : 3);
    result.catalog[`${width}/N=${list.length}`] = info;
    strips[`catalog-${width}`].at(-1).label = `N = ${list.length} · последен ред: ${info.lastRow.join(", ")} · запълнен ${info.lastRowFilledPct}%`;
    void shot;
  }
}
for (const width of [1440, 390]) {
  for (let n = 1; n <= 8; n++) {
    const list = [...recipes.slice(0, n - Math.min(n, 2)).map(toCardRecipe), ...extra.slice(0, Math.min(n, 2))];
    const { info } = await shoot(width, cards(list, catalogVariants(list.length)), `favorites-${width}`, 99);
    result.favorites[`${width}/N=${n}`] = info;
    strips[`favorites-${width}`].at(-1).label = `Любими · ${n} ${n === 1 ? "карта" : "карти"} · последен ред запълнен ${info.lastRowFilledPct}%`;
  }
}
const view = await browser.newPage({ viewport: { width: 1600, height: 900 } });
for (const [key, list] of Object.entries(strips)) {
  const scale = key.endsWith("390") ? 0.6 : 0.42;
  await view.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#3a3434;color:#fff;font:600 14px system-ui;padding:14px}figure{margin:0 0 18px;display:inline-block;vertical-align:top;margin-right:14px}figcaption{margin-bottom:6px;max-width:${Math.round((key.endsWith("390") ? 390 : +key.split("-")[1]) * scale)}px}img{display:block;border:1px solid #777}</style><h1 style="font-size:18px">${key}</h1>${list.map(s => `<figure><figcaption>${s.label}</figcaption><img src="data:image/jpeg;base64,${s.shot.toString("base64")}" width="${Math.round((key.endsWith("390") ? 390 : +key.split("-")[1]) * scale)}"></figure>`).join("")}`);
  await view.waitForTimeout(300);
  await view.screenshot({ path: path.join(out, `tail-${key}.jpg`), fullPage: true, type: "jpeg", quality: 78 });
}
await browser.close();
writeFileSync(path.join(out, "tail.json"), JSON.stringify(result, null, 2));
for (const [key, v] of Object.entries(result.catalog)) console.log(key.padEnd(14), v.lastRow.join(",").padEnd(36), v.lastRowFilledPct + "%");
for (const [key, v] of Object.entries(result.favorites)) console.log(key.padEnd(14), v.lastRow.join(",").padEnd(36), v.lastRowFilledPct + "%");
