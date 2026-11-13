// Recipe stats row: the baseline Y of every value and every label, per visual row of cells, mock and site,
// at 1440 and 390, for recipes that cover "Лесна/Средна/Трудна", three-digit minutes and "Без готвене".
//   node scripts/sofra-meta-baselines.mjs <label> [baseUrl] → docs/redesign/shots/sofra/round4/meta-<label>.json
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);
const { createLoader } = require("./load-typescript.cjs");
const { recipes } = createLoader({})(path.resolve("src/data/recipes.ts"));
const label = process.argv[2] ?? "now";
const base = process.argv[3] ?? "http://localhost:3000";
const mockUrl = pathToFileURL(path.resolve("../../docs/redesign/sofra-mock.html")).href;
const out = path.resolve("../../docs/redesign/shots/sofra/round4");
mkdirSync(out, { recursive: true });

const pick = new Map();
for (const level of ["Лесна", "Средна", "Трудна"]) { const r = recipes.find(x => x.difficulty === level); if (r) pick.set(r.slug, `трудност ${level}`); }
const long = recipes.find(x => x.prepTimeMinutes >= 100 || x.cookTimeMinutes >= 100); if (long) pick.set(long.slug, `${Math.max(long.prepTimeMinutes, long.cookTimeMinutes)} мин`);
const raw = recipes.find(x => x.cookTimeMinutes === 0); if (raw) pick.set(raw.slug, "Без готвене");

const measure = (page) => page.evaluate(() => {
  const meta = document.querySelector(".view:not([hidden]) .meta, main .meta");
  const baseline = (node) => {
    const probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    node.insertBefore(probe, node.firstChild);
    const y = probe.getBoundingClientRect().top;
    probe.remove();
    return Math.round(y * 10) / 10;
  };
  const cells = [...meta.children].map(cell => ({ top: Math.round(cell.getBoundingClientRect().top), value: baseline(cell.querySelector("dd")), label: baseline(cell.querySelector("dt")), text: cell.querySelector("dd").textContent.trim() }));
  const rows = new Map();
  for (const cell of cells) rows.set(cell.top, [...(rows.get(cell.top) ?? []), cell]);
  return [...rows.values()].map(row => ({ cells: row.map(c => c.text), valueSpread: Math.round((Math.max(...row.map(c => c.value)) - Math.min(...row.map(c => c.value))) * 10) / 10, labelSpread: Math.round((Math.max(...row.map(c => c.label)) - Math.min(...row.map(c => c.label))) * 10) / 10 }));
});

const browser = await chromium.launch();
const result = { label, rule: "baseline Y spread within each visual row of cells (px)", recipes: Object.fromEntries(pick), widths: {} };
for (const width of [1440, 390]) {
  result.widths[width] = {};
  for (const slug of pick.keys()) {
    result.widths[width][slug] = {};
    for (const which of ["mock", "site"]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      if (which === "mock") {
        await page.goto(`${mockUrl}#recipe`, { waitUntil: "load" });
        await page.waitForTimeout(500);
        const has = await page.evaluate((s) => typeof document.querySelector(`[data-slug="${s}"]`) !== "undefined", slug);
        if (has) await page.evaluate((s) => { const a = document.createElement("a"); a.href = "#recipe"; a.dataset.slug = s; document.body.append(a); a.click(); a.remove(); }, slug);
        await page.waitForTimeout(900);
      } else await page.goto(`${base}/catalog/${slug}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);
      result.widths[width][slug][which] = await measure(page);
      await page.close();
    }
  }
}
await browser.close();
writeFileSync(path.join(out, `meta-${label}.json`), JSON.stringify(result, null, 2));
for (const [width, bySlug] of Object.entries(result.widths)) for (const [slug, v] of Object.entries(bySlug)) {
  const worst = (rows) => rows.reduce((m, r) => ({ v: Math.max(m.v, r.valueSpread), l: Math.max(m.l, r.labelSpread) }), { v: 0, l: 0 });
  const m = worst(v.mock), s = worst(v.site);
  console.log(`${width} ${slug.padEnd(24)} mock value ${m.v} label ${m.l} | site value ${s.v} label ${s.l}  (${pick.get(slug)})`);
}
