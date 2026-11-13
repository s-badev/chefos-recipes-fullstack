// LCP and CLS of one page on a throttled phone (390×844, 4× CPU, slow 4G: 150 ms RTT, 1.6 Mbps down,
// 750 kbps up), cold cache, median of N runs. Usage from apps/web against a running production server:
//   node scripts/recipe-vitals.mjs [url] [runs]
import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://localhost:3000/catalog/shopska-salata";
const runs = Number(process.argv[3] ?? 3);
const browser = await chromium.launch();
const results = [];

for (let run = 0; run < runs; run++) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: "bg-BG" });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(() => {
    window.__vitals = { lcp: 0, lcpElement: "", cls: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__vitals.lcp = entry.startTime;
        const el = entry.element;
        window.__vitals.lcpElement = el ? `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : ""}` : "";
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__vitals.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(url, { waitUntil: "load", timeout: 120_000 });
  await page.waitForTimeout(5000);
  results.push(await page.evaluate(() => window.__vitals));
  await context.close();
}
await browser.close();

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
console.log(JSON.stringify({
  url,
  runs: results.map((r) => ({ lcpMs: Math.round(r.lcp), cls: Number(r.cls.toFixed(4)), lcpElement: r.lcpElement })),
  medianLcpMs: Math.round(median(results.map((r) => r.lcp))),
  medianCls: Number(median(results.map((r) => r.cls)).toFixed(4))
}, null, 2));
