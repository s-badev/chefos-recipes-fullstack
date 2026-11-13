import { expect, test, type Page } from "@playwright/test";

type Stop = { id: string; label: string; visible: boolean; inDialog: boolean };

/** Where the focus is: a stable id for the element, its label, whether it can be seen, whether it is in the open menu. */
async function stop(page: Page): Promise<Stop | null> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const w = window as unknown as { __ids?: WeakMap<Element, number>; __next?: number };
    w.__ids ??= new WeakMap(); w.__next ??= 0;
    if (!w.__ids.has(el)) w.__ids.set(el, ++w.__next);
    const r = el.getBoundingClientRect();
    return {
      id: `${el.tagName}#${w.__ids.get(el)}`,
      label: (el.getAttribute("aria-label") || el.textContent || (el as HTMLInputElement).name || "").trim().replace(/\s+/g, " ").slice(0, 30),
      visible: r.width > 1 && r.height > 1,
      inDialog: !!el.closest("dialog[open]")
    };
  });
}

for (const width of [1440, 390]) {
  test(`login at ${width}: Tab runs through every control in order, into the footer and out of the page; Shift+Tab comes back`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto("/login", { waitUntil: "networkidle" });
    const forward: Stop[] = [];
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const s = await stop(page);
      if (!s) break; // focus left the page (to the browser) - the end of the document was reached
      forward.push(s);
    }
    expect(forward.length, "focus leaves the page after the footer").toBeLessThan(40);
    // Never the same element twice in a row, never an invisible stop, never inside a closed menu.
    for (let i = 1; i < forward.length; i++) expect(forward[i].id, `stop ${i} repeats ${forward[i].label}`).not.toBe(forward[i - 1].id);
    expect(forward.filter(s => !s.visible).map(s => s.label)).toEqual([]);
    expect(forward.some(s => s.inDialog)).toBe(false);
    // The form in order: e-mail, password, the button, then the link to register.
    const labels = forward.map(s => s.label);
    const at = (label: string) => labels.findIndex(l => l.startsWith(label));
    expect(at("email")).toBeGreaterThan(-1);
    expect(at("password")).toBe(at("email") + 1);
    expect(at("Влез")).toBe(at("password") + 1);
    expect(labels.lastIndexOf("Регистрация")).toBeGreaterThan(at("Влез"));
    // The footer is reached (its links come after the form).
    expect(labels.slice(at("Влез")).includes("Рецепти")).toBe(true);
    // Back from the button: password, e-mail.
    await page.locator(".auth-box button[type=submit]").focus();
    await page.keyboard.press("Shift+Tab");
    expect((await stop(page))!.label).toBe("password");
    await page.keyboard.press("Shift+Tab");
    expect((await stop(page))!.label).toBe("email");
  });
}

test("phone menu (native <dialog>): focus stays inside while it is open, Esc closes it and gives focus back to «Меню»", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login", { waitUntil: "networkidle" });
  const toggle = page.getByRole("button", { name: "Меню" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("dialog.mobile-menu")).toHaveAttribute("open", "");
  await page.waitForTimeout(600);
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press(i % 3 === 2 ? "Shift+Tab" : "Tab");
    const s = await stop(page);
    expect(s, `press ${i}: focus is somewhere`).not.toBeNull();
    expect(s!.inDialog, `press ${i}: ${s!.label} is inside the open menu`).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog.mobile-menu")).not.toHaveAttribute("open", "");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  // Closed again: the next Tab goes on in the page, not into the menu.
  await page.keyboard.press("Tab");
  expect((await stop(page))!.inDialog).toBe(false);
});
