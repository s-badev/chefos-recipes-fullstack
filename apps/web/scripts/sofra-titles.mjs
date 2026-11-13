// About: the space between the hero title and the paragraph under it; 404: the lines of the title.
// Mock and a running production server, at 1440 and 390:   node scripts/sofra-titles.mjs <label> [baseUrl]
// Gap = top of the paragraph's first text line minus the bottom of the title's last text line (font boxes,
// so descenders count). Writes docs/redesign/shots/sofra/round3/titles-<label>.json.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const label = process.argv[2] ?? "now";
const base = process.argv[3] ?? "http://localhost:3000";
const mockUrl = pathToFileURL(path.resolve("../../docs/redesign/sofra-mock-pages.html")).href;
const out = path.resolve("../../docs/redesign/shots/sofra/round3");
mkdirSync(out, { recursive: true });

const measure = (page, scope) => page.evaluate((scope) => {
  const root = document.querySelector(scope);
  const textRects = (node) => { const range = document.createRange(); range.selectNodeContents(node); return [...range.getClientRects()].filter(r => r.width && r.height); };
  const about = root.querySelector(".pg-hero h1");
  let gap = null;
  if (about) {
    const title = textRects(about), para = textRects(about.nextElementSibling);
    gap = Math.round(Math.min(...para.map(r => r.top)) - Math.max(...title.map(r => r.bottom)));
  }
  const nf = root.querySelector(".nf h1");
  let lines = null;
  if (nf) {
    const words = [...nf.querySelectorAll(".w, .wi")].filter(w => !w.querySelector(".w, .wi"));
    const rows = new Map();
    for (const word of words) { const top = Math.round(word.getBoundingClientRect().top / 8); rows.set(top, [...(rows.get(top) ?? []), word.textContent.trim()]); }
    lines = [...rows.values()].map(row => row.join(" "));
  }
  return { gap, lines };
}, scope);

const browser = await chromium.launch();
const result = { label, rule: "About: paragraph text top − title text bottom; 404: words grouped by line", widths: {} };
for (const width of [1920, 1440, 1024, 768, 390, 360]) {
  result.widths[width] = {};
  for (const [which, about, nf, scope] of [["mock", `${mockUrl}#about`, `${mockUrl}#notfound`, ".view:not([hidden])"], ["site", `${base}/about`, `${base}/niama-takava-stranica`, "main"]]) {
    const row = {};
    for (const [key, url] of [["about", about], ["notfound", nf]]) {
      const page = await browser.newPage({ viewport: { width, height: width <= 390 ? 844 : 900 } });
      await page.goto(url, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(2200);
      const m = await measure(page, scope);
      row[key] = key === "about" ? m.gap : m.lines;
      await page.close();
    }
    result.widths[width][which] = row;
  }
}
await browser.close();
writeFileSync(path.join(out, `titles-${label}.json`), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result.widths, null, 1));
