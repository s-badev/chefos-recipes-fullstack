import { expect, test, type Page } from "@playwright/test";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { eq, getDb, users, recipes, favorites, recipeSteps, recipeTags } from "@chefos/db";
import nextEnv from "@next/env";
import { RECIPE_FALLBACK_IMAGE_SRC, hasRecipePhoto, missingContentNotes, nextCuratedRecipe } from "../src/lib/recipe-detail";
import { validCatalogHref } from "../src/lib/catalog-return";
import { recipes as curated } from "../src/data/recipes";
import { watchProblems } from "./helpers";

nextEnv.loadEnvConfig(fileURLToPath(new URL("../", import.meta.url)));

// Authentication data exists only in memory; never put credentials in traces or artifacts.
test.use({ trace: "off" });
// STAGE_V_SHOTS=1 also saves the screens that need a signed-in user, an admin recipe or print media.
const shots = process.env.STAGE_V_SHOTS === "1" ? fileURLToPath(new URL("../../../docs/redesign/shots/stage-v/", import.meta.url)) : undefined;
async function shoot(page: Page, name: string, target?: ReturnType<Page["locator"]>) {
  if (!shots) return;
  await mkdir(shots, { recursive: true });
  await page.addStyleTag({ content: ".back-to-top-control{visibility:hidden!important}" });
  if (target) await target.screenshot({ path: path.join(shots, `${name}.png`) });
  else await page.screenshot({ path: path.join(shots, `${name}.png`), fullPage: true });
}

