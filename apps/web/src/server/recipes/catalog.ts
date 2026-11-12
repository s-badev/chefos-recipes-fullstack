import { recipes as curated } from "../../data/recipes";
import { toCardRecipe } from "../../lib/catalog";
import { listPublicCatalogRecipes } from "./service";
import { withWebRecipeImage } from "./web-image";

/** Public catalog remains bounded; details/ingredients never cross the client boundary. */
export async function getCatalogCards() {
  const page = await listPublicCatalogRecipes({ page: 1, pageSize: 50 });
  const slugs = new Set(curated.map(recipe => recipe.slug));
  const publicRecipes = [...curated, ...page.items.filter(recipe => !slugs.has(recipe.slug))];
  return (await Promise.all(publicRecipes.map(recipe => withWebRecipeImage(recipe)))).map(toCardRecipe);
}
