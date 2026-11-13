import type { MetadataRoute } from "next";
import { getPublicRecipes } from "../server/recipes/catalog";
import { absoluteUrl, recipePath } from "../lib/site-metadata";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Exactly the catalog's bounded source, including manual recipes and excluding generated rows.
  const recipes = await getPublicRecipes();
  return ["/", "/catalog", "/about", ...recipes.map(recipe => recipePath(recipe.slug))].map(path => ({ url: absoluteUrl(path) }));
}
