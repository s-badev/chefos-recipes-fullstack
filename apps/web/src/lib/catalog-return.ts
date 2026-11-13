import { safeNextPath } from "./navigation";

const KEY = "chefos:catalog-return";

/** Only the catalog list itself (optionally with ?q= / ?category=) is a valid way back. */
export function validCatalogHref(value: unknown): string {
  const path = safeNextPath(value, "/catalog");
  return /^\/catalog(?:\?|$)/.test(path) ? path : "/catalog";
}

/** Remembers the catalog view (search and category) for the "back to catalog" link in this tab. */
export function rememberCatalogHref(href: string) {
  try {
    window.sessionStorage.setItem(KEY, validCatalogHref(href));
  } catch {
    // sessionStorage can be blocked (private mode, disabled site data); the link then falls back to /catalog.
  }
}

export function rememberedCatalogHref(): string {
  let stored: string | null = null;
  try {
    stored = window.sessionStorage.getItem(KEY);
  } catch {
    // sessionStorage can be blocked (private mode, disabled site data); the plain catalog is used instead.
  }
  return validCatalogHref(stored);
}
