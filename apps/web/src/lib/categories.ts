/** Catalog link for one category; the catalog reads ?category= (see use-catalog). */
export function categoryHref(name: string): string {
  return `/catalog?category=${encodeURIComponent(name)}`;
}
