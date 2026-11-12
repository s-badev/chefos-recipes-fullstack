// Empty bands between the Home sections, measured in the DOM, on the mock and on a running production server:
//   node scripts/sofra-gaps.mjs <label> [baseUrl]
// Gap = top of the next section's content minus the bottom of this section's content (union of the visible
// leaf boxes: text, images, svg, buttons). The full-bleed hero is skipped as a source; the full-bleed quote
// counts from its own top edge (its photograph is what the eye meets). Writes
// docs/redesign/shots/sofra/round3/gaps-<label>.json.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const label = process.argv[2] ?? "now";
const base = process.argv[3] ?? "http://localhost:3000";
const mockUrl = pathToFileURL(path.resolve("../../docs/redesign/sofra-mock.html")).href;
const out = path.resolve("../../docs/redesign/shots/sofra/round3");
mkdirSync(out, { recursive: true });

const NAMES = ["Седни на софрата", "Рецепта на седмицата", "Какво да сготвиш днес", "Цитат"];

async function gaps(page, scope) {
  return page.evaluate((scope) => {
    const sections = [...document.querySelectorAll(scope)].filter(node => !node.matches(".hero"));
    const content = (section) => {
      let top = Infinity, bottom = -Infinity;
      for (const node of section.querySelectorAll("*")) {
        if (node.closest(".sr-only,[hidden]")) continue;
        const leaf = !node.children.length || node.matches("img,svg,button,a,.sofra-table,.sofra-ring");
        if (!leaf || node.closest("svg") !== null && !node.matches("svg")) continue;
        const style = getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const r = node.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        top = Math.min(top, r.top); bottom = Math.max(bottom, r.bottom);
      }
      return { top: top + scrollY, bottom: bottom + scrollY };
    };
    const rows = [];
    for (let i = 0; i < sections.length - 1; i++) {
      const next = sections[i + 1];
      const nextTop = next.matches(".story") ? next.getBoundingClientRect().top + scrollY : content(next).top;
      rows.push(Math.round(nextTop - content(sections[i]).bottom));
    }
    return rows;
  }, scope);
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 300) { await page.mouse.wheel(0, 300); await page.waitForTimeout(50); }
  await page.waitForTimeout(1500);
}

const browser = await chromium.launch();
const result = { label, measured: new Date().toISOString(), rule: "content bottom → next content top; quote: to the photograph's top edge", widths: {} };
for (const width of [1440, 390]) {
  result.widths[width] = {};
  for (const [which, url, scope] of [["mock", `${mockUrl}#home`, '[data-view="home"] > section'], ["site", `${base}/`, "main > section"]]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 } });
    await page.goto(url, { waitUntil: which === "site" ? "networkidle" : "load" });
    await settle(page);
    const rows = await gaps(page, scope);
    result.widths[width][which] = Object.fromEntries(rows.map((gap, i) => [`${NAMES[i]} → ${NAMES[i + 1]}`, gap]));
    await page.close();
  }
}
await browser.close();
writeFileSync(path.join(out, `gaps-${label}.json`), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result.widths, null, 2));
