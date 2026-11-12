// Evidence for a jury of the pages that need a session (Favorites with recipes, Favorites empty, Profile):
// the real components with sample data, placed in the production page shell, shot at 1440 (d-) and on a
// throttle-free phone at 390 (m-), full page, JPEG. No sign-in, no database.
//   node scripts/jury-rendered.mjs <outDir> [baseUrl]
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);
const { createLoader } = require("./load-typescript.cjs");
const out = path.resolve(process.argv[2]);
const base = process.argv[3] ?? "http://localhost:3000";
const h = React.createElement;
const mocks = {
  "server-only": {},
  "next/image": { __esModule: true, default: ({ src, alt, sizes }) => h("img", { src, alt, sizes, style: { position: "absolute", inset: 0, width: "100%", height: "100%" } }) },
  "next/link": { __esModule: true, default: ({ href, children, ...props }) => h("a", { href, ...props }, children) },
  "./card-heart": { CardHeart: ({ title, saved }) => h("form", { className: "heart-form" }, h("button", { className: "heart", type: "button", "aria-pressed": saved, "aria-label": `${saved ? "Премахни от любими" : "Запази в любими"}: ${title}` }, h("span", { className: "heart-ico", "aria-hidden": "true" }, h("span", { className: "ring" }), h("svg", { viewBox: "0 0 24 24" }, h("path", { d: "M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3 5 6.5 5c2 0 3.5 1.1 5.5 3 2-1.9 3.5-3 5.5-3C21 5 22.8 8.6 21.5 11.8 19.5 16.4 12 21 12 21z" }))))) },
  "../../server/auth/actions": { logoutAction: async () => undefined }
};
const { recipes } = createLoader({})(path.resolve("src/data/recipes.ts"));
const sample = ["mekitsi", "tikvenik", "shopska-salata"].map(slug => recipes.find(recipe => recipe.slug === slug));
const page = (file, services) => async () => renderToStaticMarkup(await createLoader({ ...mocks, ...services })(path.resolve(file)).default());
const PAGES = {
  "favorites-rendered": page("src/app/favorites/page.tsx", { "../../server/favorites/service": { getCurrentUserFavoriteRecipes: async () => sample }, "../../server/recipes/web-image": { withWebRecipeImage: async r => r } }),
  "favorites-empty-rendered": page("src/app/favorites/page.tsx", { "../../server/favorites/service": { getCurrentUserFavoriteRecipes: async () => [] }, "../../server/recipes/web-image": { withWebRecipeImage: async r => r } }),
  "profile-rendered": page("src/app/profile/page.tsx", { "../../server/auth/session": { requireUser: async () => ({ name: "Мария", email: "maria.petrova@example.com", role: "user" }) }, "../../server/favorites/service": { getCurrentUserFavoriteSlugs: async () => sample.map(r => r.slug) } })
};

const browser = await chromium.launch();
for (const [name, render] of Object.entries(PAGES)) {
  const markup = await render();
  mkdirSync(path.join(out, name), { recursive: true });
  for (const [prefix, width, height] of [["d", 1440, 900], ["m", 390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, locale: "bg-BG" });
    const p = await ctx.newPage();
    await p.goto(`${base}/niama-takava-stranica`, { waitUntil: "networkidle" });
    await p.evaluate((html) => { document.querySelector("main").innerHTML = html; }, markup);
    await p.waitForLoadState("networkidle");
    await p.evaluate(() => document.fonts.ready);
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 300) { await p.mouse.wheel(0, 300); await p.waitForTimeout(60); }
    await p.waitForTimeout(1500);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(out, name, `${prefix}-01-full.jpg`), fullPage: true, type: "jpeg", quality: 80 });
    await ctx.close();
  }
}
await browser.close();
console.log("rendered evidence in", out);
