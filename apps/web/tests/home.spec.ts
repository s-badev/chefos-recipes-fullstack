import { expect, test } from "@playwright/test";
import { recipes } from "../src/data/recipes";
import { sofraCategories, todayRecipes } from "../src/lib/sofra";
import { weeklyRecipe } from "../src/lib/weekly";
import { watchProblems } from "./helpers";

const tables = sofraCategories(recipes);

test("hero: curated count, two actions, stitched band; the title is visible at first paint", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const hero = page.locator(".hero");
  await expect(hero.locator(".eyebrow")).toHaveText(`Домашна кухня · ${recipes.length} подбрани рецепти`);
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText("Българска трапеза");
  await expect(hero.getByRole("link", { name: "Към рецептите" })).toHaveAttribute("href", "/catalog");
  await expect(hero.getByRole("link", { name: "Седни на софрата" })).toHaveAttribute("href", "#sofra");
  await expect(hero.locator(".stitch-band")).toHaveCount(1);
  // LCP: the title rises but never starts transparent.
  expect(await hero.locator("h1 .wi").first().evaluate(node => getComputedStyle(node).opacity)).toBe("1");
});

test("sofra: plates from the data; click, arrows and keyboard turn the table and update the chosen category", async ({ page }) => {
  const problems = watchProblems(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const section = page.locator("#sofra");
  await section.scrollIntoViewIfNeeded();
  const plates = section.locator(".plate");
  await expect(plates).toHaveCount(tables.length);
  const list = section.locator(".cat-now");
  await expect(list).toHaveAttribute("aria-live", "polite");

  async function expectChosen(index: number) {
    const table = tables[index];
    await expect(plates.nth(index)).toHaveAttribute("aria-pressed", "true");
    await expect(section.locator(".sofra-center b")).toHaveText(table.name);
    await expect(list.locator(".cat-name")).toHaveText(table.name);
    await expect(list.locator(".mini")).toHaveCount(Math.min(3, table.count));
    await expect(list.locator(".mini").first()).toHaveAttribute("href", `/catalog/${table.recipes[0].slug}`);
    await expect(list.getByRole("link", { name: `Всички: ${table.name.toLocaleLowerCase("bg-BG")}` })).toHaveAttribute("href", `/catalog?category=${encodeURIComponent(table.name)}`);
    expect(await section.locator(".sofra").evaluate(node => getComputedStyle(node).getPropertyValue("--sel").trim())).toBe(String(index));
  }

  await expectChosen(0);
  await plates.nth(2).click();
  await expectChosen(2);
  await section.getByRole("button", { name: "Следваща категория" }).click();
  await expectChosen(3);
  await section.getByRole("button", { name: "Предишна категория" }).click();
  await expectChosen(2);
  await plates.nth(2).focus();
  await page.keyboard.press("ArrowRight");
  await expectChosen(3);
  await expect(plates.nth(3)).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expectChosen(1);
  await expect(plates.nth(1)).toBeFocused();
  // Only the chosen plate is in the tab order (roving focus).
  expect(await plates.evaluateAll(nodes => nodes.filter(node => node.getAttribute("tabindex") === "0").length)).toBe(1);
  expect(problems.pageErrors).toEqual([]);
});

test("recipe of the week and the five cards for today come from the data; the week's recipe is not repeated", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const weekly = weeklyRecipe(recipes).recipe;
  const week = page.locator(".week");
  await expect(week.getByRole("heading", { level: 2 })).toHaveText(weekly.title);
  await expect(week.locator(".week-tx > p").last()).toHaveText(weekly.description);
  await expect(week.locator(".facts dd").nth(1)).toHaveText(weekly.cookTimeMinutes ? `${weekly.cookTimeMinutes} мин` : "Без готвене");
  await expect(week.getByRole("link", { name: "Виж рецептата" })).toHaveAttribute("href", `/catalog/${weekly.slug}`);
  await expect(page.locator(".cover-n, .rn-box")).toHaveCount(0);

  const today = todayRecipes(recipes, weekly.slug);
  const cards = page.locator(".cards .card");
  await expect(cards).toHaveCount(5);
  await expect(cards.first()).toHaveClass(/\bbig\b/);
  expect(await cards.locator(".cb").evaluateAll(nodes => nodes.map(node => node.getAttribute("href")))).toEqual(today.map(recipe => `/catalog/${recipe.slug}`));
  expect(today.some(recipe => recipe.slug === weekly.slug)).toBe(false);
  await expect(cards.first().getByRole("button", { name: `Запази в любими: ${today[0].title}` })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("link", { name: "Всички рецепти" })).toHaveAttribute("href", "/catalog");
});

test("quote is revealed after client navigation from /login to the home page", async ({ page }) => {
  const problems = watchProblems(page);
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.locator("header").getByRole("link", { name: "Домашна кухня Chefo's Recipes – начало" }).click();
  await page.waitForURL((url) => url.pathname === "/");
  const quote = page.locator(".story q");
  for (let i = 0; i < 60 && !(await quote.isVisible() && (await quote.boundingBox())!.y < 600); i++) await page.mouse.wheel(0, 300);
  await page.waitForTimeout(1800);
  const hiddenWords = await quote.evaluate((node) => [...node.querySelectorAll(".wi")].filter((w) => getComputedStyle(w).transform !== "none").length);
  expect(hiddenWords).toBe(0);
  await expect(page.locator(".story cite")).toHaveText("Домашната кухня");
  expect(problems.pageErrors).toEqual([]);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("every heading and section is visible at rest", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("h1, h2, q, .rv, .wi, .mask .mk")].filter((node) => {
        const style = getComputedStyle(node);
        return style.opacity === "0" || (node.classList.contains("wi") && style.transform !== "none") || (style.clipPath !== "none" && style.clipPath !== "");
      }).length
    );
    expect(hidden).toBe(0);
  });
});

test("no horizontal scroll on the home page from 360 to 1920", async ({ page }) => {
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `overflow at ${width}`).toBe(0);
  }
});

test("logo is one link to the home page with a readable name", async ({ page }) => {
  await page.goto("/about");
  const logo = page.locator("header a.logo");
  await expect(logo).toHaveAttribute("href", "/");
  await expect(logo).toHaveAccessibleName("Домашна кухня Chefo's Recipes – начало");
  await expect(logo.locator(".logo-kicker")).toHaveText("Домашна кухня");
  await expect(logo.locator(".logo-name")).toHaveText("Chefo's Recipes");
});
