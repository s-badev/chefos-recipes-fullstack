import { expect, test, type Page } from "@playwright/test";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { recipes } from "../src/data/recipes";

const require = createRequire(import.meta.url);
const { createLoader } = require("../scripts/load-typescript.cjs");
const root = fileURLToPath(new URL("../", import.meta.url));
const NOT_FOUND = "/niama-takava-stranica";

async function axeViolations(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .8) { scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 60)); }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  return page.evaluate(async () => {
    const result = await (window as unknown as { axe: { run: () => Promise<{ violations: Array<{ id: string; impact: string; nodes: Array<{ target: string[] }> }> }> } }).axe.run();
    return result.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) }));
  });
}

for (const route of ["/about", NOT_FOUND]) {
  for (const width of [390, 1440]) {
    test(`axe: zero violations on ${route} at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(route, { waitUntil: "networkidle" });
      expect(await axeViolations(page)).toEqual([]);
    });
  }

  test(`${route}: the print stays light, decorations drop out`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(255, 255, 255)");
    expect(await page.locator("h1").evaluate(node => getComputedStyle(node).color)).toBe("rgb(17, 17, 17)");
    for (const selector of [".nf-table", ".princ-ph", ".atmo", "header", "footer"]) {
      for (const node of await page.locator(selector).all()) expect(await node.evaluate(el => getComputedStyle(el).display), selector).toBe("none");
    }
    // No dark ground left behind the text (hero overlays and scrims are pseudo-elements).
    const darkGrounds = await page.evaluate(() => [...document.querySelectorAll(".r-hero,.hero-in,.nf")].flatMap(node =>
      ["::before", "::after"].filter(pseudo => { const style = getComputedStyle(node, pseudo); return style.display !== "none" && style.content !== "none" && style.backgroundImage !== "none"; })));
    expect(darkGrounds).toEqual([]);
    // Every split word is at rest and unclipped on paper (no reveal caught half-way).
    const moving = await page.evaluate(() => [...document.querySelectorAll(".wi")].filter(node => {
      const style = getComputedStyle(node), mask = getComputedStyle(node.parentElement!);
      return style.transform !== "none" || style.transitionDuration !== "0s" || mask.overflow !== "visible";
    }).length);
    expect(moving).toBe(0);
    const pdf = await page.pdf({ format: "A4" });
    expect(pdf.byteLength).toBeGreaterThan(1000);
  });
}

test("404: the approved copy, two ways out, a table with five plates and one empty place (decoration only)", async ({ page }) => {
  const response = await page.goto(NOT_FOUND);
  expect(response!.status()).toBe(404);
  const main = page.getByRole("main");
  await expect(main.locator(".eyebrow").first()).toHaveText("Грешка 404");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Тази страница не е на масата");
  await expect(main.getByText("Адресът може да е грешен или рецептата вече да не е в каталога.", { exact: true })).toBeVisible();
  await expect(main.getByRole("link", { name: "Към началото", exact: true })).toHaveAttribute("href", "/");
  await expect(main.getByRole("link", { name: "Всички рецепти", exact: true })).toHaveAttribute("href", "/catalog");
  const table = page.locator(".nf-table");
  await expect(table).toHaveAttribute("aria-hidden", "true");
  await expect(table.locator(".plate")).toHaveCount(6);
  await expect(table.locator(".plate img")).toHaveCount(5);
  await expect(table.locator(".plate.gap .stitch-star")).toHaveCount(1);
});

test("About: hero over the photograph, the owner's copy, one button to all recipes", async ({ page }) => {
  await page.goto("/about", { waitUntil: "networkidle" });
  await expect(page.locator(".r-hero[data-hero] .hero-ph img")).toHaveAttribute("src", /kyufteta-na-skara/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Подреден каталог за домашна храна");
  await expect(page.locator(".rhythm li")).toHaveText(["Избираш спокойно.", "Готвиш уверено.", "Сядаш на масата."]);
  await expect(page.locator(".cap-li .st-n")).toHaveText(["01", "02", "03", "04"]);
  await expect(page.getByRole("link", { name: "Разгледай каталога" })).toHaveCount(0);
  await expect(page.getByRole("main").getByRole("link", { name: "Всички рецепти", exact: true })).toHaveAttribute("href", "/catalog");
  // Old boxes are gone: no bordered panels from the previous About page.
  await expect(page.locator(".about-panel, .about-premium-tile, .info-card")).toHaveCount(0);
});

for (const width of [390, 768, 1024, 1440, 1920]) {
  test(`About at ${width}: the generator mark of banitsa-s-praz stays outside the frame`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/about", { waitUntil: "networkidle" });
    await page.locator(".princ-ph").scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator(".princ-crop img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    // Mark in the master: x from 1869/2000 and y from 1362/1493 (detector bbox). The visible part must end before it.
    const visible = await page.evaluate(() => {
      const frame = document.querySelector(".princ-ph .mk")!.getBoundingClientRect();
      const image = document.querySelector<HTMLImageElement>(".princ-crop img")!;
      const box = image.getBoundingClientRect();
      const scale = Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight);
      return { x: frame.width / scale / image.naturalWidth, y: frame.height / scale / image.naturalHeight };
    });
    expect(visible.x < 1869 / 2000 || visible.y < 1362 / 1493, JSON.stringify(visible)).toBe(true);
  });
}

test("Favorites and Profile send a guest to the login with the way back", async ({ page }) => {
  for (const route of ["/favorites", "/profile"]) {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(route)}$`));
  }
});

