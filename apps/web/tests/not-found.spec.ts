import { expect, test } from "@playwright/test";

const generatedMarker = "детерминиран набор за тест на каталог";

test("unknown recipe slug returns the styled Bulgarian 404", async ({ page }) => {
  const response = await page.goto("/catalog/tazi-recepta-ne-sashtestvuva");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Тази страница не е намерена");
  await expect(page.getByRole("link", { name: "Към каталога" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("This page could not be found");
});

test("unknown top-level path returns the styled Bulgarian 404", async ({ page }) => {
  const response = await page.goto("/niama-takava-stranica");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Тази страница не е намерена");
});

test("hidden generated scalability record is not publicly reachable", async ({ page, request }) => {
  let generatedSlug: string | undefined;
  for (let pageNumber = 1; pageNumber <= 5 && !generatedSlug; pageNumber++) {
    const list = await request.get(`/api/recipes?page=${pageNumber}&pageSize=50`);
    expect(list.ok()).toBeTruthy();
    const body = (await list.json()) as { items: Array<{ slug: string; description: string }> };
    generatedSlug = body.items.find((item) => item.description.includes(generatedMarker))?.slug;
  }
  test.skip(!generatedSlug, "No generated record in the connected database");

  const response = await page.goto(`/catalog/${generatedSlug}`);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Тази страница не е намерена");
});