async function demoAdmin() {
  const readme = await readFile(new URL("../../../README.md", import.meta.url), "utf8");
  const line = readme.split("\n").find(row => /^\|\s*Admin\s*\|/.test(row));
  const fields = line ? [...line.matchAll(/`([^`]+)`/g)].map(match => match[1]) : [];
  if (fields.length < 2) throw new Error("Documented demo admin account is unavailable");
  return { email: fields[0], password: fields[1] };
}

async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 400) { await page.mouse.wheel(0, 400); await page.waitForTimeout(60); }
  await page.waitForTimeout(1200);
}

test("pure guards: photo decision, missing-content lines and the catalog return path", async () => {
  const repository = await readFile(new URL("../src/server/recipes/repository.ts", import.meta.url), "utf8");
  expect(repository).toContain(`const DEFAULT_RECIPE_IMAGE_SRC = "${RECIPE_FALLBACK_IMAGE_SRC}";`);
  const musaka = curated.find(recipe => recipe.imageSrc === RECIPE_FALLBACK_IMAGE_SRC)!;
  expect(hasRecipePhoto(musaka)).toBe(true);
  expect(hasRecipePhoto({ slug: "admin-recipe-x", imageSrc: RECIPE_FALLBACK_IMAGE_SRC })).toBe(false);
  expect(hasRecipePhoto({ slug: "admin-recipe-x", imageSrc: "/images/recipes/own.png" })).toBe(true);
  expect(missingContentNotes(0, 0)).toEqual({ all: "Продуктите и стъпките за тази рецепта още не са добавени." });
  expect(missingContentNotes(0, 3).ingredients).toBe("Продуктите за тази рецепта още не са добавени.");
  expect(missingContentNotes(5, 0).steps).toBe("Стъпките за тази рецепта още не са добавени.");
  for (const value of ["//evil.example", "https://evil.example", "/catalog/shopska-salata", "/admin", null]) expect(validCatalogHref(value)).toBe("/catalog");
  expect(validCatalogHref("/catalog?q=%D0%B1%D0%BE%D0%B1&category=%D0%A1%D1%83%D0%BF%D0%B8")).toBe("/catalog?q=%D0%B1%D0%BE%D0%B1&category=%D0%A1%D1%83%D0%BF%D0%B8");
});

test("curated musaka keeps its photo; products are a plain list, each with its own icon and a static count", async ({ page }) => {
  const problems = watchProblems(page);
  await page.goto("/catalog/musaka-s-kartofi");
  await expect(page.locator(".r-hero")).toHaveAttribute("data-photo", "yes");
  await expect(page.locator(".r-hero img")).toHaveCount(1);

  await page.goto("/catalog/shopska-salata", { waitUntil: "networkidle" });
  const items = page.locator(".ing-list > li.ing");
  await expect(items).toHaveCount(8);
  await expect(page.locator(".ings-count")).toHaveText("8 продукта");
  await expect(page.locator(".ings-count")).not.toHaveAttribute("aria-live", /.+/);
  // Nothing to tick: no checkboxes, no struck-through copy, no clear button, nothing stored.
  await expect(page.locator('.ings input, .ing-s, .ing-clear')).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Изчисти отметките" })).toHaveCount(0);
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith("chefos:ingredients")))).toEqual([]);
  expect(await items.locator(".ing-ic").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-icon")))).toEqual(["tomato", "cucumber", "peppers", "onion", "cheese", "oil", "vinegar", "spices"]);
  for (const icon of await items.locator(".ing-ic").all()) {
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    const box = (await icon.locator("svg").boundingBox())!;
    expect(Math.round(box.width)).toBe(22);
  }
  // The visible text is the only name: the list reads as plain lines.
  await expect(items.first()).toHaveText("4 зрели домата");
  expect(problems.pageErrors).toEqual([]);
});

test("ingredient rows keep one height and line up, also on a phone", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/catalog/bob-chorba", { waitUntil: "networkidle" });
    const rows = await page.locator(".ing").evaluateAll(nodes => nodes.map(node => { const r = node.getBoundingClientRect(), icon = node.querySelector(".ing-ic")!.getBoundingClientRect(); return { h: Math.round(r.height), iconX: Math.round(icon.x) }; }));
    expect(new Set(rows.map(row => row.iconX)).size, `icons in one column at ${width}`).toBe(1);
    expect(Math.min(...rows.map(row => row.h)), `row height at ${width}`).toBeGreaterThanOrEqual(52);
  }
});

test("header is transparent over the recipe hero and solid after it; solid on pages without a hero", async ({ page }) => {
  await page.goto("/catalog/shopska-salata", { waitUntil: "networkidle" });
  const header = page.locator("header.hdr");
  await expect(header).not.toHaveClass(/\bsolid\b/);
  expect(await header.evaluate(node => getComputedStyle(node).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  const heroHeight = await page.locator(".r-hero").evaluate(node => node.getBoundingClientRect().height);
  // Solid before the hero text reaches the header: the logo never runs over the title.
  const textTop = await page.locator(".r-hero .hero-in").evaluate(node => (node as HTMLElement).offsetTop);
  await page.evaluate(top => window.scrollTo(0, top - 60), textTop);
  await expect(header).toHaveClass(/\bsolid\b/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).not.toHaveClass(/\bsolid\b/);
  await page.mouse.wheel(0, heroHeight + 40);
  await expect(header).toHaveClass(/\bsolid\b/);
  // The header fades to its solid ground (background-color transition), so wait for the end state.
  await expect.poll(() => header.evaluate(node => getComputedStyle(node).backgroundColor)).toBe("rgba(23, 15, 15, 0.82)");
  await page.mouse.wheel(0, -(heroHeight + 400));
  await expect(header).not.toHaveClass(/\bsolid\b/);

  // A page without a hero (the catalog) has the solid header from the top.
  await page.goto("/catalog", { waitUntil: "networkidle" });
  expect(await page.locator("header.hdr").evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
});

test("back to catalog keeps ?q= and ?category= from the catalog view the visitor came from", async ({ page }) => {
  await page.goto("/catalog/bob-chorba");
  await expect(page.getByRole("link", { name: "Към рецептите" })).toHaveAttribute("href", "/catalog");
  await page.goto("/catalog?q=%D0%B1%D0%BE%D0%B1&category=%D0%A1%D1%83%D0%BF%D0%B8", { waitUntil: "networkidle" });
  await page.locator('a[href="/catalog/bob-chorba"]').first().click();
  await page.waitForURL("**/catalog/bob-chorba");
  const back = page.getByRole("link", { name: "Към рецептите" });
  await expect(back).toHaveAttribute("href", /^\/catalog\?/);
  await back.click();
  await page.waitForURL(url => url.pathname === "/catalog");
  const url = new URL(page.url());
  expect(url.searchParams.get("q")).toBe("боб");
  expect(url.searchParams.get("category")).toBe("Супи");
});

test("favourite: a guest goes to login and back to the same recipe; heart pops, count bumps, state survives reload", async ({ page }) => {
  test.setTimeout(180_000);
  const email = `stage-v-${randomUUID()}@chefos-tests.invalid`;
  const password = randomBytes(18).toString("hex");
  const db = getDb();
  try {
    await page.goto("/catalog/bob-chorba");
    const save = page.getByRole("button", { name: "Запази в любими", exact: true });
    await expect(save).toHaveAttribute("aria-pressed", "false");
    await save.click();
    await page.waitForURL(/\/login\?next=/);
    expect(new URL(page.url()).searchParams.get("next")).toBe("/catalog/bob-chorba");
    await page.getByRole("link", { name: "Регистрация", exact: true }).first().click();
    await page.getByLabel("Име", { exact: true }).fill("Проверка етап В");
    await page.getByLabel("Имейл", { exact: true }).fill(email);
    await page.getByLabel("Парола", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Създай профил", exact: true }).click();
    await page.waitForURL("**/catalog/bob-chorba");

    const count = page.locator('header [data-testid="favorite-count"]');
    await expect(count).toHaveText("0");
    await expect(count).not.toHaveClass(/\bbump\b/);
    await page.getByRole("button", { name: "Запази в любими", exact: true }).click();
    await expect(page.locator(".heart-lg .heart-ico.pop")).toHaveCount(1);
    const remove = page.getByRole("button", { name: "Премахни от любими", exact: true });
    await expect(remove).toHaveAttribute("aria-pressed", "true");
    await expect(count).toHaveText("1");
    await expect(count).toHaveClass(/\bbump\b/);
    await page.waitForTimeout(700);
    await shoot(page, "heart-added-1440", page.locator(".actions"));
    if (shots) await page.locator("header.hdr").screenshot({ path: path.join(shots, "header-count-1440.png") });

    await page.reload();
    await expect(page.getByRole("button", { name: "Премахни от любими", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('header [data-testid="favorite-count"]')).not.toHaveClass(/\bbump\b/);
    await page.getByRole("button", { name: "Премахни от любими", exact: true }).click();
    await expect(page.getByRole("button", { name: "Запази в любими", exact: true })).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator('header [data-testid="favorite-count"]')).toHaveText("0");
  } finally {
    const created = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    for (const user of created) { await db.delete(favorites).where(eq(favorites.userId, user.id)); await db.delete(users).where(eq(users.id, user.id)); }
    expect(await db.select({ id: users.id }).from(users).where(eq(users.email, email))).toHaveLength(0);
  }
});

test("admin recipe on the substitute image: dark hero without a photo and one muted line instead of empty lists", async ({ page }) => {
  test.setTimeout(180_000);
  const admin = await demoAdmin();
  const title = `E2E етап В ${randomUUID().slice(0, 8)}`;
  let slug: string | undefined;
  const db = getDb();
  try {
    await page.goto("/login?next=%2Fadmin");
    await page.getByLabel("Имейл", { exact: true }).fill(admin.email);
    await page.getByLabel("Парола", { exact: true }).fill(admin.password);
    await page.getByRole("button", { name: "Влез", exact: true }).click();
    await page.waitForURL(url => url.pathname === "/admin");
    await page.getByRole("link", { name: "Добави рецепта", exact: true }).first().click();
    await page.getByLabel("Заглавие", { exact: true }).fill(title);
    await page.getByLabel("Категория", { exact: true }).fill("Салати");
    await page.getByLabel("Описание", { exact: true }).fill("Временна рецепта за проверка на страницата без снимка.");
    await page.getByLabel("Време за подготовка", { exact: true }).fill("10");
    await page.getByLabel("Време за готвене", { exact: true }).fill("0");
    await page.getByLabel("Порции", { exact: true }).fill("2");
    await page.getByRole("button", { name: "Запази рецепта", exact: true }).click();
    await page.waitForURL(url => url.pathname === "/admin");
    const href = (await page.locator(".admin-row").filter({ hasText: title }).getByRole("link", { name: "Редактирай", exact: true }).getAttribute("href"))!;
    slug = decodeURIComponent(href.split("/").at(-2)!);

    const problems = watchProblems(page);
    await page.goto(`/catalog/${slug}`, { waitUntil: "networkidle" });
    const hero = page.locator(".r-hero");
    await expect(hero).toHaveAttribute("data-photo", "none");
    await expect(hero.locator("img")).toHaveCount(0);
    // Sofra: an admin recipe without a photo sits on the solid --surface ground.
    expect(await hero.evaluate(node => getComputedStyle(node).backgroundColor)).toBe("rgb(34, 22, 20)");
    expect(await hero.locator("h1").evaluate(node => getComputedStyle(node).color)).toBe("rgb(255, 255, 255)");
    await expect(page.locator(".r-hero .eyebrow")).toHaveText("Салати");
    await expect(page.locator(".meta dd").nth(1)).toHaveText("Без готвене");
    await expect(page.locator(".r-missing")).toHaveText(["Продуктите и стъпките за тази рецепта още не са добавени."]);
    await expect(page.locator('.ing-ic, .ings-count, .st-list')).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Запази в любими", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Принтирай рецептата", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Към рецептите" })).toBeVisible();
    await expect(page.locator(".next")).toHaveAttribute("href", `/catalog/${curated[0].slug}`);
    for (const width of [360, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `overflow at ${width}`).toBe(0);
    }
    expect(problems.pageErrors).toEqual([]);
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.waitForTimeout(400);
      await shoot(page, `no-photo-${width}`);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/admin");
    await page.locator(".admin-row").filter({ hasText: title }).getByRole("button", { name: "Изтрий", exact: true }).click();
    await expect(page.locator(".admin-row").filter({ hasText: title })).toHaveCount(0);
    expect((await page.goto(`/catalog/${slug}`))!.status()).toBe(404);
  } finally {
    // Exact runtime title/slug only; no wildcard cleanup of user data.
    const remaining = await db.select({ id: recipes.id }).from(recipes).where(slug ? eq(recipes.slug, slug) : eq(recipes.title, title));
    for (const recipe of remaining) {
      await db.delete(favorites).where(eq(favorites.recipeId, recipe.id));
      await db.delete(recipeTags).where(eq(recipeTags.recipeId, recipe.id));
      await db.delete(recipeSteps).where(eq(recipeSteps.recipeId, recipe.id));
      await db.delete(recipes).where(eq(recipes.id, recipe.id));
    }
    expect(await db.select({ id: recipes.id }).from(recipes).where(slug ? eq(recipes.slug, slug) : eq(recipes.title, title))).toHaveLength(0);
  }
});

test("print: title, products with their small icons and steps; no hero photo, header, footer or buttons", async ({ page }) => {
  await page.goto("/catalog/shopska-salata");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("header")).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.locator(".r-hero .hero-ph")).toBeHidden();
  await expect(page.locator(".actions")).toBeHidden();
  await expect(page.locator(".ings-count")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("color", "rgb(17, 17, 17)");
  await expect(page.getByRole("heading", { name: "Продукти", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Начин на приготвяне", exact: true })).toBeVisible();
  // The icons print small and black, without their chip; the text stays black.
  const icon = page.locator(".ing-ic").first();
  await expect(icon).toBeVisible();
  await expect(icon).toHaveCSS("color", "rgb(17, 17, 17)");
  await expect(icon).toHaveCSS("border-top-width", "0px");
  await expect(page.locator(".ing-t").first()).toHaveCSS("color", "rgb(17, 17, 17)");
  // Nothing may print faded or shifted, even right after switching to print (reveals mid-flight).
  const faded = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>(".recipe-print-page [data-r], .recipe-print-page .wi")].filter(node => {
    const style = getComputedStyle(node);
    return style.opacity !== "1" || style.transform !== "none";
  }).length);
  expect(faded).toBe(0);
  const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
  expect(pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length ?? 0, "short recipe fits one A4 page").toBe(1);
  if (shots) {
    await mkdir(shots, { recursive: true });
    await page.screenshot({ path: path.join(shots, "print-shopska.png"), fullPage: true });
    await writeFile(path.join(shots, "print-shopska.pdf"), pdf);
  }
});

for (const slug of ["shopska-salata", "bob-chorba"]) {
  test(`no horizontal scroll on /catalog/${slug} at 360–1920`, async ({ page }) => {
    for (const width of [360, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/catalog/${slug}`, { waitUntil: "networkidle" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `overflow at ${width}`).toBe(0);
    }
  });
}

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("recipe page: nothing hidden, no intro zoom", async ({ page }) => {
    await page.goto("/catalog/shopska-salata", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    const hidden = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("h1, h2, .rv, .wi, .r-desc, .ing, .st")].filter(node => {
      const style = getComputedStyle(node);
      return style.opacity === "0" || style.transform !== "none" || style.visibility === "hidden";
    }).length);
    expect(hidden).toBe(0);
    expect(await page.locator(".r-hero .hero-ph img").evaluate(node => getComputedStyle(node).animationName)).toBe("none");
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("recipe page: everything visible, solid header, the product icons are there", async ({ page }) => {
    await page.goto("/catalog/bob-chorba");
    const hidden = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("h1, h2, .rv, .wi, .r-desc, .ing, .st, .actions .btn")].filter(node => {
      const style = getComputedStyle(node);
      return style.opacity === "0" || style.transform !== "none" || style.visibility === "hidden";
    }).length);
    expect(hidden).toBe(0);
    expect(await page.locator("header.hdr").evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
    await expect(page.locator(".ing-ic")).toHaveCount(8);
  });
});

