import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const { createLoader } = require("../scripts/load-typescript.cjs");
const root = fileURLToPath(new URL("../", import.meta.url));

type Who = { name: string; email: string; role: "user" | "admin" } | undefined;
const PEOPLE: Array<[string, Who]> = [
  ["guest", undefined],
  ["user", { name: "Мария Петрова", email: "maria@example.com", role: "user" }],
  ["admin", { name: "Admin", email: "admin@example.com", role: "admin" }]
];
const NAV: Record<string, string[]> = {
  guest: ["Начало", "Рецепти", "За нас", "Вход"],
  user: ["Начало", "Рецепти", "За нас", "Любими 3", "Профил", "Здравей, Мария", "Изход"],
  admin: ["Начало", "Рецепти", "За нас", "Любими 3", "Профил", "Админ", "Здравей, Admin", "Изход"]
};
const PROFILE_COLUMN: Record<string, string[]> = {
  guest: ["Вход", "Регистрация"],
  user: ["Моят профил", "Изход"],
  admin: ["Моят профил", "Админ панел", "Изход"]
};

/** The real header and footer components with mocked session modules (no cookies, no database). */
const load = createLoader({
  "server-only": {},
  "next/link": { __esModule: true, default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => React.createElement("a", { href, ...props }, children) },
  "next/navigation": { usePathname: () => "/catalog" },
  "../server/auth/actions": { logoutAction: async () => undefined },
  "./session-user": { getSessionUser: async () => undefined }
});

for (const [who, user] of PEOPLE) {
  test(`header (${who}): the menu order on desktop and in the mobile menu, the active page and the count stay`, async ({ page }) => {
    const { SiteHeaderClient } = load(path.join(root, "src/app/site-header-client.tsx"));
    await page.setContent(renderToStaticMarkup(React.createElement(SiteHeaderClient, { currentUser: user, favoriteCount: 3, logoutAction: async () => undefined })));
    for (const nav of [".desktop-nav", ".mobile-nav"]) {
      const items = await page.locator(`${nav} > a, ${nav} > span, ${nav} > form button`).allTextContents();
      expect(items.map(text => text.replace(/\s+/g, " ").trim()), nav).toEqual(NAV[who]);
    }
    await expect(page.locator('.desktop-nav a[aria-current="page"]')).toHaveText("Рецепти");
    await expect(page.locator(".desktop-nav [data-testid=favorite-count]")).toHaveCount(user ? 1 : 0);
  });

  test(`footer (${who}): brand, "Разглеждай", "Профил" for this visitor, © line with the current year; no social links`, async ({ page }) => {
    const { SiteFooterView } = load(path.join(root, "src/app/site-footer.tsx"));
    await page.setContent(renderToStaticMarkup(React.createElement(SiteFooterView, { user, logout: async () => undefined, year: 2031 })));
    await expect(page.locator(".ftr h2")).toHaveText(["Разглеждай", "Профил"]);
    await expect(page.locator("#footer-browse + ul li")).toHaveText(["Рецепти", "Любими", "За нас"]);
    await expect(page.locator("#footer-profile + ul li")).toHaveText(PROFILE_COLUMN[who]);
    await expect(page.locator(".ftr-base")).toHaveText("© 2031 Chefo's Recipes. Всички права запазени.");
    // No icon links: only the logo carries a label, and the only drawing is the stitched band.
    await expect(page.locator(".ftr a[aria-label]")).toHaveCount(1);
    await expect(page.locator(".ftr svg:not(.stitch-band)")).toHaveCount(0);
  });
}

for (const width of [1440, 390]) {
  test(`footer on the site at ${width}: no empty column on the right, columns stacked on a phone, this year`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/about");
    const footer = page.locator("footer.ftr");
    await expect(footer.locator(".ftr-base")).toContainText(`© ${new Date().getFullYear()} Chefo's Recipes. Всички права запазени.`);
    await expect(footer.locator("a[aria-label]")).toHaveCount(1); // only the logo link carries a label
    await expect(footer.locator("svg:not(.stitch-band)")).toHaveCount(0); // no icon links
    const boxes = await footer.evaluate(node => {
      const wrap = node.querySelector(".ftr-grid")!.getBoundingClientRect();
      const columns = [...node.querySelectorAll(".ftr-grid > *")].map(col => {
        const box = col.getBoundingClientRect();
        const content = [...col.querySelectorAll("a,button,h2,p")].map(el => el.getBoundingClientRect());
        return { left: box.left, top: box.top, contentRight: Math.max(...content.map(r => r.right)) };
      });
      return { right: wrap.right, left: wrap.left, columns };
    });
    if (width === 1440) {
      // The last column ends within 60px of the right edge (its widest link), nothing empty after it.
      expect(boxes.right - boxes.columns[2].contentRight).toBeLessThan(60);
      expect(new Set(boxes.columns.map(c => Math.round(c.top))).size).toBe(1);
    } else {
      expect(boxes.columns.every(c => Math.round(c.left) === Math.round(boxes.columns[0].left))).toBe(true);
      expect(boxes.columns[1].top).toBeGreaterThan(boxes.columns[0].top);
      expect(boxes.columns[2].top).toBeGreaterThan(boxes.columns[1].top);
    }
  });
}
