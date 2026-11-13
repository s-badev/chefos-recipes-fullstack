// Tabs at rest, under the pointer and with keyboard focus: computed styles of the active and an inactive tab on
// /catalog ("Всички" / "Салати") and /login ("Вход" / "Регистрация"), plus a JPEG strip of the frames.
//   node scripts/sofra-tabs-hover.mjs <label> [baseUrl] → docs/redesign/shots/sofra/round4/tabs-<label>.{json,jpg}
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const label = process.argv[2] ?? "now";
const base = process.argv[3] ?? "http://localhost:3000";
const out = path.resolve("../../docs/redesign/shots/sofra/round4");
mkdirSync(out, { recursive: true });
const CASES = [
  ["/catalog", ".fbar .tab", "Всички", "Салати"],
  ["/login", ".atab", "Вход", "Регистрация"]
];
const style = (locator) => locator.evaluate((node) => {
  const s = getComputedStyle(node), a = getComputedStyle(node, "::after");
  return { color: s.color, transform: s.transform, outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, line: { transform: a.transform, background: a.backgroundColor } };
});
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const result = {};
const frames = [];
for (const [url, selector, active, inactive] of CASES) {
  await page.goto(base + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  for (const [kind, name] of [["active", active], ["inactive", inactive]]) {
    const tab = page.locator(selector).filter({ hasText: name }).first();
    const box = (await tab.boundingBox());
    const clip = { x: box.x - 16, y: box.y - 10, width: box.width + 32, height: box.height + 20 };
    await page.mouse.move(0, 0); await page.waitForTimeout(600);
    const rest = await style(tab); frames.push({ title: `${url} · ${name} (${kind}) · покой`, shot: await page.screenshot({ clip, type: "jpeg", quality: 85 }) });
    await tab.hover(); await page.waitForTimeout(700);
    const hover = await style(tab); frames.push({ title: `${url} · ${name} (${kind}) · hover`, shot: await page.screenshot({ clip, type: "jpeg", quality: 85 }) });
    await page.mouse.move(0, 0); await page.waitForTimeout(400);
    await tab.focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab"); await page.waitForTimeout(400);
    const focus = await style(tab); frames.push({ title: `${url} · ${name} (${kind}) · фокус`, shot: await page.screenshot({ clip, type: "jpeg", quality: 85 }) });
    await page.evaluate(() => document.activeElement?.blur());
    result[`${url} ${name} (${kind})`] = { rest, hover, focus, hoverChanges: JSON.stringify(rest) !== JSON.stringify(hover) && (rest.transform !== hover.transform || rest.line.transform !== hover.line.transform) };
  }
}
const view = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
await view.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#3a3434;color:#fff;font:600 13px system-ui;padding:14px;display:grid;grid-template-columns:repeat(3,auto);gap:14px 24px;justify-content:start}figure{margin:0}figcaption{margin-bottom:6px}img{display:block;border:1px solid #777}</style>${frames.map(f => `<figure><figcaption>${f.title}</figcaption><img src="data:image/jpeg;base64,${f.shot.toString("base64")}"></figure>`).join("")}`);
await view.screenshot({ path: path.join(out, `tabs-${label}.jpg`), fullPage: true, type: "jpeg", quality: 82 });
await browser.close();
writeFileSync(path.join(out, `tabs-${label}.json`), JSON.stringify(result, null, 2));
for (const [key, v] of Object.entries(result)) console.log(key.padEnd(34), "hover moves:", v.hoverChanges, "| rest", v.rest.transform, v.rest.line.transform, "| hover", v.hover.transform, v.hover.line.transform, "| focus", v.focus.outline);