test("next recipe: curated order, wraps to the first; a large row with its photograph that shifts on hover", async ({ page }) => {
  expect(nextCuratedRecipe(curated[0].slug).recipe.slug).toBe(curated[1].slug);
  expect(nextCuratedRecipe(curated[curated.length - 1].slug)).toEqual({ recipe: curated[0], number: "Nº 01" });
  expect(nextCuratedRecipe("admin-recipe-x").recipe.slug).toBe(curated[0].slug);

  await page.goto(`/catalog/${curated[0].slug}`, { waitUntil: "networkidle" });
  const row = page.locator("a.next");
  await expect(row).toHaveAttribute("href", `/catalog/${curated[1].slug}`);
  await expect(row.locator(".ne")).toHaveText("Следваща рецепта");
  await expect(row.locator("b")).toHaveText(curated[1].title);
  await expect(row.locator(".nm")).toHaveText(new RegExp(`^${curated[1].category} · `));
  await expect(row.locator(".ni img")).toHaveCount(1);
  await row.scrollIntoViewIfNeeded();
  const box = (await row.locator("b").boundingBox())!;
  await page.mouse.move(box.x + 40, box.y + box.height / 2);
  await expect.poll(() => row.locator("b").evaluate(node => new DOMMatrix(getComputedStyle(node).transform).m41)).toBeGreaterThan(10);
  await expect(page.locator("#recipe-preview")).toHaveCount(0);

  await page.goto(`/catalog/${curated[curated.length - 1].slug}`);
  await expect(page.locator("a.next")).toHaveAttribute("href", `/catalog/${curated[0].slug}`);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("a.next")).toBeHidden();
});

