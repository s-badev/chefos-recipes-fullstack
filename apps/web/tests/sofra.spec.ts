import { expect, test } from "@playwright/test";

const PAGES = ["/", "/catalog", "/catalog/shopska-salata", "/catalog/bob-chorba", "/login", "/register", "/about"];
const HIDDEN = "h1, h2, q, .rv, .wi, .mask .mk, .card, .st, .ing";

for (const url of PAGES) {
  test(`no horizontal scroll on ${url} at 360–1920`, async ({ page }) => {
    for (const width of [360, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(url, { waitUntil: "networkidle" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${url} at ${width}`).toBe(0);
    }
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  for (const url of ["/", "/catalog", "/catalog/shopska-salata", "/login"]) {
    test(`${url}: nothing hidden, solid header`, async ({ page }) => {
      await page.goto(url);
      const hidden = await page.evaluate(selector => [...document.querySelectorAll<HTMLElement>(selector)].filter(node => {
        const style = getComputedStyle(node);
        return style.opacity === "0" || style.visibility === "hidden" || (node.classList.contains("wi") && style.transform !== "none") || (style.clipPath !== "none" && style.clipPath !== "");
      }).length, HIDDEN);
      expect(hidden).toBe(0);
      expect(await page.locator("header.hdr").evaluate(node => getComputedStyle(node).backgroundColor)).toBe("rgba(23, 15, 15, 0.82)");
    });
  }
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  for (const url of ["/catalog", "/login"]) {
    test(`${url}: nothing hidden at rest`, async ({ page }) => {
      await page.goto(url, { waitUntil: "networkidle" });
      await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
      const hidden = await page.evaluate(selector => [...document.querySelectorAll<HTMLElement>(selector)].filter(node => {
        const style = getComputedStyle(node);
        return style.opacity === "0" || (node.classList.contains("wi") && style.transform !== "none");
      }).length, HIDDEN);
      expect(hidden).toBe(0);
    });
  }
});

test("catalog filter: tabs with counts, sticky bar under the header, combined with search, clear", async ({ page }) => {
  await page.goto("/catalog", { waitUntil: "networkidle" });
  // The heading streams in after the layout (Suspense): it must still be revealed, not left hidden.
  await expect.poll(() => page.locator(".cat-head .eyebrow").evaluate(node => getComputedStyle(node).opacity)).toBe("1");
  await expect.poll(() => page.locator(".cat-head h1 .wi").first().evaluate(node => getComputedStyle(node).transform)).toBe("none");
  const supi = page.getByRole("button", { name: "Супи", exact: true });
  await supi.click();
  // After the swap the new cards are visible (the fade-out class is removed again).
  await expect(page.locator(".cards.cat")).not.toHaveClass(/\bswap\b/);
  await expect.poll(() => page.locator(".cards .card").first().evaluate(node => getComputedStyle(node).opacity)).toBe("1");
  await expect(supi).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/category=/);
  await expect.poll(async () => (await page.locator(".cards .card .ce").allTextContents()).every(text => text === "Супи")).toBe(true);
  const count = await page.locator(".cards .card").count();
  await expect(page.locator(".count")).toHaveText(`${count} ${count === 1 ? "рецепта" : "рецепти"}`);
  await page.locator(".search input").fill("боб");
  await expect(page.locator(".cards .card .ct")).toHaveText(["Боб чорба"]);
  await expect(page.locator(".count")).toHaveText("1 рецепта");
  await page.mouse.wheel(0, 1200);
  await expect.poll(() => page.locator(".fbar").evaluate(node => Math.round(node.getBoundingClientRect().top))).toBe(72);
  await page.getByRole("button", { name: "Изчисти", exact: true }).click();
  await expect(page).toHaveURL(/\/catalog$/);
  await expect(page.getByRole("button", { name: "Всички", exact: true })).toHaveAttribute("aria-pressed", "true");
});
