import type { Recipe } from "../data/recipes";

export type CategorySummary = {
  name: string;
  recipeCount: number;
  /** Photo of the category's first recipe, used as the tile cover. */
  imageSrc?: string;
};

/** Categories of the given recipes, sorted the Bulgarian way, with counts and a cover photo. */
export function summarizeCategories(recipes: readonly Recipe[]): CategorySummary[] {
  const byName = new Map<string, CategorySummary>();
  for (const recipe of recipes) {
    const current = byName.get(recipe.category);
    if (current) current.recipeCount += 1;
    else byName.set(recipe.category, { name: recipe.category, recipeCount: 1, imageSrc: recipe.imageSrc });
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, "bg"));
}

const neuterNumbers = ["", "едно", "две", "три", "четири", "пет", "шест", "седем", "осем", "девет", "десет"];

/** Bulgarian count for neuter nouns ("шест ястия"); digits above ten. */
export function neuterCount(count: number): string {
  return neuterNumbers[count] ?? String(count);
}

/** Catalog link for one category; the catalog reads ?category= (see recipe-catalog). */
export function categoryHref(name: string): string {
  return `/catalog?category=${encodeURIComponent(name)}`;
}
