import "server-only";
import { findRecipeBySlug } from "../../data/recipes";
import { getPublicCatalogRecipeBySlug } from "./service";
import { withWebRecipeImage } from "./web-image";

/** Only curated or public/manual records reach the filesystem image resolver. */
export async function getWebRecipeForDetails(slug: string) {
  const recipe = findRecipeBySlug(slug) ?? await getPublicCatalogRecipeBySlug(slug);
  return recipe ? withWebRecipeImage(recipe) : null;
}
