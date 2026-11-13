import { chromium } from "@playwright/test";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const [phase = "before", mode = "weight"] = process.argv.slice(2);
const routes = ["/", "/catalog", "/catalog/shopska-salata", "/about"];
const out = fileURLToPath(new URL("../../../docs/redesign/shots/sofra/round3/", import.meta.url));
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const rows = [];
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const save = () => writeFile(path.join(out, `${mode}-${phase}.json`), JSON.stringify({ phase, mode, browser: browser.version(), units: "bytes (CDP encodedDataLength; bodyBytes also recorded)", rows }, null, 2) + "\n");
try {
  if (mode === "vitals") {
    for (const route of routes) {
      const runs = [];
      for (let run = 0; run < 3; run++) {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: "bg-BG" });
        const page = await context.newPage();
        const cdp = await context.newCDPSession(page);
        await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
        await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
        await page.addInitScript(() => {
          window.__round3 = { lcp: 0, cls: 0, element: "" };
          new PerformanceObserver(list => { for (const e of list.getEntries()) { window.__round3.lcp = e.startTime; window.__round3.element = e.element?.tagName + "." + e.element?.className; } }).observe({ type: "largest-contentful-paint", buffered: true });
          new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__round3.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
        });
        await page.goto(`http://localhost:3000${route}`, { waitUntil: "load", timeout: 120000 });
        await page.waitForTimeout(5000);
        const result = await page.evaluate(() => window.__round3);
        runs.push(result); console.log(JSON.stringify({ route, run: run + 1, ...result }));
        await context.close();
      }
      rows.push({ route, viewport: "390x844", dpr: 3, cpu: 4, latencyMs: 150, downMbps: 1.6, runs, medianLcpMs: median(runs.map(r => r.lcp)), medianCls: median(runs.map(r => r.cls)) }); await save();
    }
  } else if (mode === "fallback") {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage(), cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await page.goto("http://localhost:3000/catalog", { waitUntil: "networkidle" });
    const sources = await page.locator(".cards img").evaluateAll(nodes => nodes.map(img => ({ src: img.src, currentSrc: img.currentSrc })));
    const transfers = new Map();
    cdp.on("Network.responseReceived", ({ requestId, type, response }) => { if (type === "Fetch") transfers.set(requestId, { url: response.url, bytes: 0 }); });
    cdp.on("Network.loadingFinished", ({ requestId, encodedDataLength }) => { if (transfers.has(requestId)) transfers.get(requestId).bytes = encodedDataLength; });
    const probes = await page.evaluate(async sources => {
      const result = [];
      for (const source of sources) {
        const response = await fetch(source.src, { cache: "no-store" });
        if (!response.ok) throw new Error(`Fallback fetch HTTP ${response.status}`);
        result.push({ ...source, mime: response.headers.get("content-type"), bodyBytes: (await response.arrayBuffer()).byteLength });
      }
      return result;
    }, sources);
    const result = { note: "Diagnostic: fetch(img.src) with browser fetch default Accept:*/*, not actual responsive image requests", probes, bodyBytes: probes.reduce((sum, r) => sum + r.bodyBytes, 0), transferredBytes: [...transfers.values()].reduce((sum, r) => sum + r.bytes, 0), transfers: [...transfers.values()] };
    rows.push(result); await save();
    const weightPath = path.join(out, `weight-${phase}.json`);
    const weights = JSON.parse(await readFile(weightPath, "utf8")); weights.juryFallbackDiagnostic = result;
    await writeFile(weightPath, JSON.stringify(weights, null, 2) + "\n");
    console.log(JSON.stringify({ fallbackProbeBodyBytes: result.bodyBytes, transferredBytes: result.transferredBytes }));
    await context.close();
  } else {
    const cases = mode === "diagnostic" ? [1, 3].map(dpr => ({ route: "/catalog", width: 1440, dpr })) : [1440, 390].flatMap(width => routes.map(route => ({ route, width, dpr: 2 })));
    for (const { route, width, dpr } of cases) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: dpr, locale: "bg-BG" });
      const page = await context.newPage(), cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      const requests = new Map();
      cdp.on("Network.responseReceived", ({ requestId, type, response }) => requests.set(requestId, { type, url: response.url, mime: response.mimeType, status: response.status, transferBytes: 0, bodyBytes: 0 }));
      cdp.on("Network.dataReceived", ({ requestId, dataLength }) => { const row = requests.get(requestId); if (row) row.bodyBytes += dataLength; });
      cdp.on("Network.loadingFinished", ({ requestId, encodedDataLength }) => { const row = requests.get(requestId); if (row) row.transferBytes = encodedDataLength; });
      await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle", timeout: 120000 });
      await page.waitForTimeout(1800);
      const sum = type => [...requests.values()].filter(r => !type || r.type === type).reduce((s, r) => s + r.transferBytes, 0);
      const firstBytes = sum("Image"), firstAllBytes = sum();
      const rendered = await page.locator("img").evaluateAll(nodes => nodes.map(img => ({ src: img.getAttribute("src"), currentSrc: img.currentSrc, sizes: img.sizes, srcset: img.srcset, width: +img.getBoundingClientRect().width.toFixed(1), height: +img.getBoundingClientRect().height.toFixed(1), loading: img.loading })));
      const name = `${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}-${width}`;
      if (mode === "weight") await page.screenshot({ path: path.join(out, `${name}-${phase}-first.jpg`), type: "jpeg", quality: 85 });
      await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .65) { scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 150)); } });
      await page.waitForLoadState("networkidle"); await page.waitForTimeout(1200);
      const broken = await page.locator("img").evaluateAll(nodes => nodes.filter(img => img.complete && !img.naturalWidth).map(img => img.currentSrc));
      if (broken.length) throw new Error(`Broken images: ${broken.join(", ")}`);
      if (mode === "weight") await page.screenshot({ path: path.join(out, `${name}-${phase}-full.jpg`), type: "jpeg", quality: 80, fullPage: true });
      const row = { route, width, dpr, firstBytes, fullBytes: sum("Image"), firstAllBytes, fullAllBytes: sum(), imageBodyBytes: [...requests.values()].filter(r => r.type === "Image").reduce((s, r) => s + r.bodyBytes, 0), rendered, resources: [...requests.values()] };
      rows.push(row); await save(); console.log(JSON.stringify({ route, width, dpr, firstBytes, fullBytes: row.fullBytes, fullAllBytes: row.fullAllBytes }));
      await context.close();
    }
  }
} finally { await browser.close(); }
