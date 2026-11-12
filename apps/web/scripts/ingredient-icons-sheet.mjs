// Contact sheet of the ingredient icons: each icon at 22px in its chip and at 48px, its key and a real
// line from the data. 2x JPEG:   node scripts/ingredient-icons-sheet.mjs [out.jpg]
import { createRequire } from "node:module";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);
const { createLoader } = require("./load-typescript.cjs");
const out = path.resolve(process.argv[2] ?? "../../docs/redesign/shots/sofra/round3/icons-sheet.jpg");
const load = createLoader({});
const { recipes } = load(path.resolve("src/data/recipes.ts"));
const { ingredientIconKey } = load(path.resolve("src/lib/ingredient-icons.ts"));
const { INGREDIENT_ICONS } = load(path.resolve("src/components/ingredient-icon.tsx"));

const example = {};
for (const recipe of recipes) for (const line of recipe.ingredients) (example[ingredientIconKey(line)] ??= line);
example.fallback ??= "Ред без съвпадение (ръчно добавена рецепта)";
const svg = (key, size) => renderToStaticMarkup(React.createElement("svg", { viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }, INGREDIENT_ICONS[key]));
const cells = Object.keys(INGREDIENT_ICONS).map(key => `<figure><span class="chip${key === "fallback" ? " fb" : ""}">${svg(key, 22)}</span><span class="big">${svg(key, 48)}</span><figcaption><b>${key}</b><span>${example[key] ?? "—"}</span></figcaption></figure>`).join("");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
await page.setContent(`<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#170F0F;color:#F4EEE8;font:13px/1.35 system-ui,sans-serif;padding:28px}
h1{font:600 18px system-ui;margin:0 0 6px}p{margin:0 0 20px;color:#B9ABA3}
main{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
figure{margin:0;display:grid;grid-template-columns:auto auto 1fr;gap:12px;align-items:center;border-bottom:1px solid rgba(244,238,232,.14);padding:8px 0}
.chip{width:32px;height:32px;border-radius:50%;border:1px solid rgba(229,72,77,.45);display:grid;place-items:center;color:#B9ABA3}
.chip.fb{color:#E5484D}.big{color:#F4EEE8;display:grid}
figcaption{display:grid;gap:2px}figcaption b{font-weight:600}figcaption span{color:#B9ABA3;font-size:12px}
</style><h1>Икони на продуктите · ${Object.keys(INGREDIENT_ICONS).length} (вкл. резервната)</h1><p>22px в чипа, както в списъка · 48px за проверка на рисунката · ключ · пример от данните</p><main>${cells}</main>`);
await page.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 85 });
await browser.close();
console.log(out);
