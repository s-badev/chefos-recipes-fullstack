import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

// Authentication data stays in memory and is never printed or saved in traces.
test.use({ trace: "off" });

async function demoAdmin() {
  const readme = await readFile(new URL("../../../README.md", import.meta.url), "utf8");
  const line = readme.split("\n").find((row) => /^\|\s*Admin\s*\|/.test(row));
  if (!line) throw new Error("Documented demo admin account is unavailable");
  const fields = [...line.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  if (fields.length < 2) throw new Error("Documented demo admin account format is unavailable");
  return { email: fields[0], password: fields[1] };
}

async function login(page: Page, next: string) {
  const admin = await demoAdmin();
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Имейл", { exact: true }).fill(admin.email);
  await page.getByLabel("Парола", { exact: true }).fill(admin.password);
  await page.getByRole("button", { name: "Влез", exact: true }).click();
  await page.waitForURL((url) => url.pathname === next);
}

test("admin form: Tab follows the visual field order without submitting", async ({ page }) => {
  await login(page, "/admin/recipes/new");
  const form = page.locator(".admin-form");
  const stops = [
    form.locator('[name="title"]'),
    form.locator('[name="category"]'),
    form.locator('[name="description"]'),
    form.locator('[name="prepTime"]'),
    form.locator('[name="cookTime"]'),
    form.locator('[name="servings"]'),
    form.getByRole("button", { name: "Запази рецепта", exact: true }),
    form.getByRole("link", { name: "Отказ", exact: true })
  ];

  await stops[0].focus();
  await expect(stops[0]).toBeFocused();
  for (const stop of stops.slice(1)) {
    await page.keyboard.press("Tab");
    await expect(stop).toBeFocused();
  }
  await expect(page).toHaveURL(/\/admin\/recipes\/new$/);
});

test("admin delete dialog: focus stays inside; Esc closes and returns focus without confirming", async ({ page }) => {
  await login(page, "/admin");
  const trigger = page.locator(".admin-row").first().getByRole("button", { name: "Изтрий", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const dialog = page.locator("dialog.admin-dialog").filter({ has: page.getByRole("heading", { name: "Да изтрием ли рецептата?" }) });
  await expect(dialog).toHaveAttribute("open", "");
  await expect(dialog.getByRole("button", { name: "Отказ", exact: true })).toBeFocused();

  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press(index % 3 === 2 ? "Shift+Tab" : "Tab");
    await expect.poll(() => page.evaluate(() => Boolean(document.activeElement?.closest("dialog[open]")))).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(page.locator("dialog.admin-dialog[open]")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page).toHaveURL(/\/admin$/);
});
