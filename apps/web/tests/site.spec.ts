import { expect, test, type Page } from "@playwright/test";
import { foundRecipesLabel, recipeCountLabel } from "../src/lib/format";

/** The full-screen menu: focus stays inside, Esc closes it and returns focus, choosing a link closes it. */
async function checkMenu(page: Page) {
  const toggle = page.getByRole("button", { name: "Меню", exact: true });
  const menu = page.locator("#mobile-menu");
  await toggle.click();
  await expect(menu).toBeVisible();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(await menu.evaluate(node => node.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  expect(await menu.evaluate(node => node.contains(document.activeElement))).toBe(true);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await menu.getByRole("link", { name: "За нас", exact: true }).click();
  await expect(menu).not.toBeVisible();
  await page.waitForURL("**/about");
}

test("approved Bulgarian singular and plural labels", () => {
  expect(foundRecipesLabel(1)).toBe("1 намерена рецепта");
  expect(foundRecipesLabel(2)).toBe("2 намерени рецепти");
  expect(foundRecipesLabel(0)).toBe("0 намерени рецепти");
  expect(recipeCountLabel(1)).toBe("1 рецепта");
  expect(recipeCountLabel(24)).toBe("24 рецепти");
  expect(recipeCountLabel(2, true)).toBe("02 рецепти");
});

test("owner copy: meta descriptions and About", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "Подбрани български домашни рецепти с продукти, стъпки, време за приготвяне и порции – за всеки ден.");
  await page.goto("/about");
  await expect(page.getByText("Виждаш времето за подготовка и готвене, порциите и трудността още преди да отвориш рецептата.", { exact: true })).toBeVisible();
  await expect(page.getByText(/а не да е просто число на екрана/)).toBeVisible();
  for (const [route, description] of [["/login", "Влез в профила си в Chefo's Recipes и се върни към любимите си рецепти."], ["/register", "Създай профил в Chefo's Recipes и пази любимите си рецепти на едно място."]]) {
    await page.goto(route);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", description);
  }
});

for (const width of [390, 768]) {
  test(`full-screen menu at ${width}px: focus kept inside, Esc, scroll locked, closes on choice`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    await checkMenu(page);
  });
}

for (const width of [390, 1440]) {
  test(`header at ${width}px: fixed, 72px, solid after the hero with the logo inside it`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    for (const y of [1200, 2600]) {
      await page.evaluate(top => scrollTo(0, top), y);
      await expect(page.locator("header")).toHaveClass(/solid/);
      const boxes = await page.locator("header").evaluate(node => {
        const header = node.getBoundingClientRect(), kicker = node.querySelector(".logo-kicker")!.getBoundingClientRect();
        return { top: header.top, height: node.querySelector(".wrap")!.getBoundingClientRect().height, kickerTop: kicker.top, kickerBottom: kicker.bottom, bottom: header.bottom, position: getComputedStyle(node).position };
      });
      expect(boxes.position).toBe("fixed"); expect(boxes.top).toBe(0); expect(boxes.height).toBe(72);
      expect(boxes.kickerTop).toBeGreaterThanOrEqual(boxes.top); expect(boxes.kickerBottom).toBeLessThanOrEqual(boxes.bottom);
    }
  });
}
