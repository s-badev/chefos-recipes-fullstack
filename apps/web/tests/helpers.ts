import type { Page } from "@playwright/test";

export type PageProblems = { console: string[]; pageErrors: string[]; badAssets: string[] };

/** Collects console errors/warnings, uncaught errors and failed /_next assets for one page. */
export function watchProblems(page: Page): PageProblems {
  const problems: PageProblems = { console: [], pageErrors: [], badAssets: [] };
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      problems.console.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => problems.pageErrors.push(String(error)));
  page.on("response", (response) => {
    if (response.status() >= 400 && new URL(response.url()).pathname.startsWith("/_next/")) {
      problems.badAssets.push(`${response.status()} ${response.url()}`);
    }
  });
  return problems;
}