test("meta row: words are smaller than numbers and stay on one line from 390 to 1920; bob chorba notes the overnight soak", async ({ page }) => {
  await page.goto("/catalog/shopska-salata", { waitUntil: "networkidle" });
  for (const width of [390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(150);
    const cells = await page.locator(".meta dd").evaluateAll(nodes => nodes.map(node => {
      const style = getComputedStyle(node);
      const range = document.createRange(); range.selectNodeContents(node);
      const lines = new Set([...range.getClientRects()].map(rect => Math.round(rect.top))).size;
      return { word: node.classList.contains("word"), size: parseFloat(style.fontSize), lines, fits: node.scrollWidth <= node.clientWidth + 1, text: node.textContent };
    }));
    const words = cells.filter(cell => cell.word);
    expect(words.map(cell => cell.text), `words at ${width}`).toEqual(["Без готвене", "Лесна"]);
    for (const cell of words) {
      expect(cell.lines, `${cell.text} on one line at ${width}`).toBe(1);
      expect(cell.fits, `${cell.text} fits its cell at ${width}`).toBe(true);
      expect(cell.size, `${cell.text} smaller than the numbers at ${width}`).toBeLessThan(Math.min(...cells.filter(c => !c.word).map(c => c.size)));
    }
  }
  await expect(page.locator(".meta-note")).toHaveCount(0);
  await page.goto("/catalog/bob-chorba");
  await expect(page.locator(".meta dd").first()).toContainText("20 мин");
  await expect(page.locator(".meta dd").first().locator(".meta-note")).toHaveText("+ накисване през нощта");
});

for (const width of [390, 1440]) {
  test(`back to top at ${width}px: hidden while reading down and over the footer, shown when scrolling up; filled hover, focus ring`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    for (const url of ["/", "/catalog/shopska-salata", "/catalog"]) {
      await page.goto(url, { waitUntil: "networkidle" });
      const button = page.getByRole("button", { name: "Върни се най-горе" });
      await expect(button).toHaveAttribute("data-hidden", "");
      // Read down to a point past the first screen that keeps the footer out of view.
      const target = await page.evaluate(() => Math.min(1600, document.querySelector("footer")!.getBoundingClientRect().top + window.scrollY - innerHeight - 500));
      // A page too short to read past the first screen without reaching the footer never shows the button.
      if (target > 760) {
        for (let y = 0; y < target; y += 300) { await page.mouse.wheel(0, Math.min(300, target - y)); await page.waitForTimeout(80); }
        await page.waitForTimeout(300);
        await expect(button, `${url}: hidden while reading down`).toHaveAttribute("data-hidden", "");
        await page.mouse.wheel(0, -120);
        await expect(button, `${url}: shown when scrolling up`).not.toHaveAttribute("data-hidden", "");
        await expect(button).toHaveCSS("opacity", "1");
        if (width === 1440) {
          const rest = await button.evaluate(node => getComputedStyle(node, "::before").transform);
          expect(rest).not.toBe("none");
          await button.hover();
          // The ink layer slides in from the left and covers the whole button.
          await expect.poll(() => button.evaluate(node => getComputedStyle(node, "::before").transform)).toBe("none");
          await page.mouse.move(10, 10);
        }
        await button.focus();
        expect(await button.evaluate(node => getComputedStyle(node).outlineStyle)).toBe("solid");
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.mouse.wheel(0, -40);
      await page.waitForTimeout(400);
      await expect(button, `${url}: hidden over the footer`).toHaveAttribute("data-hidden", "");
    }
  });
}

test("recipe metadata: canonical, Open Graph and Twitter card from the recipe", async ({ page }) => {
  await page.goto("/catalog/bob-chorba");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/catalog\/bob-chorba$/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Боб чорба");
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /бял боб/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/images\/social\/.+\.jpg$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
});

test("unknown recipe slug answers 404 with the styled page", async ({ page }) => {
  const response = await page.goto("/catalog/takava-retsepta-nyama");
  expect(response!.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Тази страница не е на масата");
});
