import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import nextEnv from "@next/env";
import { eq, getDb, users } from "@chefos/db";
import { recipes } from "../src/data/recipes";

const require = createRequire(import.meta.url);
const { createLoader } = require("../scripts/load-typescript.cjs");
const root = fileURLToPath(new URL("../", import.meta.url));
nextEnv.loadEnvConfig(root);
const metadata = createLoader()(path.join(root, "src/lib/site-metadata.ts"));
// Existing documented credentials stay in memory. No trace, screenshot or registration.
test.use({ trace: "off" });

async function checkHead(page: Page, route: string, title: string, noindex = false, canonical = route) {
  await page.goto(route, { waitUntil: "networkidle" });
  await expect(page).toHaveTitle(title);
  await expect(page.locator("html")).toHaveAttribute("lang", "bg");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /[А-Яа-я]{3}/);
  // Next normalizes the home canonical without a trailing slash; compare parsed absolute URLs.
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  expect(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).href).toBe(metadata.absoluteUrl(canonical));
  expect(new URL((await page.locator('meta[property="og:url"]').getAttribute("content"))!).href).toBe(metadata.absoluteUrl(canonical));
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "bg_BG");
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Chefo's Recipes");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  const images = page.locator('meta[property="og:image"]');
  await expect(images).toHaveCount(1);
  const image = new URL((await images.getAttribute("content"))!);
  expect(image.origin).toBe(metadata.SITE_URL); expect(image.pathname).toMatch(/^\/images\/social\/[a-z0-9-]+\.jpg$/);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", image.href);
  // The requested production origin is intentional; validate the matching local artifact before deploy.
  const response = await page.request.get(image.pathname);
  expect(response.status()).toBe(200);
  const size = await require("sharp")(await response.body()).metadata();
  expect([size.width, size.height, size.format]).toEqual([1200, 630, "jpeg"]);
  const robots = await page.locator('meta[name="robots"]').allTextContents();
  const contents = await page.locator('meta[name="robots"]').evaluateAll(nodes => nodes.map(node => node.getAttribute("content")));
  expect(robots.length).toBeGreaterThan(0);
  expect(contents.some(content => content?.includes("noindex"))).toBe(noindex);
}

for (const [route, title, noindex] of [
  ["/", metadata.HOME_TITLE, false],
  ["/catalog", "Каталог с рецепти · Chefo's Recipes", false],
  ["/about", "За нас · Chefo's Recipes", false],
  ["/login", "Вход · Chefo's Recipes", true],
  ["/register", "Регистрация · Chefo's Recipes", true],
  ["/catalog/shopska-salata", "Шопска салата · Chefo's Recipes", false]
] as const) test(`Bulgarian title, canonical, social JPEG and robots: ${route}`, async ({ page }) => {
  await checkHead(page, route, title, noindex);
});

test("styled 404 has its own description, canonical, social card and noindex", async ({ page }) => {
  await checkHead(page, "/niama-takava-stranica", "Страницата не е намерена · Chefo's Recipes", true, "/404");
});

test("authenticated private pages and admin forms have metadata and noindex, without DB writes", async ({ page }) => {
  const readme = await readFile(path.resolve(root, "../../README.md"), "utf8");
  const row = readme.split("\n").find(line => /^\|\s*Admin\s*\|/.test(line))!;
  const [email, password] = [...row.matchAll(/`([^`]+)`/g)].map(match => match[1]);
  // Favorite read paths can provision a missing demo user. Refuse to visit them unless it exists.
  const existing = await getDb().select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  expect(existing.length, "Read-only prerequisite: documented admin already exists; never create it").toBe(1);
  await page.goto("/login?next=%2Fprofile");
  await page.getByLabel("Имейл", { exact: true }).fill(email);
  await page.getByLabel("Парола", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Влез", exact: true }).click();
  await page.waitForURL("**/profile");
  for (const [route, title] of [
    ["/favorites", "Любими рецепти"], ["/profile", "Профил"], ["/admin", "Админ панел"],
    ["/admin/recipes/new", "Нова рецепта"], ["/admin/recipes/shopska-salata/edit", "Редакция на рецепта"]
  ]) await checkHead(page, route, `${title} · Chefo's Recipes`, true);
  // No submit/save/delete/favorite action is performed.
});

test("Recipe JSON-LD matches the loaded recipe, ISO durations and HowToStep instructions", async ({ page }) => {
  const recipe = recipes[0];
  await page.goto(`/catalog/${recipe.slug}`);
  const script = page.locator('script[type="application/ld+json"]');
  await expect(script).toHaveCount(1);
  const data = JSON.parse((await script.textContent())!);
  expect(data).toEqual(metadata.recipeJsonLd(recipe));
  expect(data["@type"]).toBe("Recipe");
  expect(data.prepTime).toBe("PT20M"); expect(data.cookTime).toBe("PT0M");
  expect(data.recipeIngredient).toEqual(recipe.ingredients);
  expect(data.recipeInstructions.every((step: { "@type": string; text: string }) => step["@type"] === "HowToStep" && step.text)).toBe(true);
  expect(new URL(data.image[0]).origin).toBe(metadata.SITE_URL);
});

