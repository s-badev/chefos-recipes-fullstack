import { expect, test } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import nextEnv from "@next/env";
import { eq, getDb, users } from "@chefos/db";
import { recipes } from "../src/data/recipes";

const root = fileURLToPath(new URL("../", import.meta.url));
const evidence = path.resolve(root, "../../docs/redesign/shots/recipe-numbering");
const baseline = process.env.RECIPE_NUMBERING_BASELINE === "1";
const recipeNumber = /(?:№|N[°º]|\bNo\.?)\s*\d+/iu;
nextEnv.loadEnvConfig(root);
test.use({ reducedMotion: "reduce", trace: "off" });

async function withoutPhotoMarkup() {
  const require = createRequire(import.meta.url);
  const { createLoader } = require("../scripts/load-typescript.cjs");
  const recipe = { ...recipes[0], slug: "manual-without-photo", title: "Рецепта без снимка", category: "Основни", imageSrc: undefined };
  const load = createLoader({
    "server-only": {},
    "../../../server/recipes/web-details": { getWebRecipeForDetails: async () => recipe },
    "../../../server/favorites/service": { isCurrentUserFavoriteRecipe: async () => false },
    "next/link": { __esModule: true, default: ({ children, ...props }: { children: React.ReactNode }) => React.createElement("a", props, children) },
    "next/image": { __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => React.createElement("img", { src, alt }) },
    "./recipe-favorite": { RecipeFavorite: () => null },
    "../../print-recipe-button": { PrintRecipeButton: () => null },
    "./back-to-catalog": { BackToCatalog: () => null }
  });
  const { default: Detail } = load(path.join(root, "src/app/catalog/[slug]/page.tsx"));
  return renderToStaticMarkup(await Detail({ params: Promise.resolve({ slug: recipe.slug }) }));
}

test("recipe categories and accessible names have no recipe numbers; hero geometry stays stable", async ({ page }) => {
  await mkdir(evidence, { recursive: true });
  const geometry = [];
  const before = baseline ? [] : JSON.parse(await readFile(path.join(evidence, "before.json"), "utf8"));
  const readme = await readFile(path.resolve(root, "../../README.md"), "utf8");
  const row = readme.split("\n").find(line => /^\|\s*Admin\s*\|/.test(line))!;
  const [email, password] = [...row.matchAll(/`([^`]+)`/g)].map(match => match[1]);
  const existing = await getDb().select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  expect(existing.length, "Existing demo account required before favorite read paths").toBe(1);
  await page.goto("/login?next=%2Ffavorites");
  await page.getByLabel("Имейл", { exact: true }).fill(email);
  await page.getByLabel("Парола", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Влез", exact: true }).click();
  await page.waitForURL("**/favorites");

  const targets = [
    { name: "mekitsi", route: "/catalog/mekitsi", category: "Тестени", photo: true },
    { name: "without-photo", route: "/niama-takava-stranica", category: "Основни", photo: false, fixture: true },
    { name: "tutmanik", route: "/catalog/tutmanik", category: "Тестени", photo: true },
    { name: "catalog", route: "/catalog" },
    { name: "favorites", route: "/favorites" }
  ];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    for (const target of targets) {
      const response = await page.goto(target.route, { waitUntil: "networkidle" });
      expect(response!.status(), target.name).toBe(target.fixture ? 404 : 200);
      if (target.fixture) {
        const markup = await withoutPhotoMarkup();
        await page.locator("main").evaluate((node, html) => { node.innerHTML = html; }, markup);
      }
      await page.evaluate(() => document.fonts.ready);
      if (target.photo !== undefined) {
        await expect(page.locator(".r-hero")).toHaveAttribute("data-photo", target.photo ? "yes" : "none");
        const label = page.locator(".r-hero .eyebrow");
        const category = (await label.locator("a").innerText()).trim();
        if (target.category) expect(category).toBe(target.category.toLocaleUpperCase("bg-BG"));
        if (!baseline) {
          expect((await label.innerText()).trim()).toBe(category);
          await expect(label.locator("a")).toHaveCSS("background-size", "100% 1px");
          await expect(label.locator("a")).toHaveCSS("background-image", /linear-gradient/);
        }
        const boxes = await page.locator(".r-hero, .r-hero .eyebrow, .r-hero h1, .r-hero .r-desc").evaluateAll(nodes => nodes.map(node => {
          const box = node.getBoundingClientRect();
          return { top: box.top, height: box.height };
        }));
        geometry.push({ name: target.name, width, boxes });
        if (!baseline) {
          const previous = before.find((row: { name: string; width: number }) => row.name === target.name && row.width === width);
          expect(previous).toBeTruthy();
          boxes.forEach((box, index) => {
            expect(Math.abs(box.top - previous.boxes[index].top)).toBeLessThanOrEqual(0.5);
            expect(Math.abs(box.height - previous.boxes[index].height)).toBeLessThanOrEqual(0.5);
          });
        }
      }
      if (!baseline) {
        const exposed = await page.evaluate(() => [
          document.body.innerText,
          ...Array.from(document.querySelectorAll("[aria-label], [alt], [title]"), node => [node.getAttribute("aria-label"), node.getAttribute("alt"), node.getAttribute("title")].join(" ")),
          ...Array.from(document.querySelectorAll("title, meta[content], script[type='application/ld+json']"), node => node.getAttribute("content") ?? node.textContent ?? "")
        ]);
        for (const text of exposed) expect(text, target.name).not.toMatch(recipeNumber);
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
            scrollTo(0, y);
            await new Promise(resolve => setTimeout(resolve, 70));
          }
          scrollTo(0, 0);
        });
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(evidence, `${target.name}-${width}.jpg`), type: "jpeg", quality: 80, fullPage: true });
      }
    }
  }
  await writeFile(path.join(evidence, baseline ? "before.json" : "after.json"), JSON.stringify(geometry, null, 2) + "\n");
});
