import { defineConfig, devices } from "@playwright/test";

/**
 * The server is started separately so the same tests run against `next dev` and a production
 * build: E2E_BASE_URL=http://localhost:3000 npm run test:e2e --workspace apps/web
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    locale: "bg-BG",
    trace: "retain-on-failure"
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }]
});
