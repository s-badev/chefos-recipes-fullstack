import { expect, test } from "@playwright/test";
import { recipes } from "../src/data/recipes";
import { watchProblems } from "./helpers";

const categoryCount = new Set(recipes.map((recipe) => recipe.category)).size;

test("quote is revealed after client navigation from /login to the home page", async ({ page }) => {
  const problems = watchProblems(page);
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.locator("header").getByRole("link", { name: "Chefo's Recipes — начало" }).click();
  await page.waitForURL((url) => url.pathname === "/");
  const quote = page.locator(".quote-t");
  for (let i = 0; i < 40 && !(await quote.isVisible() && (await quote.boundingBox())!.y < 600); i++) await page.mouse.wheel(0, 300);
  await page.waitForTimeout(1600);
  const hiddenWords = await quote.evaluate((node) => [...node.querySelectorAll(".wi")].filter((w) => getComputedStyle(w).transform !== "none").length);
  expect(hiddenWords).toBe(0);
  expect(await page.locator(".quote").evaluate((node) => getComputedStyle(node, "::before").clipPath)).not.toContain("100%");
  expect(problems.pageErrors).toEqual([]);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("every heading and section is visible at rest", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("h1, h2, .quote-t, [data-r], .wi, [data-mask] .mk")].filter((node) => {
        const style = getComputedStyle(node);
        return style.opacity === "0" || (node.classList.contains("wi") && style.transform !== "none") || (style.clipPath !== "none" && style.clipPath !== "");
      }).length
    );
    expect(hidden).toBe(0);
  });
});

test("category rail: count from data, arrows switch off at the ends, Home/End keys", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const rail = page.locator("#category-rail");
  const back = page.getByRole("button", { name: "Назад по категориите" });
  const next = page.getByRole("button", { name: "Напред по категориите" });
  await expect(rail.locator("a")).toHaveCount(categoryCount);
  await rail.scrollIntoViewIfNeeded();
  await expect(back).toBeDisabled();
  await expect(next).toBeEnabled();

  await rail.focus();
  await page.keyboard.press("End");
  await expect(next).toBeDisabled();
  await expect(back).toBeEnabled();
  await expect(page.locator("#rail-status")).toContainText(`${String(categoryCount).padStart(2, "0")}`);

  await page.keyboard.press("Home");
  await expect(back).toBeDisabled();
  expect(await rail.evaluate((node) => node.scrollLeft)).toBe(0);

  const firstTile = rail.locator("a").first();
  await expect(firstTile).toHaveAttribute("href", /\/catalog\?category=/);
});

test("logo is one link to the home page with a readable name", async ({ page }) => {
  await page.goto("/about");
  const logo = page.locator("header a.logo");
  await expect(logo).toHaveAttribute("href", "/");
  await expect(logo).toHaveAccessibleName("Chefo's Recipes — начало");
  await expect(logo.locator(".logo-kicker")).toHaveText("Домашна кухня");
  await expect(logo.locator(".logo-name")).toHaveText("Chefo's Recipes");
});