/** The real page components with mocked services (no session, no database). */
function load(services: Record<string, unknown>) {
  return createLoader({
    "server-only": {},
    "next/image": { __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => React.createElement("img", { src, alt }) },
    "next/link": { __esModule: true, default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => React.createElement("a", { href, ...props }, children) },
    "../hooks/use-favorite": { useFavorite: (saved: boolean) => ({ saved, message: "", pending: false, action: "/favorite-action" }) },
    ...services
  });
}

test("Favorites with recipes: the catalog card, its heart saved and returning to /favorites, a link to all recipes", async ({ page }) => {
  const list = ["shopska-salata", "tikvenik"].map(slug => recipes.find(recipe => recipe.slug === slug)!);
  const { default: Favorites } = load({
    "../../server/favorites/service": { getCurrentUserFavoriteRecipes: async () => list },
    "../../server/recipes/web-image": { withWebRecipeImage: async (recipe: unknown) => recipe }
  })(path.join(root, "src/app/favorites/page.tsx"));
  await page.setContent(renderToStaticMarkup(await Favorites()));
  await expect(page.locator(".pg-head .eyebrow")).toHaveText("Твоята колекция");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Любими рецепти");
  // One row over the grid, no second large heading: the count (a small label) and the link.
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("2 запазени рецепти");
  await expect(page.locator(".fav-top h2")).toHaveClass(/\beyebrow\b/);
  await expect(page.locator(".fav-top a")).toHaveAttribute("href", "/catalog");
  await expect(page.locator(".cards .card")).toHaveCount(2);
  await expect(page.locator(".card .ct")).toHaveText(["Шопска салата", "Тиквеник"]);
  for (const form of await page.locator(".heart-form").all()) {
    await expect(form.locator('input[name="redirectTo"]')).toHaveValue("/favorites");
    await expect(form.locator('input[name="saved"]')).toHaveValue("false");
    await expect(form.locator("button.heart")).toHaveAttribute("aria-pressed", "true");
  }
  await expect(page.locator(".fav-empty")).toHaveCount(0);
});

test("Favorites empty: the stitched table, the heading and one button to all recipes", async ({ page }) => {
  const { default: Favorites } = load({
    "../../server/favorites/service": { getCurrentUserFavoriteRecipes: async () => [] },
    "../../server/recipes/web-image": { withWebRecipeImage: async (recipe: unknown) => recipe }
  })(path.join(root, "src/app/favorites/page.tsx"));
  await page.setContent(renderToStaticMarkup(await Favorites()));
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("Все още няма запазени рецепти");
  await expect(page.getByRole("link", { name: "Всички рецепти", exact: true })).toHaveAttribute("href", "/catalog");
  await expect(page.locator(".fe-table-wrap")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(".fe-table .stitch-ring")).toHaveCount(1);
  await expect(page.locator(".cards")).toHaveCount(0);
});

