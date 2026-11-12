import { expect, test, type Page } from "@playwright/test";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { eq, getDb, users, recipes, favorites, recipeSteps, recipeTags } from "@chefos/db";
import { safeNextPath } from "../src/lib/navigation";
import { validRegistration } from "../src/lib/auth";
import { filterCatalog, toCardRecipe } from "../src/lib/catalog";
import { recipes as curated } from "../src/data/recipes";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(fileURLToPath(new URL("../", import.meta.url)));

// Authentication data exists only in memory; never put credentials in traces or artifacts.
test.use({ trace: "off" });
const evidence = fileURLToPath(new URL("../../../docs/redesign/shots/stabilization-b/", import.meta.url));

async function demoAdmin() {
  const readme = await readFile(new URL("../../../README.md", import.meta.url), "utf8");
  const line = readme.split("\n").find(line => /^\|\s*Admin\s*\|/.test(line));
  if (!line) throw new Error("Documented demo admin account is unavailable");
  const fields = [...line.matchAll(/`([^`]+)`/g)].map(match => match[1]);
  if (fields.length < 2) throw new Error("Documented demo admin account format is unavailable");
  return { email: fields[0], password: fields[1] };
}

async function login(page: Page, email: string, password: string, next = "/profile") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Имейл", { exact: true }).fill(email);
  await page.getByLabel("Парола", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Влез", exact: true }).click();
  await page.waitForURL(url => url.pathname === next.split("?")[0] && !url.searchParams.has("error"));
}

test("pure guards: internal next paths, registration and lean searchable cards", () => {
  for (const value of ["//evil.example", "https://evil.example", "/\\evil.example", "/%2f%2fevil.example", "/%5cevil.example", "/%0d%0aLocation:evil", "javascript:alert(1)", " /profile", "/%zz"]) expect(safeNextPath(value)).toBe("/");
  expect(safeNextPath("/catalog?q=shopska&category=x")).toBe("/catalog?q=shopska&category=x");
  expect(validRegistration("", "wrong", "short")).toBe(false);
  const cards = curated.map(toCardRecipe);
  expect(cards.every(card => !("ingredients" in card) && !("steps" in card))).toBe(true);
  expect(filterCatalog(cards, "ShOpSkA", "Салати").map(recipe => recipe.slug)).toContain("shopska-salata");
});

test("debounced Cyrillic/slug search, combined category, clear and URL history", async ({ page }) => {
  // Wait for hydration: the catalog reads ?q= / ?category= from the URL once it is interactive.
  await page.goto("/catalog", { waitUntil: "networkidle" });
  const search = page.getByRole("searchbox");
  await search.fill("shopska");
  await expect(page).toHaveURL(/q=shopska/);
  await expect(page.locator(".recipe-card")).toHaveCount(1);
  await expect(page.locator(".recipe-card h3")).toHaveText("Шопска салата");
  await page.getByRole("button", { name: "Салати", exact: true }).click();
  await expect(page).toHaveURL(/category=/);
  await expect(page.getByRole("button", { name: "Салати", exact: true })).toHaveAttribute("aria-pressed", "true");
  const url = page.url();
  await page.reload(); await expect(search).toHaveValue("shopska");
  await expect(page.locator(".recipe-card")).toHaveCount(1);
  await search.fill("няма-такава-рецепта");
  await expect(page.getByRole("heading", { name: "Няма намерени рецепти" })).toBeVisible();
  await expect(page).not.toHaveURL(url);
  await page.goBack(); await expect(search).toHaveValue("shopska");
  await expect(page.locator(".recipe-card")).toHaveCount(1);
  await page.goForward(); await expect(search).toHaveValue("няма-такава-рецепта");
  await page.getByRole("button", { name: "Изчисти", exact: true }).click();
  await expect(page).toHaveURL(/\/catalog$/);
  await search.fill("Таратор"); await expect(page.locator(".recipe-card")).toHaveCount(1); await expect(page.locator(".recipe-card h3")).toHaveText("Таратор");
});

for (const category of [...new Set(curated.map(recipe => recipe.category))]) {
  test(`home rail applies category: ${category}`, async ({ page }) => {
    await page.goto("/");
    await page.locator("#category-rail").getByRole("link", { name: new RegExp(category) }).click();
    await expect(page).toHaveURL(/\/catalog\?category=/);
    await expect(page.getByRole("button", { name: category, exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(await page.locator(".recipe-card").count()).toBeGreaterThanOrEqual(curated.filter(recipe => recipe.category === category).length);
    for (const card of await page.locator(".recipe-card").all()) await expect(card).toContainText(category);
  });
}

test("all bounded public catalog recipes have details and metadata, uppercase gets styled 404", async ({ page, request }) => {
  await page.goto("/catalog");
  const slugs = new Set<string>();
  for (;;) {
    for (const href of await page.locator('.recipe-card > a').evaluateAll(nodes => nodes.map(node => node.getAttribute("href")!))) slugs.add(href);
    const next = page.getByRole("button", { name: "Следваща", exact: true });
    if (await next.isDisabled()) break;
    await next.click();
  }
  expect(slugs.size).toBeGreaterThanOrEqual(24);
  for (const href of slugs) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
    const html = await response.text();
    expect(html).toContain('<meta name="description"');
    expect(html).toContain("Chefo");
  }
  const upper = await page.goto("/catalog/SHOPSKA-SALATA");
  expect(upper!.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /не е намерена/i })).toBeVisible();
});

test("real Neon registration, auth errors, return path, favorites without reload and guards", async ({ page, request }) => {
  test.setTimeout(180_000);
  const email = `stabilization-${randomUUID()}@chefos-tests.invalid`;
  const password = randomBytes(18).toString("hex");
  const db = getDb();
  try {
    await page.goto("/catalog/shopska-salata");
    // The detail page's favourite button is named by its visible text (axe label-content-name-mismatch).
    await page.getByRole("button", { name: "Запази в любими", exact: true }).click();
    await page.waitForURL(/\/login\?next=/);
    expect(new URL(page.url()).searchParams.get("next")).toBe("/catalog/shopska-salata");
    await page.getByRole("link", { name: "Регистрация", exact: true }).first().click();
    await page.getByLabel("Име", { exact: true }).fill("Проверка на функционалност");
    await page.getByLabel("Имейл", { exact: true }).fill("invalid");
    await page.getByRole("button", { name: "Създай профил", exact: true }).click();
    expect(await page.getByLabel("Имейл", { exact: true }).evaluate((node: HTMLInputElement) => node.validationMessage)).toContain("имейл");
    await page.getByLabel("Имейл", { exact: true }).fill(email);
    await page.getByLabel("Парола", { exact: true }).fill(password);
    const post = page.waitForRequest(req => req.method() === "POST");
    await page.getByRole("button", { name: "Създай профил", exact: true }).click();
    await post;
    await page.waitForURL("**/catalog/shopska-salata");
    const persisted = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    expect(persisted).toHaveLength(1);
    await expect(page.locator('header [data-testid="favorite-count"]')).toHaveText("0");
    await page.evaluate(() => { (window as Window & { testDocument?: string }).testDocument = "same-document"; });
    await page.getByRole("button", { name: "Запази в любими", exact: true }).click();
    await expect(page.getByRole("button", { name: "Премахни от любими", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('header [data-testid="favorite-count"]')).toHaveText("1");
    expect(await page.evaluate(() => (window as Window & { testDocument?: string }).testDocument)).toBe("same-document");
    expect((await db.select().from(favorites).where(eq(favorites.userId, persisted[0].id))).length).toBe(1);
    await page.goto("/favorites");
    await expect(page.locator(".recipe-card")).toHaveCount(1);
    await page.getByRole("button", { name: "Премахни Шопска салата от любими", exact: true }).click();
    await expect(page.locator(".recipe-card")).toHaveCount(0);
    await expect(page.locator('header [data-testid="favorite-count"]')).toHaveText("0");
    await page.goto("/admin"); await expect(page).toHaveURL(/\/profile$/);
    await page.getByRole("button", { name: "Изход", exact: true }).first().click();
    await page.waitForURL("**/");
    for (const path of ["/profile", "/favorites", "/admin"]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(307); expect(response.headers().location).toContain("/login?next=");
    }
    await page.goto("/login?next=%2Fcatalog");
    await page.getByLabel("Имейл", { exact: true }).fill(email);
    await page.getByLabel("Парола", { exact: true }).fill("not-the-password");
    await page.route("**/login**", async route => {
      if (route.request().method() === "POST") await new Promise(resolve => setTimeout(resolve, 800));
      await route.continue();
    });
    const submitting = page.getByRole("button", { name: "Влез", exact: true }).click();
    await expect(page.getByRole("button", { name: "Изчакай…", exact: true })).toBeDisabled();
    await submitting;
    await expect(page.getByText("Невалиден имейл или парола.", { exact: true })).toBeVisible();
    await page.unrouteAll({ behavior: "wait" });
    // Submit a forged hidden next, not just a query rejected by the page.
    await page.getByLabel("Имейл", { exact: true }).fill(email);
    await page.getByLabel("Парола", { exact: true }).fill(password);
    await page.locator('input[name="next"]').evaluate((node: HTMLInputElement) => { node.value = "//evil.example"; });
    await page.getByRole("button", { name: "Влез", exact: true }).click();
    await page.waitForURL(url => url.pathname === "/");
    expect(new URL(page.url()).hostname).toBe("localhost");
  } finally {
    const created = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    for (const user of created) { await db.delete(favorites).where(eq(favorites.userId, user.id)); await db.delete(users).where(eq(users.id, user.id)); }
    expect(await db.select({ id: users.id }).from(users).where(eq(users.email, email))).toHaveLength(0);
  }
});

test("real Neon admin creates, edits stable slug and deletes only its test recipe; fallback image", async ({ page }) => {
  test.setTimeout(180_000);
  const admin = await demoAdmin();
  const title = `E2E stabilization ${randomUUID()}`;
  let slug: string | undefined;
  const db = getDb();
  try {
    await login(page, admin.email, admin.password, "/admin");
    await page.getByRole("link", { name: "Добави рецепта", exact: true }).first().click();
    await page.getByLabel("Заглавие", { exact: true }).fill(title);
    await page.getByLabel("Категория", { exact: true }).fill("Салати");
    await page.getByLabel("Описание", { exact: true }).fill("Временна рецепта за автоматична проверка. Изтрива се в края на теста.");
    await page.getByLabel("Време за подготовка", { exact: true }).fill("5");
    await page.getByLabel("Време за готвене", { exact: true }).fill("0");
    await page.getByLabel("Порции", { exact: true }).fill("2");
    await page.getByRole("button", { name: "Запази рецепта", exact: true }).click();
    await page.waitForURL("**/admin");
    const row = page.locator(".admin-row").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
    await expect(row).toHaveCount(1);
    const href = (await row.getByRole("link", { name: "Редактирай", exact: true }).getAttribute("href"))!;
    slug = decodeURIComponent(href.split("/").at(-2)!);
    const created = await db.select({ id: recipes.id, imageUrl: recipes.imageUrl }).from(recipes).where(eq(recipes.slug, slug));
    expect(created).toHaveLength(1);
    expect(created[0].imageUrl).toBeNull();
    await page.goto(`/catalog/${slug}`);
    // Owner decision (stage V): a manual recipe on the repository's substitute image has a dark hero without a photo.
    await expect(page.locator(".recipe-hero")).toHaveAttribute("data-photo", "none");
    await expect(page.locator(".recipe-hero img")).toHaveCount(0);
    await page.goto(href);
    await page.getByLabel("Заглавие", { exact: true }).fill(title + " edited");
    await page.getByLabel("Описание", { exact: true }).fill("Обновена временна рецепта за проверка.");
    await page.getByRole("button", { name: /Запази/ }).click();
    await page.waitForURL("**/admin");
    await page.goto(`/catalog/${slug}`); await expect(page.getByRole("heading", { level: 1 })).toHaveText(title + " edited");
    await page.goto("/admin");
    await page.locator(".admin-row").filter({ hasText: title + " edited" }).getByRole("button", { name: "Изтрий", exact: true }).click();
    await expect(page.locator(".admin-row").filter({ hasText: title })).toHaveCount(0);
    expect(await db.select({ id: recipes.id }).from(recipes).where(eq(recipes.slug, slug))).toHaveLength(0);
    expect((await page.goto(`/catalog/${slug}`))!.status()).toBe(404);
  } finally {
    // Exact runtime UUID title/slug only; no wildcard cleanup of user data.
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

test("short recipe prints on one page with title, ingredients and steps only", async ({ page }) => {
  await page.goto("/catalog/shopska-salata");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("header")).toBeHidden(); await expect(page.locator("footer")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Шопска салата");
  await expect(page.getByRole("heading", { name: "Продукти", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Начин на приготвяне", exact: true })).toBeVisible();
  await mkdir(evidence, { recursive: true });
  await page.screenshot({ path: path.join(evidence, "shopska-print.png"), fullPage: true });
  const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
  await writeFile(path.join(evidence, "shopska-print.pdf"), pdf);
  const pages = pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length ?? 0;
  expect(pages).toBe(1);
});
