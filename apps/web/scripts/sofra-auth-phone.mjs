// Login and Register on a phone: what is on the first screen, side gutters, field font size and target sizes,
// mock and site, at 320/360/390/430 × 844 and 390 × 480 (a keyboard-sized window). JPEG strip + JSON:
//   node scripts/sofra-auth-phone.mjs <label> [baseUrl]   → docs/redesign/shots/sofra/round4/auth-<label>.{json,jpg}
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const label = process.argv[2] ?? "now";
const base = process.argv[3] ?? "http://localhost:3000";
const mockUrl = pathToFileURL(path.resolve("../../docs/redesign/sofra-mock.html")).href;
const out = path.resolve("../../docs/redesign/shots/sofra/round4");
mkdirSync(out, { recursive: true });
const SIZES = [[320, 844], [360, 844], [390, 844], [430, 932], [390, 480]];

const measure = (page) => page.evaluate(() => {
  const view = document.querySelector('.view:not([hidden])') ?? document;
  const box = (sel) => { const n = view.querySelector(sel); if (!n) return null; const r = n.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), h: Math.round(r.height) }; };
  const inputs = [...view.querySelectorAll(".auth-box input:not([type=hidden])")].map(i => { const r = i.getBoundingClientRect(); return { name: i.name, top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), h: Math.round(r.height), font: parseFloat(getComputedStyle(i).fontSize), autocomplete: i.autocomplete, inputMode: i.inputMode }; });
  const button = box(".auth-box button[type=submit], .auth-box .btn");
  const targets = [...view.querySelectorAll(".auth-box a, .auth-box button")].map(n => { const r = n.getBoundingClientRect(); return { text: n.textContent.trim().slice(0, 20), h: Math.round(r.height) }; });
  return { viewport: innerHeight, width: innerWidth, h1: box(".auth-cap h1"), inputs, button, smallTargets: targets.filter(t => t.h < 44 && !/Регистрация|Вход/.test(t.text) || t.h < 24), firstScreen: { inputs: inputs.every(i => i.bottom <= innerHeight), button: !!button && button.bottom <= innerHeight, h1: !!box(".auth-cap h1") && box(".auth-cap h1").bottom <= innerHeight }, overflowX: document.documentElement.scrollWidth - innerWidth };
});

const browser = await chromium.launch();
const result = { label, sizes: {} };
const shots = [];
for (const route of ["login", "register"]) {
  for (const [width, height] of SIZES) {
    const key = `${route}-${width}x${height}`;
    result.sizes[key] = {};
    for (const which of ["mock", "site"]) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      if (which === "mock") {
        await page.goto(`${mockUrl}#auth`, { waitUntil: "load" });
        if (route === "register") await page.locator('.atab[data-mode="up"]').click();
      } else await page.goto(`${base}/${route}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({ content: ".ctl{visibility:hidden!important}" });
      await page.waitForTimeout(1600);
      result.sizes[key][which] = await measure(page);
      if (route === "login") shots.push({ key, which, data: (await page.screenshot({ type: "jpeg", quality: 75 })).toString("base64"), width, height });
      await page.close();
    }
  }
}
const view = await browser.newPage({ viewport: { width: 1800, height: 900 } });
await view.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#3a3434;color:#fff;font:600 13px system-ui;padding:12px}section{display:flex;gap:14px;align-items:flex-start;margin-bottom:16px}figure{margin:0}figcaption{margin-bottom:6px}img{display:block;border:1px solid #777}</style>${["mock", "site"].map(which => `<h2>${which === "mock" ? "Макет (sofra-mock.html)" : "Сайт (production build)"} · Вход · ${label}</h2><section>${shots.filter(s => s.which === which).map(s => `<figure><figcaption>${s.width}×${s.height}</figcaption><img src="data:image/jpeg;base64,${s.data}" width="${s.width}" height="${s.height}"></figure>`).join("")}</section>`).join("")}`);
await view.screenshot({ path: path.join(out, `auth-${label}.jpg`), fullPage: true, type: "jpeg", quality: 80 });
await browser.close();
writeFileSync(path.join(out, `auth-${label}.json`), JSON.stringify(result, null, 2));
for (const [key, v] of Object.entries(result.sizes)) console.log(key.padEnd(18), ["mock", "site"].map(w => `${w}: h1 ${v[w].firstScreen.h1 ? "✓" : "✗"} fields ${v[w].firstScreen.inputs ? "✓" : "✗"} button ${v[w].firstScreen.button ? "✓" : "✗"} (btm ${v[w].button?.bottom}/${v[w].viewport}) gutter ${Math.min(...v[w].inputs.map(i => i.left))}/${v[w].width - Math.max(...v[w].inputs.map(i => i.right))} font ${Math.min(...v[w].inputs.map(i => i.font))}`).join(" | "));