function profile(saved: number, email = "maria@example.com") {
  return load({
    "../../server/auth/session": { requireUser: async () => ({ name: " Мария ", email, role: "user" }) },
    "../../server/favorites/service": { getCurrentUserFavoriteSlugs: async () => recipes.slice(0, saved).map(recipe => recipe.slug) },
    "../../server/auth/actions": { logoutAction: async () => undefined }
  })(path.join(root, "src/app/profile/page.tsx")).default;
}

for (const [saved, count, lead, text, link, href] of [
  [3, "3 рецепти", "Здравей, Мария. Ето какво е запазено в профила ти.", "Имаш 3 запазени рецепти.", "Виж любимите", "/favorites"],
  [1, "1 рецепта", "Здравей, Мария. Ето какво е запазено в профила ти.", "Имаш 1 запазена рецепта.", "Виж любимите", "/favorites"],
  [0, "0 рецепти", "Здравей, Мария. Още няма запазени рецепти.", "Запази рецепти със сърцето на картата и те ще се появят тук.", "Към рецептите", "/catalog"]
] as const) {
  test(`Profile with ${saved} saved: real values only (count and e-mail), Любими and Акаунт with the sign-out`, async ({ page }) => {
    const Profile = profile(saved);
    await page.setContent(renderToStaticMarkup(await Profile()));
    await expect(page.locator(".pg-head .lead")).toHaveText(lead);
    await expect(page.locator(".meta.m2 dt")).toHaveText(["Запазени рецепти", "Профил"]);
    await expect(page.locator(".meta.m2 dd")).toHaveText([count, "maria@example.com"]);
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(["Любими", "Акаунт"]);
    await expect(page.locator(".prof-cols section").first().locator("p")).toHaveText(text);
    await expect(page.getByRole("link", { name: link, exact: true })).toHaveAttribute("href", href);
    await expect(page.locator(".prof-cols form button")).toHaveText("Изход");
    // No invented content and no promises about features that do not exist.
    expect(await page.locator("body").innerText()).not.toMatch(/Последна активност|Активен профил|Лични настройки|Тук ще се събират|Профилът ще/);
  });
}

