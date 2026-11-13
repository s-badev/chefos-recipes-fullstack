/**
 * Web-only additions to individual recipes, keyed by slug. They never reach packages/shared, the
 * seed or the API; each entry is approved by the owner (recipe copy is a separate task).
 */
export type RecipeExtras = {
  /** A small note under the "Подготовка" value, e.g. a step that happens the day before. */
  prepNote?: string;
};

export const recipeExtras: Readonly<Record<string, RecipeExtras>> = {
  // Step 01 soaks the beans overnight, which the 20-minute preparation time does not show.
  "bob-chorba": { prepNote: "+ накисване през нощта" }
};

export function recipeExtrasFor(slug: string): RecipeExtras {
  return recipeExtras[slug] ?? {};
}