test("JSON-LD escaping preserves hostile recipe text without ending the script; missing photos use the generic JPEG", () => {
  const recipe = { ...recipes[0], slug: "без-снимка", imageSrc: undefined, description: '</script><script>alert("x")</script>' };
  const data = metadata.recipeJsonLd(recipe), serialized = metadata.serializeJsonLd(data);
  expect(serialized).not.toContain("<"); expect(JSON.parse(serialized)).toEqual(data);
  expect(data.image).toEqual([metadata.absoluteUrl(metadata.SITE_IMAGE)]);
});

test("all social recipe JPEGs load with 1200×630 dimensions", async ({ request }) => {
  const names: string[] = require("../src/lib/web-images.json");
  for (const name of names) {
    const response = await request.get(`/images/social/${name}.jpg`);
    expect(response.status(), name).toBe(200);
    const image = await require("sharp")(await response.body()).metadata();
    expect([image.width, image.height, image.format], name).toEqual([1200, 630, "jpeg"]);
  }
});

test("robots and sitemap use the catalog's same bounded public recipes, encoded URLs, no private routes", async ({ page, request }) => {
  const robots = await request.get("/robots.txt"); expect(robots.status()).toBe(200);
  const text = await robots.text();
  expect(text).toContain("Allow: /"); expect(text).toContain("Disallow: /admin"); expect(text).toContain("Disallow: /api");
  expect(text).toContain(`Sitemap: ${metadata.absoluteUrl("/sitemap.xml")}`);
  await page.goto("/catalog", { waitUntil: "networkidle" });
  await expect.poll(() => page.locator(".cards .card a.cb[href]").count()).toBeGreaterThanOrEqual(recipes.length);
  const slugs = await page.locator(".cards .card a.cb[href]").evaluateAll(nodes => nodes.map(node => new URL(node.getAttribute("href")!, location.origin).pathname));
  const response = await request.get("/sitemap.xml"); expect(response.status()).toBe(200);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  const expected = ["/", "/catalog", "/about", ...slugs].map(route => metadata.absoluteUrl(route));
  expect(urls.sort()).toEqual(expected.sort());
  expect(urls.length).toBeLessThanOrEqual(77);
  expect(xml).not.toMatch(/[А-Яа-я]/);
  expect(xml).not.toMatch(/\/admin|\/login|\/register|\/favorites|\/profile/);
});

test("sitemap uses one catalog lookup and encodes Cyrillic slugs without querying individual recipes", async () => {
  let queries = 0;
  const load = createLoader({ "../server/recipes/catalog": { getPublicRecipes: async () => { queries++; return [{ slug: "пиле-тариаки" }]; } } });
  const result = await load(path.join(root, "src/app/sitemap.ts")).default();
  expect(queries).toBe(1);
  expect(result.map((row: { url: string }) => row.url)).toContain(metadata.absoluteUrl("/catalog/" + encodeURIComponent("пиле-тариаки")));
});

test("SITE_URL is optional, validated and read-only", () => {
  expect(metadata.siteOrigin(undefined)).toMatch(/^https?:\/\//);
  expect(metadata.siteOrigin("https://preview.example/subpath")).toBe("https://preview.example");
  for (const value of ["not a URL", "javascript:alert(1)", "https://user:pass@example.com"]) expect(metadata.siteOrigin(value)).toBe(metadata.PUBLIC_SITE_URL);
});

test("StitchStar icon, Apple icon and Bulgarian manifest return 200 with the approved dimensions/colors", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
  for (const selector of ['link[rel="icon"]', 'link[rel="apple-touch-icon"]']) {
    const href = await page.locator(selector).last().getAttribute("href");
    expect((await request.get(href!)).status()).toBe(200);
  }
  const icon = await request.get("/icon.svg"); expect(icon.status()).toBe(200);
  expect(await icon.text()).toContain("#170F0F"); expect(await icon.text()).toContain("#C81E2B");
  const apple = await request.get("/apple-icon.jpg"); expect(apple.status()).toBe(200);
  const image = await require("sharp")(await apple.body()).metadata();
  expect([image.width, image.height, image.format]).toEqual([180, 180, "jpeg"]);
  const response = await request.get("/manifest.webmanifest"); expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ lang: "bg", name: metadata.HOME_TITLE, short_name: "Chefo's Recipes", theme_color: "#170F0F", background_color: "#170F0F" });
});