for (const width of [1440, 390]) {
  test(`Profile at ${width}: nothing runs past the content lines, even a long e-mail`, async ({ page }) => {
    const Profile = profile(12, "maria.petrova.recepti.za.vsichki.dni@example.com");
    const markup = renderToStaticMarkup(await Profile());
    await page.setViewportSize({ width, height: 900 });
    await page.goto(NOT_FOUND, { waitUntil: "networkidle" });
    // The production page shell and CSS, with the rendered Profile as the page content.
    await page.evaluate(html => { document.querySelector("main")!.innerHTML = html; }, markup);
    await page.evaluate(() => document.fonts.ready);
    const spill = await page.evaluate(() => {
      const wrap = document.querySelector(".prof-body .meta")!.closest(".wrap")!;
      const style = getComputedStyle(wrap);
      const right = wrap.getBoundingClientRect().right - parseFloat(style.paddingRight);
      return [...document.querySelectorAll(".prof-body *:not(.wrap)")].map(node => ({ node: node.className || node.tagName, over: Math.round(node.getBoundingClientRect().right - right), scroll: node.scrollWidth - node.clientWidth }))
        .filter(item => item.over > 1 || (item.scroll > 1 && item.node !== "stitch-star"));
    });
    expect(spill).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
}

test("Error page: same Sofra layout, its own copy and the retry button", async ({ page }) => {
  const { default: RootError } = load({})(path.join(root, "src/app/error.tsx"));
  await page.setContent(renderToStaticMarkup(React.createElement(RootError, { error: new Error("test"), reset: () => undefined })));
  await expect(page.locator(".nf .eyebrow")).toHaveText("Нещо се обърка");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Страницата не успя да се зареди");
  await expect(page.getByRole("button", { name: "Опитай пак", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Към началото" })).toHaveAttribute("href", "/");
  await expect(page.locator(".nf-table .plate.gap")).toHaveCount(1);
});

for (const [width, minGap, maxLines] of [[1440, 32, 2], [390, 22, 3]] as const) {
  test(`At ${width}: About title has air above its paragraph; the 404 title fits in ${maxLines} lines`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    const textRects = (selector: string) => page.locator(selector).evaluate(node => {
      const range = document.createRange(); range.selectNodeContents(node);
      return [...range.getClientRects()].filter(r => r.width && r.height).map(r => ({ top: r.top, bottom: r.bottom }));
    });
    await page.goto("/about", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const title = await textRects(".pg-hero h1"), para = await textRects(".pg-hero .r-desc");
    expect(Math.min(...para.map(r => r.top)) - Math.max(...title.map(r => r.bottom))).toBeGreaterThanOrEqual(minGap);
    await page.goto(NOT_FOUND, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    const lines = await page.locator(".nf h1").evaluate(node => {
      const rows = new Map<number, string[]>();
      for (const word of node.querySelectorAll(".wi")) { const top = Math.round(word.getBoundingClientRect().top / 8); rows.set(top, [...(rows.get(top) ?? []), word.textContent!.trim()]); }
      return [...rows.values()].map(row => row.join(" "));
    });
    expect(lines.length).toBeLessThanOrEqual(maxLines);
    if (width === 1440) expect(lines).toEqual(["Тази страница", "не е на масата"]);
    // No single word left hanging on the last line.
    expect(lines.at(-1)!.split(" ").length).toBeGreaterThan(1);
  });
}

for (const route of ["/", "/catalog/shopska-salata"]) {
  for (const width of [390, 1440]) {
    test(`axe: zero violations on ${route} at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(route, { waitUntil: "networkidle" });
      expect(await axeViolations(page)).toEqual([]);
    });
  }
}

/** Profile and Favorites need a session: the real components with sample data in the production shell. */
for (const [name, render] of [
  ["Profile", async () => renderToStaticMarkup(await profile(3, "maria.petrova.recepti@example.com")())],
  ["Favorites with recipes", async () => {
    const { default: Favorites } = load({
      "../../server/favorites/service": { getCurrentUserFavoriteRecipes: async () => ["shopska-salata", "tikvenik", "mekitsi"].map(slug => recipes.find(recipe => recipe.slug === slug)!) },
      "../../server/recipes/web-image": { withWebRecipeImage: async (recipe: unknown) => recipe }
    })(path.join(root, "src/app/favorites/page.tsx"));
    return renderToStaticMarkup(await Favorites());
  }],
  ["Favorites empty", async () => {
    const { default: Favorites } = load({
      "../../server/favorites/service": { getCurrentUserFavoriteRecipes: async () => [] },
      "../../server/recipes/web-image": { withWebRecipeImage: async (recipe: unknown) => recipe }
    })(path.join(root, "src/app/favorites/page.tsx"));
    return renderToStaticMarkup(await Favorites());
  }]
] as const) {
  for (const width of [390, 1440]) {
    test(`axe: zero violations on the rendered ${name} at ${width}`, async ({ page }) => {
      const markup = await render();
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(NOT_FOUND, { waitUntil: "networkidle" });
      await page.evaluate(html => { document.querySelector("main")!.innerHTML = html; document.title = "Профил"; }, markup);
      expect(await axeViolations(page)).toEqual([]);
    });
  }
}

// Round 4: the catalog, the login and a manual recipe without a photograph (read only).
for (const route of ["/catalog", "/login", `/catalog/${encodeURIComponent("пиле-тариаки")}`]) {
  for (const width of [390, 1440]) {
    test(`axe: zero violations on ${decodeURIComponent(route)} at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      const response = await page.goto(route, { waitUntil: "networkidle" });
      test.skip(response?.status() === 404, "the manual recipe is not in this database");
      expect(await axeViolations(page)).toEqual([]);
    });
  }
}
