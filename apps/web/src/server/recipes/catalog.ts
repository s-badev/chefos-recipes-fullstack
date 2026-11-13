import { cache } from "react";
import { recipes as curated } from "../../data/recipes";
import { toCardRecipe } from "../../lib/catalog";
import { listPublicCatalogRecipes } from "./service";
import { withWebRecipeImage } from "./web-image";

/**
 * The public catalog: the curated recipes plus manually added admin recipes (bounded page; generated
 * records are excluded by the repository). One source for the catalog and for every visible count.
 */
export const getPublicRecipes = cache(async () => {
  const page = await listPublicCatalogRecipes({ page: 1, pageSize: 50 });
  const slugs = new Set(curated.map(recipe => recipe.slug));
  return [...curated, ...page.items.filter(recipe => !slugs.has(recipe.slug))];
});

/** Public catalog remains bounded; details/ingredients never cross the client boundary. */
export async function getCatalogCards() {
  return (await Promise.all((await getPublicRecipes()).map(recipe => withWebRecipeImage(recipe)))).map(toCardRecipe);
}
