import { expect, test, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import { foundRecipesLabel, recipeCountLabel } from "../src/lib/format";
import { previewTarget, safePreviewStep } from "../src/lib/preview";

const mockURL = new URL("../../../docs/redesign/motion-mock.html", import.meta.url).href;
const output = fileURLToPath(new URL("../../../docs/redesign/shots/stabilization-a/", import.meta.url));
const saveShots = process.env.STABILIZATION_SHOTS === "1";

async function shot(page: Page, name: string, fullPage = false) {
  if (!saveShots) return;
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: path.join(output, name + ".png"), fullPage });
}

async function ready(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
}

async function reveal(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .55) {
      scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(1800);
}

async function checkMenu(page: Page, mock: boolean) {
  const toggle = page.getByRole("button", { name: "Отвори менюто" });
  const menu = page.locator(mock ? "#mock-menu" : "#mobile-menu");
  await toggle.click();
  await expect(menu).toBeVisible();
  await shot(page, `${mock ? "mock" : "app"}-menu-${page.viewportSize()!.width}`);
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(await menu.evaluate(node => node.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  expect(await menu.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await menu.getByRole("link", { name: "За нас", exact: true }).click();
  await expect(menu).not.toBeVisible();
  if (mock) await expect(page.locator('[data-view="about"]')).toBeVisible();
  else await page.waitForURL("**/about");
}

test("approved Bulgarian singular labels and safe preview geometry", () => {
  expect(foundRecipesLabel(1)).toBe("1 намерена рецепта");
  expect(foundRecipesLabel(2)).toBe("2 намерени рецепти");
  expect(foundRecipesLabel(0)).toBe("0 намерени рецепти");
  expect(recipeCountLabel(1, true)).toBe("01 рецепта");
  expect(recipeCountLabel(2, true)).toBe("02 рецепти");
  const row = { top: 380, bottom: 450 };
  const target = previewTarget(row, 1400, 1440, 900)!;
  expect(target.y + 225).toBeLessThan(row.top - 16);
  // A smooth step through the active row is snapped onto its safe side.
  expect(safePreviewStep({ x: 1400, y: 400 }, target, row, 1440, 900).y).toBe(target.y);
  expect(previewTarget({ top: 0, bottom: 900 }, 500, 1440, 900)).toBeNull();
  expect(previewTarget(row, 100, 200, 300)).toBeNull();
});

test("owner copy in the app: hero, singular catalog, About and metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Прелисти" })).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "Подбрани български домашни рецепти с продукти, стъпки, време за приготвяне и порции – за всеки ден.");
  await page.goto("/catalog");
  await page.getByRole("searchbox").fill("Таратор");
  await expect(page.getByText("1 намерена рецепта", { exact: true })).toBeVisible();
  await page.goto("/about");
  await expect(page.getByText("Виждаш времето за подготовка и готвене, порциите и трудността още преди да отвориш рецептата.", { exact: true })).toBeVisible();
  await expect(page.getByText(/а не да е просто число на екрана/)).toBeVisible();
  for (const [route, description] of [["/login", "Влез в профила си в Chefo's Recipes и се върни към любимите си рецепти."], ["/register", "Създай профил в Chefo's Recipes и пази любимите си рецепти на едно място."]]) {
    await page.goto(route);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", description);
  }
  await expect(page.getByText("Връщай се към рецептите, без да ги търсиш отначало.", { exact: true })).toBeVisible();
});

