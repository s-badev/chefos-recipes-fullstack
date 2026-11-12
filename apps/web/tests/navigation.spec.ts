import { expect, test } from "@playwright/test";
import { watchProblems } from "./helpers";

const menu = ["Начало", "Рецепти", "За нас", "Вход"] as const;
const headings: Record<(typeof menu)[number], RegExp> = {
  "Начало": /Българска/,
  "Рецепти": /рецепти/i,
  "За нас": /каталог за домашна храна/i,
  "Вход": /.+/
};

test("30 menu navigations plus back/forward without console errors or ChunkLoadError", async ({ page }) => {
  const problems = watchProblems(page);
  await page.goto("/login", { waitUntil: "networkidle" });

  let navigations = 0;
  for (let i = 0; navigations < 30; i++) {
    const name = menu[i % menu.length];
    const current = new URL(page.url()).pathname;
    const link = page.locator("header").getByRole("link", { name, exact: true }).first();
    const target = await link.getAttribute("href");
    if (target === current) continue;
    await link.click();
    await page.waitForURL((url) => url.pathname === target);
    await expect(page.locator("h1").first()).toHaveText(headings[name]);
    navigations++;

    if (navigations % 6 === 0) {
      await page.goBack();
      await page.waitForURL((url) => url.pathname === current);
      await page.goForward();
      await page.waitForURL((url) => url.pathname === target);
      await expect(page.locator("h1").first()).toBeVisible();
    }
  }

  expect(navigations).toBe(30);
  expect(problems.pageErrors.filter((e) => /ChunkLoadError|Loading chunk/i.test(e))).toEqual([]);
  expect(problems.pageErrors).toEqual([]);
  expect(problems.console).toEqual([]);
  expect(problems.badAssets).toEqual([]);
});
