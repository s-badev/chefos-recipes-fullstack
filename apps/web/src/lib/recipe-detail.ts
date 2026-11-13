import { recipes as curatedRecipes } from "../data/recipes";

/**
 * Web-only copy of the image the recipe repository substitutes when a manual (admin) recipe has no
 * stored image. The repository and the API keep returning it unchanged; only the web detail page
 * reads it to decide that such a recipe has no photograph of its own.
 * tests/recipe.spec.ts checks that this value still matches the repository.
 */
export const RECIPE_FALLBACK_IMAGE_SRC = "/images/recipes/musaka-s-kartofi.png";

const curatedIndex = new Map(curatedRecipes.map((recipe, index) => [recipe.slug, index]));

/** Membership check shared with the web image resolver. */
export function isCuratedRecipe(slug: string): boolean {
  return curatedIndex.has(slug);
}

/**
 * A curated recipe always shows its own photograph. A manual recipe shows a photograph only when it
 * has a stored image that is not the repository's substitute.
 */
export function hasRecipePhoto(recipe: { slug: string; imageSrc?: string }): boolean {
  if (!recipe.imageSrc) return false;
  return curatedIndex.has(recipe.slug) || recipe.imageSrc !== RECIPE_FALLBACK_IMAGE_SRC;
}

/**
 * The "next recipe" in the curated order: the one after this recipe, the first after the last,
 * and the first for a manual (admin) recipe.
 */
export function nextCuratedRecipe(slug: string) {
  const index = curatedIndex.get(slug);
  const next = curatedRecipes[index === undefined ? 0 : (index + 1) % curatedRecipes.length];
  return { recipe: next };
}

/** Tags as one plain line: "Постно · Домашно · Бюджетно". */
export function tagLine(tags: readonly string[]): string {
  return tags.map(tag => tag.trim()).filter(Boolean).join(" · ");
}

/** "01", "02" … for the large step numbers. */
export function stepNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/**
 * The muted line that replaces a missing section: one line per missing section, or a single
 * combined line when both are missing. Empty lists, ticks, counters and the progress line are never shown.
 */
export function missingContentNotes(ingredients: number, steps: number): { all?: string; ingredients?: string; steps?: string } {
  if (!ingredients && !steps) return { all: "Продуктите и стъпките за тази рецепта още не са добавени." };
  return {
    ingredients: ingredients ? undefined : "Продуктите за тази рецепта още не са добавени.",
    steps: steps ? undefined : "Стъпките за тази рецепта още не са добавени."
  };
}
