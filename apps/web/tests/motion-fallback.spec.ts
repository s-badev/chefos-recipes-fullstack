import { expect, test } from "@playwright/test";

const quote = /не се готви по мярка/;

test("content becomes visible when the app JS chunks fail to load", async ({ page }) => {
  // Block every client chunk except webpack's runtime: MotionRoot never starts.
  await page.route(/\/_next\/static\/chunks\/(?!webpack).+\.js/, (route) => route.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3200);

  await expect(page.locator("html")).not.toHaveAttribute("data-motion", /.*/);
  const quoteText = page.locator(".quote-t");
  await quoteText.scrollIntoViewIfNeeded();
  await expect(quoteText).toHaveText(quote);
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("h1, h2, .quote-t, [data-r], .wi")].filter((node) => {
      const style = getComputedStyle(node);
      return style.opacity === "0" || style.visibility === "hidden" || (style.transform !== "none" && node.classList.contains("wi"));
    }).length
  );
  expect(hidden).toBe(0);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("headings and sections are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-motion", /.*/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Българска/);
    await expect(page.locator(".quote-t")).toHaveText(quote);
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("h1, h2, .quote-t, [data-r], .wi")].filter((node) => getComputedStyle(node).opacity === "0").length
    );
    expect(hidden).toBe(0);
  });
});
