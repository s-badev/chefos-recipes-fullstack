import { expect, test } from "@playwright/test";

for (const [route, other, tab, title, heading, button] of [
  ["/login", "/register", "Вход", "Добре дошъл отново", "Влез в профила си", "Влез"],
  ["/register", "/login", "Регистрация", "Седни на масата", "Създай профил", "Създай профил"]
] as const) {
  test(`${route}: shared Sofra layout, tabs carry the safe next, autocomplete`, async ({ page }) => {
    await page.goto(`${route}?next=%2Fcatalog%2Fbob-chorba`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
    await expect(page.locator(".auth-ph img")).toHaveCount(1);
    await expect(page.locator(".auth-cap .stitch-band")).toHaveCount(1);
    await expect(page.locator(".perks li")).toHaveCount(3);
    const tabs = page.getByRole("navigation", { name: "Вход или регистрация" });
    await expect(tabs.getByRole("link", { name: tab, exact: true })).toHaveAttribute("aria-current", "page");
    await expect(tabs.getByRole("link", { name: route === "/login" ? "Регистрация" : "Вход", exact: true })).toHaveAttribute("href", `${other}?next=%2Fcatalog%2Fbob-chorba`);
    await expect(page.locator('input[name="next"]')).toHaveValue("/catalog/bob-chorba");
    await expect(page.getByLabel("Имейл", { exact: true })).toHaveAttribute("autocomplete", "email");
    await expect(page.getByLabel("Парола", { exact: true })).toHaveAttribute("autocomplete", route === "/login" ? "current-password" : "new-password");
    await expect(page.getByRole("button", { name: button, exact: true })).toHaveClass(/\bfill\b/);
  });
}

test("/login rejects an unsafe next: the tabs and the form carry nothing", async ({ page }) => {
  await page.goto("/login?next=%2F%2Fevil.example");
  await expect(page.locator('input[name="next"]')).toHaveValue("/");
  await expect(page.getByRole("navigation", { name: "Вход или регистрация" }).getByRole("link", { name: "Регистрация", exact: true })).toHaveAttribute("href", "/register?next=%2F");
});

test("empty fields: Bulgarian messages under each field in red, tied with aria-describedby, focus on the first", async ({ page }) => {
  await page.goto("/register", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Създай профил", exact: true }).click();
  for (const label of ["Име", "Имейл", "Парола"]) {
    const field = page.getByLabel(label, { exact: true });
    await expect(field).toHaveAttribute("aria-invalid", "true");
    const describedBy = (await field.getAttribute("aria-describedby"))!;
    const message = page.locator(`[id="${describedBy}"]`);
    await expect(message).toHaveText("Попълни това поле.");
    await expect(message).toHaveCSS("color", "rgb(229, 72, 77)");
  }
  await expect(page.getByLabel("Име", { exact: true })).toBeFocused();
  await page.getByLabel("Имейл", { exact: true }).fill("not-an-email");
  await expect(page.getByLabel("Имейл", { exact: true })).not.toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Създай профил", exact: true }).click();
  await expect(page.locator(`[id="${await page.getByLabel("Имейл", { exact: true }).getAttribute("aria-describedby")}"]`)).toHaveText("Въведи валиден имейл адрес.");
  await expect(page).toHaveURL(/\/register$/);
});

test("a focused field shows the red 2px line", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });
  const email = page.getByLabel("Имейл", { exact: true });
  await email.focus();
  await expect(email).toHaveCSS("border-bottom-width", "2px");
  await expect(email).toHaveCSS("border-bottom-color", "rgb(229, 72, 77)");
});
