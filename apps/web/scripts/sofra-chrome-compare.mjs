// Header (desktop menu or the open mobile menu) and footer for guest, user and admin, mock / site, at 1440
// and 390 (JPEG, quality 80), against a running production server:
//   node scripts/sofra-chrome-compare.mjs [baseUrl] [outDir]
// Guest is the live site. User and admin need a session, and a real sign-in can write to the database, so
// those two are the REAL header and footer components rendered with a sample session (no database) and put
// into the live page in place of the guest ones (production CSS). Marked on the image.
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);
const { createLoader } = require("./load-typescript.cjs");
const base = process.argv[2] ?? "http://localhost:3000";
const out = path.resolve(process.argv[3] ?? "../../docs/redesign/shots/sofra/round3");
mkdirSync(out, { recursive: true });
const mockUrl = pathToFileURL(path.resolve("../../docs/redesign/sofra-mock.html")).href;
const h = React.createElement;
const load = createLoader({
  "server-only": {},
  "next/link": { __esModule: true, default: ({ href, children, ...props }) => h("a", { href, ...props }, children) },
  "next/navigation": { usePathname: () => "/" },
  "../server/auth/actions": { logoutAction: async () => undefined },
  "./session-user": { getSessionUser: async () => undefined }
});
const { SiteHeaderClient } = load(path.resolve("src/app/site-header-client.tsx"));
const { SiteFooterView } = load(path.resolve("src/app/site-footer.tsx"));
const PEOPLE = { guest: undefined, user: { name: "Мария Петрова", email: "maria@example.com", role: "user" }, admin: { name: "Admin", email: "admin@example.com", role: "admin" } };
const LABEL = { guest: "Гост", user: "Потребител", admin: "Админ" };

const browser = await chromium.launch();
const shot = (buffer) => `data:image/jpeg;base64,${buffer.toString("base64")}`;

async function capture(page, width, openMenu) {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: ".ctl,.back-to-top{visibility:hidden!important}" });
  await page.waitForTimeout(500);
  let top;
  if (width === 1440) top = await page.screenshot({ type: "jpeg", quality: 80, clip: { x: 0, y: 0, width, height: 110 } });
  else { await openMenu(); await page.waitForTimeout(900); top = await page.screenshot({ type: "jpeg", quality: 80 }); }
  const measured = await page.evaluate(() => {
    const nav = [...document.querySelectorAll(innerWidth > 1000 ? "header nav > a, header nav > span, header nav form button" : "#mnav-links > *, .mobile-nav > a, .mobile-nav > span, .mobile-nav form button")]
      .filter(node => node.getBoundingClientRect().width).map(node => node.textContent.replace(/\s+/g, " ").trim());
    return { nav };
  });
  await page.keyboard.press("Escape");
  await page.evaluate(() => { document.querySelector("#mnav")?.classList.remove("open"); document.querySelector("dialog.mobile-menu")?.close?.(); });
  const footer = page.locator("footer.ftr");
  await footer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const foot = await footer.screenshot({ type: "jpeg", quality: 80 });
  measured.footer = await footer.evaluate(node => ({
    columns: [...node.querySelectorAll(".ftr-grid > *")].map(col => { const r = col.getBoundingClientRect(); return { x: Math.round(r.x), w: Math.round(r.width), text: [...col.querySelectorAll("h2,h3,li")].map(el => el.textContent.trim()) }; }),
    base: node.querySelector(".ftr-base p")?.textContent.trim()
  }));
  return { top, foot, measured };
}

const results = {};
for (const width of [1440, 390]) {
  const rows = [];
  for (const who of Object.keys(PEOPLE)) {
    const ctx = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: 1, locale: "bg-BG" });
    const mock = await ctx.newPage();
    await mock.goto(`${mockUrl}?who=${who}#home`, { waitUntil: "load" });
    await mock.waitForTimeout(900);
    const m = await capture(mock, width, () => mock.locator("#menu-btn").click());
    const site = await ctx.newPage();
    await site.goto(`${base}/`, { waitUntil: "networkidle" });
    if (PEOPLE[who]) {
      const header = renderToStaticMarkup(h(SiteHeaderClient, { currentUser: PEOPLE[who], favoriteCount: 2, logoutAction: async () => undefined }));
      const footer = renderToStaticMarkup(h(SiteFooterView, { user: PEOPLE[who], logout: async () => undefined, year: new Date().getFullYear() }));
      await site.evaluate(({ header, footer }) => {
        document.querySelector("dialog.mobile-menu").remove();
        document.querySelector("header.hdr").outerHTML = header;
        document.querySelector("footer.ftr").outerHTML = footer;
      }, { header, footer });
    }
    const s = await capture(site, width, async () => {
      if (PEOPLE[who]) await site.evaluate(() => document.querySelector("dialog.mobile-menu").showModal());
      else await site.getByRole("button", { name: "Меню" }).click();
    });
    results[`${who}-${width}`] = { mock: m.measured, site: s.measured, navSame: JSON.stringify(m.measured.nav) === JSON.stringify(s.measured.nav) };
    rows.push({ who, m, s });
    await ctx.close();
  }
  const view = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const note = (who) => PEOPLE[who] ? "Сайт: реалните header и footer с примерна сесия (без вход и база)" : "Сайт (production build)";
  await view.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#3a3434;color:#fff;font:600 15px system-ui}section{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px;align-items:start}h2{grid-column:1/-1;margin:8px 0 0;font-size:18px}figure{margin:0;display:grid;gap:8px}figcaption{font-weight:500}img{display:block;max-width:${width === 390 ? "390px" : "100%"};height:auto;border:1px solid #777}</style>${rows.map(({ who, m, s }) => `<section><h2>${LABEL[who]}</h2><figure><figcaption>Макет (sofra-mock.html, ?who=${who})</figcaption><img src="${shot(m.top)}"><img src="${shot(m.foot)}"></figure><figure><figcaption>${note(who)}</figcaption><img src="${shot(s.top)}"><img src="${shot(s.foot)}"></figure></section>`).join("")}`);
  await view.waitForTimeout(300);
  await view.screenshot({ path: path.join(out, `chrome-${width}.jpg`), fullPage: true, type: "jpeg", quality: 80 });
  await view.close();
}
await browser.close();
writeFileSync(path.join(out, "measure-chrome.json"), JSON.stringify(results, null, 2));
for (const [key, value] of Object.entries(results)) console.log(key, value.navSame ? "nav same" : `nav differs: ${JSON.stringify(value.mock.nav)} / ${JSON.stringify(value.site.nav)}`, JSON.stringify(value.mock.footer.columns.map(c => c.x)), JSON.stringify(value.site.footer.columns.map(c => c.x)));
