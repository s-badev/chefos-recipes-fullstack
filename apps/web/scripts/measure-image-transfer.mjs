import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const label = process.argv[2] || "before";
const out = fileURLToPath(new URL("../../../docs/redesign/shots/images/", import.meta.url));
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [1440, 390]) for (const route of ["/catalog", "/", "/catalog/shopska-salata"]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send("Network.enable"); await session.send("Network.setCacheDisabled", { cacheDisabled: true });
    const images = new Set(), transfers = new Map();
    session.on("Network.responseReceived", ({ requestId, type, response }) => {
      if (type === "Image") { images.add(requestId); transfers.set(requestId, { url: response.url, bytes: 0 }); }
    });
    session.on("Network.loadingFinished", ({ requestId, encodedDataLength }) => {
      if (images.has(requestId)) transfers.get(requestId).bytes = encodedDataLength;
    });
    await page.addInitScript(() => {
      window.__imageLcp = [];
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__imageLcp.push({ url: entry.url, tag: entry.element?.tagName, className: entry.element?.className, size: entry.size }); }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const firstBytes = [...transfers.values()].reduce((sum, row) => sum + row.bytes, 0);
    const lcp = await page.evaluate(() => window.__imageLcp.at(-1));
    const cards = await page.locator(".cards .ci").evaluateAll(nodes => nodes.slice(0, 6).map(node => ({ width: +node.getBoundingClientRect().width.toFixed(1), top: +node.getBoundingClientRect().top.toFixed(1), sizes: node.querySelector("img")?.sizes, currentSrc: node.querySelector("img")?.currentSrc })));
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .7) { scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 120)); } });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    const row = { route, width, dpr: 1, firstBytes, fullScrollBytes: [...transfers.values()].reduce((sum, item) => sum + item.bytes, 0), lcp, cards, images: [...transfers.values()] };
    results.push(row); console.log(JSON.stringify({ route, width, firstBytes, fullScrollBytes: row.fullScrollBytes, lcp }));
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(path.join(out, `transfer-${label}.json`), JSON.stringify(results, null, 2) + "\n");
