import type { Recipe } from "../data/recipes";

export type CardRecipe = Omit<Recipe, "ingredients" | "steps">;
export function toCardRecipe(recipe: Recipe): CardRecipe {
  const { title, slug, imageSrc, imageAlt, description, prepTimeMinutes, cookTimeMinutes, servings, difficulty, category, tags } = recipe;
  return { title, slug, imageSrc, imageAlt, description, prepTimeMinutes, cookTimeMinutes, servings, difficulty, category, tags };
}

export function filterCatalog(recipes: readonly CardRecipe[], q: string, category: string) {
  const query = q.trim().toLocaleLowerCase("bg-BG");
  return recipes.filter(recipe => (!category || category === "Всички" || recipe.category === category) &&
    [recipe.title, recipe.slug, recipe.description, recipe.category, ...recipe.tags].join(" ").toLocaleLowerCase("bg-BG").includes(query));
}