for (const width of [390, 768, 1440]) {
  for (const view of ["home", "about"] as const) {
    test(`mock and app comparison: ${view} at ${width}px`, async ({ page, context }) => {
      await page.setViewportSize({ width, height: 900 });
      const mock = await context.newPage();
      await mock.setViewportSize({ width, height: 900 });
      await page.goto(view === "home" ? "/" : "/about", { waitUntil: "networkidle" });
      await mock.goto(mockURL + "#" + view, { waitUntil: "networkidle" });
      await Promise.all([ready(page), ready(mock)]);
      if (view === "home") {
        for (const [surface, selector] of [[page, "#recipe-index .row-n"], [mock, "#idx .row-n"]] as const) {
          const labels = await surface.locator(selector).evaluateAll(nodes => nodes.map(node => ({
            text: node.textContent, nowrap: getComputedStyle(node).whiteSpace,
            height: node.getBoundingClientRect().height, line: parseFloat(getComputedStyle(node).lineHeight)
          })));
          expect(labels).toHaveLength(8);
          for (const label of labels) { expect(label.nowrap).toBe("nowrap"); expect(label.height).toBeLessThanOrEqual(label.line + 1); }
        }
      }
      for (const surface of [page, mock]) expect(await surface.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
      await Promise.all([reveal(page), reveal(mock)]);
      if (saveShots) {
        await mkdir(output, { recursive: true });
        const appImage = await page.screenshot({ fullPage: true, animations: "disabled" });
        const mockImage = await mock.screenshot({ fullPage: true, animations: "disabled" });
        await writeFile(path.join(output, `${view}-${width}-app.png`), appImage);
        await writeFile(path.join(output, `${view}-${width}-mock.png`), mockImage);
        const [appSize, mockSize] = await Promise.all([sharp(appImage).metadata(), sharp(mockImage).metadata()]);
        await sharp({ create: { width: width * 2, height: Math.max(appSize.height!, mockSize.height!), channels: 3, background: "#E9E9E6" } })
          .composite([{ input: mockImage, left: 0, top: 0 }, { input: appImage, left: width, top: 0 }])
          .png({ compressionLevel: 9 }).toFile(path.join(output, `${view}-${width}-side-by-side.png`));
      }
      if (view === "home" && width < 1100) {
        await checkMenu(page, false); await checkMenu(mock, true);
      }
      if (view === "home" && width !== 768) {
        await page.goto("/", { waitUntil: "networkidle" });
        for (const y of [900, 2400]) {
          await page.evaluate(y => scrollTo(0, y), y);
          await expect(page.locator("header")).toHaveClass(/solid/);
          const boxes = await page.locator("header").evaluate(node => {
            const header = node.getBoundingClientRect(), kicker = node.querySelector(".logo-kicker")!.getBoundingClientRect();
            return { top: header.top, bottom: header.bottom, kickerTop: kicker.top, kickerBottom: kicker.bottom, position: getComputedStyle(node).position };
          });
          expect(boxes.position).toBe("fixed"); expect(boxes.top).toBe(0);
          expect(boxes.kickerTop).toBeGreaterThanOrEqual(boxes.top); expect(boxes.kickerBottom).toBeLessThanOrEqual(boxes.bottom);
          await page.waitForTimeout(1500);
          await shot(page, `header-${width}-scroll-${y}`);
        }
      }
      await mock.close();
    });
  }
}

for (const mock of [false, true]) {
  test(`${mock ? "mock" : "app"} preview: fixed 4:3 mask, bounded tilt and no row overlap`, async ({ page }) => {
    await page.goto(mock ? mockURL + "#home" : "/", { waitUntil: "networkidle" });
    await ready(page);
    const rows = page.locator(mock ? "#idx .row" : "#recipe-index .row");
    const preview = page.locator(mock ? "#prev" : "#recipe-preview");
    const measurements = [];
    for (const index of [0, 3, 7]) {
      const row = rows.nth(index);
      await row.evaluate(node => node.scrollIntoView({ block: "center" }));
      if (index === 0) await page.waitForTimeout(1500);
      const box = (await row.boundingBox())!;
      await page.mouse.move(box.x + 40, box.y + box.height / 2);
      await expect(preview).toHaveClass(/\bon\b/);
      if (index === 0) {
        await preview.evaluate(node => node.getAnimations().forEach(animation => { animation.pause(); animation.currentTime = 80; }));
        const mask = await preview.evaluate(node => ({ clip: getComputedStyle(node).clipPath, w: node.clientWidth, h: node.clientHeight }));
        const inset = Number.parseFloat(mask.clip.match(/inset\(([\d.]+)/)![1]);
        expect(inset).toBeGreaterThan(0); expect(inset).toBeLessThan(100);
        expect(mask.w).toBe(300); expect(mask.h).toBe(225);
        await preview.locator("img:not([hidden])").first().evaluate((image: HTMLImageElement) => image.decode());
        await shot(page, `${mock ? "mock" : "app"}-preview-mid-reveal`);
        await preview.evaluate(node => node.getAnimations().forEach(animation => animation.finish()));
      }
      await page.mouse.move(box.x + box.width - 4, box.y + box.height / 2);
      const samples = await page.evaluate(async ({ previewSelector, rowSelector, index }) => {
        const image = document.querySelector(previewSelector)!;
        const row = document.querySelectorAll(rowSelector)[index];
        const samples = [];
        for (let i = 0; i < 20; i++) {
          await new Promise(requestAnimationFrame);
          const a = image.getBoundingClientRect(), b = row.getBoundingClientRect(), matrix = new DOMMatrix(getComputedStyle(image).transform);
          samples.push({ tilt: Math.atan2(matrix.b, matrix.a) * 180 / Math.PI, inside: a.left >= 0 && a.top >= 0 && a.right <= document.documentElement.clientWidth && a.bottom <= document.documentElement.clientHeight, overlaps: a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top });
        }
        return samples;
      }, { previewSelector: mock ? "#prev" : "#recipe-preview", rowSelector: mock ? "#idx .row" : "#recipe-index .row", index });
      for (const sample of samples) { expect(Math.abs(sample.tilt)).toBeLessThanOrEqual(4.01); expect(sample.inside).toBe(true); expect(sample.overlaps).toBe(false); }
      measurements.push({ index, samples });
      await page.waitForTimeout(550);
      await expect(preview).toHaveCSS("clip-path", "inset(0px)");
      await shot(page, `${mock ? "mock" : "app"}-preview-row-${index + 1}`);
    }
    if (saveShots) { await mkdir(output, { recursive: true }); await writeFile(path.join(output, `${mock ? "mock" : "app"}-preview-measurements.json`), JSON.stringify(measurements, null, 2)); }
  });
}

test("preview is off for reduced motion and non-hover devices", async ({ browser }) => {
  for (const reduced of [false, true]) {
    const context = await browser.newContext({ reducedMotion: reduced ? "reduce" : "no-preference", hasTouch: !reduced, isMobile: !reduced, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    for (const mock of [false, true]) {
      await page.goto(mock ? mockURL + "#home" : "http://localhost:3000/", { waitUntil: "networkidle" });
      const row = page.locator(mock ? "#idx .row" : "#recipe-index .row").first();
      await row.scrollIntoViewIfNeeded(); await row.hover();
      const preview = page.locator(mock ? "#prev" : "#recipe-preview");
      await expect(preview).not.toHaveClass(/\bon\b/);
      await expect(preview).toHaveCSS("transform", "none");
    }
    await context.close();
  }
});
