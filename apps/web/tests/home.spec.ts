import { expect, test } from "@playwright/test";
import { recipes } from "../src/data/recipes";
import { watchProblems } from "./helpers";

const categoryCount = new Set(recipes.map((recipe) => recipe.category)).size;

test("quote is revealed after client navigation from /login to the home page", async ({ page }) => {
  const problems = watchProblems(page);
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.locator("header").getByRole("link", { name: "Домашна кухня Chefo's Recipes – начало" }).click();
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

test("cover: no big numeral; title, description, meta line and button beside the photo", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".cover-n")).toHaveCount(0);
  const text = page.locator(".cover-text");
  await expect(text.locator(".eyebrow")).toHaveText("Рецепта на седмицата");
  await expect(text.locator(".cover-d")).not.toBeEmpty();
  await expect(text.locator(".cover-m")).toHaveText(/^.+ · (\d+ мин|Без готвене) · \d+ порци[яи]$/);
  await text.scrollIntoViewIfNeeded();
  const [textBox, photoBox] = await Promise.all([text.boundingBox(), page.locator(".cover-photo").boundingBox()]);
  expect(textBox!.x + textBox!.width).toBeLessThanOrEqual(photoBox!.x);
  expect(Math.abs(textBox!.y + textBox!.height - (photoBox!.y + photoBox!.height))).toBeLessThanOrEqual(2);
});

for (const width of [390, 768]) {
  test(`cover at ${width}px: full-width photo, text block directly under it`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    const photo = page.locator(".cover-photo");
    await photo.scrollIntoViewIfNeeded();
    const [photoBox, textBox] = await Promise.all([photo.boundingBox(), page.locator(".cover-text").boundingBox()]);
    // Full width of the content column (the page gutters follow clamp(16px, 4vw, 56px)).
    const content = await page.locator(".cover .wrap").first().evaluate(node => { const style = getComputedStyle(node); return node.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight); });
    expect(photoBox!.width).toBeGreaterThanOrEqual(content - 2);
    expect(photoBox!.height).toBeGreaterThan(200);
    const gap = textBox!.y - (photoBox!.y + photoBox!.height);
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThanOrEqual(40);
  });
}

test("index: no counter, heading and button in the side column; hover shifts the title and the preview never covers the row", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#index-counter, .rn-box")).toHaveCount(0);
  await expect(page.locator("#index-title")).toHaveText("Какво да сготвиш днес");
  await expect(page.locator(".idx-side").getByRole("link", { name: "Всички рецепти →" })).toBeVisible();

  const rows = page.locator("#recipe-index .row");
  for (const index of [0, 3, 7]) {
    const row = rows.nth(index);
    await row.scrollIntoViewIfNeeded();
    const box = (await row.locator(".row-t").boundingBox())!;
    await page.mouse.move(box.x + 40, box.y + box.height / 2);
    await page.waitForTimeout(900);
    const shift = await row.locator(".row-t").evaluate((node) => new DOMMatrix(getComputedStyle(node).transform).m41);
    expect(shift).toBeGreaterThan(10);
    await expect(page.locator("#recipe-preview")).toHaveClass(/\bon\b/);
    const preview = (await page.locator("#recipe-preview").boundingBox())!;
    const title = (await row.locator(".row-t").boundingBox())!;
    const overlaps = preview.x < title.x + title.width && preview.x + preview.width > title.x && preview.y < title.y + title.height && preview.y + preview.height > title.y;
    expect(overlaps).toBe(false);
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
