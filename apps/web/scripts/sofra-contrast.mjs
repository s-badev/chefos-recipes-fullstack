// Sofra contrast table against a running production server:
//   node scripts/sofra-contrast.mjs [baseUrl]
// 1. token pairs (WCAG ratio); 2. text over photographs at the worst pixel behind each text box,
// with the text's real colour and opacity, at 390 and 1440. Writes docs/redesign/shots/sofra/contrast.json.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const out = path.resolve("../../docs/redesign/shots/sofra/contrast.json");

const hex = (value) => value.match(/[0-9a-f]{2}/gi).map((h) => parseInt(h, 16));
const channel = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const over = (fg, alpha, bg) => fg.map((c, i) => alpha * c + (1 - alpha) * bg[i]);
const ratio = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return +((hi + 0.05) / (lo + 0.05)).toFixed(2); };

const bg = hex("#170F0F"), surface = hex("#221614"), ink = hex("#F4EEE8"), muted = hex("#B9ABA3"), accent = hex("#E5484D"), fill = hex("#C81E2B"), white = [255, 255, 255];
const tokens = [
  ["--ink на --bg (текст)", ratio(ink, bg)],
  ["--muted на --bg (вторичен текст)", ratio(muted, bg)],
  ["--accent на --bg (червен текст, линии, грешки)", ratio(accent, bg)],
  ["бял текст на --accent-fill (основен бутон)", ratio(white, fill)],
  ["--ink на --surface", ratio(ink, surface)],
  ["--muted на --surface", ratio(muted, surface)],
  ["--bg текст на --ink (hover на бутон)", ratio(bg, ink)],
  ["линия на полето rgba(244,238,232,.45) на --bg", ratio(over(ink, 0.45, bg), bg)],
  ["placeholder --muted .85 на --bg", ratio(over(muted, 0.85, bg), bg)],
  ["header: --ink на --head rgba(23,15,15,.82) над --bg", ratio(ink, over(bg, 0.82, bg))]
].map(([pair, value]) => ({ pair, ratio: value, aa: value >= 4.5 ? "AA текст" : value >= 3 ? "AA едър текст / линии" : "под AA" }));

const SCENES = [
  { name: "Начало: hero", url: "/", hide: ".hero .hero-in *,.hdr", boxes: [[".hero .eyebrow", "eyebrow"], [".hero h1", "h1"], [".hero-row p", "текст"]] },
  { name: "Начало: header над hero", url: "/", hide: ".hdr", boxes: [[".hdr .logo-kicker", "лого: kicker"], [".hdr .logo-name", "лого: име"], [".hdr .desktop-nav a, .hdr .menu-toggle", "навигация"]] },
  { name: "Начало: цитат", url: "/", scroll: ".story", hide: ".story .wrap *,.hdr", boxes: [[".story q", "цитат"], [".story cite", "подпис"]] },
  { name: "Рецепта: hero (шопска)", url: "/catalog/shopska-salata", hide: ".r-hero .hero-in *,.hdr", boxes: [[".r-hero .eyebrow", "eyebrow"], [".r-hero h1", "h1"], [".r-hero .r-desc", "описание"]] },
  { name: "Рецепта: hero (боб чорба)", url: "/catalog/bob-chorba", hide: ".r-hero .hero-in *,.hdr", boxes: [[".r-hero .eyebrow", "eyebrow"], [".r-hero h1", "h1"], [".r-hero .r-desc", "описание"]] },
  { name: "Вход: снимка", url: "/login", hide: ".auth-cap *", boxes: [[".auth-cap .eyebrow", "eyebrow"], [".auth-cap h1", "h1"]] }
];

const browser = await chromium.launch();
const photos = [];
for (const scene of SCENES) {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 } });
    await page.goto(base + scene.url, { waitUntil: "networkidle" });
    if (scene.scroll) { await page.locator(scene.scroll).scrollIntoViewIfNeeded(); }
    await page.waitForTimeout(2600);
    const boxes = await page.evaluate((list) => list.flatMap(([selector, label]) => [...document.querySelectorAll(selector)].flatMap((node) => {
      const range = document.createRange(); range.selectNodeContents(node);
      let alpha = 1; for (let el = node; el; el = el.parentElement) alpha *= Number(getComputedStyle(el).opacity);
      const rgb = getComputedStyle(node).color.match(/[\d.]+/g).map(Number);
      return [...range.getClientRects()].filter((r) => r.width && r.height && r.bottom > 0 && r.top < innerHeight).map((r) => ({ label, x: r.x, y: r.y, w: r.width, h: r.height, rgb, alpha: alpha * (rgb[3] ?? 1) }));
    })), scene.boxes);
    await page.addStyleTag({ content: `${scene.hide}{visibility:hidden!important}` });
    await page.waitForTimeout(150);
    const png = await page.screenshot();
    const worst = await page.evaluate(async ({ data, boxes: list }) => {
      const lum = (r, g, b) => { const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
      const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode();
      const canvas = new OffscreenCanvas(image.width, image.height); const ctx = canvas.getContext("2d"); ctx.drawImage(image, 0, 0);
      const px = ctx.getImageData(0, 0, image.width, image.height).data;
      const result = {};
      for (const box of list) for (let y = Math.max(0, Math.floor(box.y)); y < Math.min(image.height, Math.ceil(box.y + box.h)); y++) for (let x = Math.max(0, Math.floor(box.x)); x < Math.min(image.width, Math.ceil(box.x + box.w)); x++) {
        const i = (y * image.width + x) * 4, back = [px[i], px[i + 1], px[i + 2]];
        const fg = back.map((v, c) => box.alpha * box.rgb[c] + (1 - box.alpha) * v);
        const [hi, lo] = [lum(...fg), lum(...back)].sort((a, b) => b - a);
        const value = (hi + 0.05) / (lo + 0.05);
        if (!(box.label in result) || value < result[box.label]) result[box.label] = value;
      }
      return Object.fromEntries(Object.entries(result).map(([k, v]) => [k, +v.toFixed(2)]));
    }, { data: png.toString("base64"), boxes });
    photos.push({ scene: scene.name, width, ...worst });
    await page.close();
  }
}
await browser.close();
writeFileSync(out, JSON.stringify({ tokens, photos }, null, 2));
console.table(tokens);
console.table(photos);
