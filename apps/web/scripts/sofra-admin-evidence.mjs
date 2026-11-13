// Sofra admin evidence at 1440 and 390: approved mock and production build side by side.
// No mutation is submitted. The dialog is opened and dismissed only by closing the browser context.
// Empty/error states render the real components with sample services in the production page shell.
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);
const { createLoader } = require("./load-typescript.cjs");
const root = path.resolve(".");
const base = process.argv[2] ?? "http://127.0.0.1:3000";
const output = path.resolve(process.argv[3] ?? "../../docs/redesign/shots/sofra/admin");
const mockUrl = pathToFileURL(path.resolve("../../docs/redesign/sofra-mock-pages.html")).href;
const heights = { 390: 844, 1440: 900 };
const h = React.createElement;
mkdirSync(output, { recursive: true });

function demoAdmin() {
  const readme = readFileSync(path.resolve("../../README.md"), "utf8");
  const line = readme.split("\n").find((row) => /^\|\s*Admin\s*\|/.test(row));
  if (!line) throw new Error("Documented demo admin account is unavailable");
  const fields = [...line.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  if (fields.length < 2) throw new Error("Documented demo admin account format is unavailable");
  return { email: fields[0], password: fields[1] };
}

const admin = demoAdmin();
const pageResult = (items, total = items.length) => ({
  items,
  total,
  page: 1,
  pageSize: 50,
  totalPages: Math.max(1, Math.ceil(total / 50))
});

function load(overrides = {}) {
  return createLoader({
    "server-only": {},
    "next/link": {
      __esModule: true,
      default: ({ href, children, ...props }) => h("a", { href, ...props }, children)
    },
    ...overrides
  });
}

async function renderEmptyAdmin() {
  const services = {
    getAdminRecipeSummary: async () => ({ totalRecipes: 10026, totalCategories: 6, totalTags: 18, totalUsers: 12 }),
    listRecipes: async () => pageResult([], 0),
    listPublicCatalogRecipes: async () => pageResult([], 0)
  };
  const page = load({
    "../../lib/site-metadata": { pageMetadata: () => ({}) },
    "../../server/auth/session": { requireAdmin: async () => admin },
    "../../server/recipes/service": services,
    "./delete-recipe-dialog": { DeleteRecipeDialog: () => null }
  })(path.join(root, "src/app/admin/page.tsx")).default;
  return renderToStaticMarkup(await page({ searchParams: Promise.resolve({ view: "public" }) }));
}

async function login(page, next) {
  await page.goto(`${base}/login?next=${encodeURIComponent(next)}`, { waitUntil: "networkidle" });
  await page.getByLabel("Имейл", { exact: true }).fill(admin.email);
  await page.getByLabel("Парола", { exact: true }).fill(admin.password);
  await page.getByRole("button", { name: "Влез", exact: true }).click();
  await page.waitForURL((url) => url.pathname === next);
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: ".ctl,.back-to-top{display:none!important}" });
}

async function alignTo(page, selector) {
  await page.locator(selector).evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - 150));
  });
}

const openMock = (view, dialog = false, focusSelector) => async (page) => {
  await page.goto(`${mockUrl}?who=admin#${view}`, { waitUntil: "load" });
  await settle(page);
  if (dialog) {
    const trigger = page.locator("[data-delete]").first();
    await trigger.focus();
    await page.keyboard.press("Enter");
    await page.locator("dialog.admin-dialog[open]").waitFor();
  }
  if (focusSelector) await alignTo(page, focusSelector);
};

const openLive = (route, dialog = false) => async (page) => {
  await login(page, route);
  await settle(page);
  if (dialog) {
    const trigger = page.locator(".admin-row").first().getByRole("button", { name: "Изтрий", exact: true });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await page.locator("dialog.admin-dialog[open]").waitFor();
  }
};

const openRendered = (markup, focusSelector) => async (page) => {
  await login(page, "/admin/recipes/new");
  await page.evaluate((html) => { document.querySelector("main").innerHTML = html; }, markup);
  await settle(page);
  if (focusSelector) await alignTo(page, focusSelector);
};

const openFormError = async (page) => {
  await login(page, "/admin/recipes/new");
  await settle(page);
  await page.evaluate(() => {
    const form = document.querySelector(".admin-form");
    const title = form?.querySelector('[name="title"]');
    if (!(form instanceof HTMLFormElement) || !(title instanceof HTMLInputElement)) return;
    const alert = document.createElement("p");
    alert.className = "admin-form-error";
    alert.setAttribute("role", "alert");
    alert.textContent = "Рецептата не може да бъде запазена в момента. Провери данните и опитай отново.";
    form.prepend(alert);
    title.value = "";
    title.setAttribute("aria-invalid", "true");
    title.setAttribute("aria-describedby", "evidence-title-error");
    const error = document.createElement("span");
    error.className = "admin-field-error";
    error.id = "evidence-title-error";
    error.textContent = "Въведи заглавие на рецептата.";
    title.insertAdjacentElement("afterend", error);
    const values = { category: "Основни", description: "Кратко описание на домашната рецепта.", prepTime: "20", cookTime: "45", servings: "4" };
    for (const [name, value] of Object.entries(values)) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.value = value;
    }
  });
};

const browser = await chromium.launch();
const emptyMarkup = await renderEmptyAdmin();
const jobs = [
  ["admin", openMock("admin"), openLive("/admin")],
  ["form", openMock("admin-new"), openLive("/admin/recipes/new")],
  ["dialog", openMock("admin", true), openLive("/admin", true)],
  ["empty", openMock("admin-empty", false, ".admin-empty"), openRendered(emptyMarkup, ".admin-empty")],
  ["error", openMock("admin-error"), openFormError]
];

for (const width of [1440, 390]) {
  for (const [name, mockOpen, siteOpen] of jobs) {
    const images = [];
    for (const open of [mockOpen, siteOpen]) {
      const context = await browser.newContext({
        viewport: { width, height: heights[width] },
        deviceScaleFactor: 1,
        locale: "bg-BG",
        reducedMotion: "reduce"
      });
      const page = await context.newPage();
      await open(page);
      images.push(await page.screenshot({ type: "jpeg", quality: 84 }));
      await context.close();
    }

    const comparison = await browser.newPage({ viewport: { width: width * 2 + 48, height: heights[width] + 64 } });
    const image = (data) => `data:image/jpeg;base64,${data.toString("base64")}`;
    await comparison.setContent(`<!doctype html><meta charset="utf-8"><style>
      *{box-sizing:border-box}body{margin:0;background:#3a3434;color:#fff;font:600 14px system-ui;padding:12px}
      main{display:grid;grid-template-columns:${width}px ${width}px;gap:16px;align-items:start}
      figure{margin:0}figcaption{height:28px;display:flex;align-items:center}img{display:block;width:${width}px;height:${heights[width]}px;border:1px solid #777}
    </style><main><figure><figcaption>Макет · ${name}</figcaption><img src="${image(images[0])}"></figure><figure><figcaption>Сайт · ${name}</figcaption><img src="${image(images[1])}"></figure></main>`);
    await comparison.screenshot({
      fullPage: true,
      path: path.join(output, `${name}-${width}.jpg`),
      quality: 84,
      type: "jpeg"
    });
    await comparison.close();
    console.log(`${name}-${width}.jpg`);
  }
}

await browser.close();
