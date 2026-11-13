import "server-only";
import { cache } from "react";
import { findRecipeBySlug } from "../../data/recipes";
import { getPublicCatalogRecipeBySlug } from "./service";
import { withWebRecipeImage } from "./web-image";

/** Only curated or public/manual records reach the filesystem image resolver. */
export const getWebRecipeForDetails = cache(async (slug: string) => {
  const recipe = findRecipeBySlug(slug) ?? await getPublicCatalogRecipeBySlug(slug);
  return recipe ? withWebRecipeImage(recipe) : null;
});
