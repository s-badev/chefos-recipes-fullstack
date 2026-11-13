// Puts the ingredient icons into the recipe view of docs/redesign/sofra-mock.html (round 3, step 5), from the
// same component the site uses: the drawings as markup and the key of every line in the mock's data.
// Run again after an icon changes:   node scripts/ingredient-icons-mock.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const { createLoader } = require("./load-typescript.cjs");
const load = createLoader({});
const { recipes } = load(path.resolve("src/data/recipes.ts"));
const { ingredientIconKey } = load(path.resolve("src/lib/ingredient-icons.ts"));
const { INGREDIENT_ICONS } = load(path.resolve("src/components/ingredient-icon.tsx"));

const file = path.resolve("../../docs/redesign/sofra-mock.html");
let s = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const icons = Object.fromEntries(Object.entries(INGREDIENT_ICONS).map(([key, body]) => [key, renderToStaticMarkup(React.createElement(React.Fragment, null, body))]));
// The curated lines and the sample manual recipes of the mock (catalog controls ?n=25…32).
const MOCK_EXTRA = ["500 г пилешко месо", "200 г ориз", "1 глава лук", "Сол и черен пипер", "300 г леща", "1 морков", "Чубрица и сол", "500 г пилешко филе", "4 с.л. соев сос", "1 с.л. мед", "1 ч.л. джинджифил", "1 с.л. сусам", "2 тиквички", "400 г кайма", "2 яйца", "300 г кисело мляко", "4 ябълки", "200 г брашно", "100 г масло", "1 ч.л. канела", "2 патладжана", "2 скилидки чесън", "Магданоз и сол", "2 риби", "1 лимон", "2 с.л. олио", "500 мл прясно мляко", "100 г шоколад", "2 с.л. нишесте", "200 мл сметана"];
const keys = Object.fromEntries([...recipes.flatMap(recipe => recipe.ingredients), ...MOCK_EXTRA].map(line => [line, ingredientIconKey(line)]));
const block = `/* ---------- икони на продуктите (кръг 3; от src/components/ingredient-icon.tsx, scripts/ingredient-icons-mock.mjs) ---------- */
var ING_ICON=${JSON.stringify(icons)};
var ING_KEY=${JSON.stringify(keys)};
function ingIcon(t){var k=ING_KEY[t]||'fallback';return '<span class="ing-ic'+(k==='fallback'?' fallback':'')+'" data-icon="'+k+'" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false">'+ING_ICON[k]+'</svg></span>'}
function productCount(n){return n===1?'1 продукт':n+' продукта'}
`;
const start = s.indexOf("/* ---------- икони на продуктите");
if (start >= 0) {
  const end = s.indexOf("function productCount", start);
  s = s.slice(0, start) + block + s.slice(s.indexOf("\n", end) + 1);
} else {
  const rep = (a, b) => { if (s.split(a).length !== 2) throw new Error(a.slice(0, 80)); s = s.split(a).join(b); };
  // CSS: chips instead of checkboxes.
  const cssStart = s.indexOf(".ing{display:flex;gap:14px;align-items:flex-start;padding:14px 0;");
  const cssEndMark = ".ing:hover input{border-color:var(--accent)}\n";
  const cssEnd = s.indexOf(cssEndMark);
  if (cssStart < 0 || cssEnd < 0) throw new Error("mock .ing css");
  s = s.slice(0, cssStart) + `/* Кръг 3: без отметки — пред всеки продукт малка рисунка на самия продукт; броят е статичен. */
.ing-list{list-style:none;margin:0;padding:0}
.ing{display:flex;gap:14px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line);min-height:52px}
.ing-ic{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:50%;border:1px solid rgba(229,72,77,.4);color:var(--muted)}
.ing-ic svg{width:22px;height:22px}
.ing-ic.fallback{color:var(--accent)}
.ing-t{flex:1;min-width:0;line-height:1.5}
` + s.slice(cssEnd + cssEndMark.length);
  rep(`<span id="ing-c">0 от 8</span></div><div id="r-ings"></div>`, `<span id="ing-c">8 продукта</span></div><ul class="ing-list" id="r-ings"></ul>`);
  rep(`$('#r-ings').innerHTML=r.ing.map(function(t,i){return '<label class="ing rv" style="--d:'+(Math.min(i,7)*50)+'ms"><input type="checkbox" data-k="'+i+'"'+(checks[r.s][i]?' checked':'')+'><span>'+t+'</span></label>'}).join('');`,
    `$('#r-ings').innerHTML=r.ing.map(function(t,i){return '<li class="ing rv" style="--d:'+(Math.min(i,7)*50)+'ms">'+ingIcon(t)+'<span class="ing-t">'+t+'</span></li>'}).join('');$('#ing-c').textContent=productCount(r.ing.length);`);
  // The tick state is gone with the ticks.
  rep("var checks={};\n", "");
  rep("  checks[r.s]=checks[r.s]||{};\n", "");
  rep("  updC(r);\n", "");
  rep(`function updC(r){var n=Object.keys(checks[r.s]).filter(function(k){return checks[r.s][k]}).length;$('#ing-c').textContent=n+' от '+r.ing.length}\n$('#r-ings').addEventListener('change',function(e){var k=e.target.getAttribute('data-k');checks[sel][k]=e.target.checked;updC(byS(sel))});\n`, block);
}
writeFileSync(file, s);
console.log("mock updated:", Object.keys(icons).length, "icons,", Object.keys(keys).length, "distinct lines");
