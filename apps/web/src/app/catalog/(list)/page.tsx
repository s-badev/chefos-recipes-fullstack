import type { Metadata } from "next";
import { RecipeCatalog } from "./recipe-catalog";
import { recipes as curatedRecipes } from "./recipes";
import { getCurrentUserFavoriteSlugs } from "../../server/favorites/service";
import { listPublicCatalogRecipes } from "../../server/recipes/service";

export const metadata: Metadata = {
  title: "Каталог с рецепти | Chefo’s Recipes",
  description: "Разгледай български рецепти по категория, време и трудност."
};

export const dynamic = "force-dynamic";

const CATALOG_DB_RECIPE_LIMIT = 50;

async function getCatalogRecipes() {
  try {
    const dbRecipePage = await listPublicCatalogRecipes({
      page: 1,
      pageSize: CATALOG_DB_RECIPE_LIMIT
    });
    const curatedSlugSet = new Set(curatedRecipes.map((recipe) => recipe.slug));
    const dbOnlyRecipes = dbRecipePage.items.filter((recipe) => !curatedSlugSet.has(recipe.slug));

    return [...curatedRecipes, ...dbOnlyRecipes];
  } catch (error) {
    console.warn("[catalog] Database recipes are not available; showing curated recipes only.");

    return curatedRecipes;
  }
}

export default async function CatalogPage() {
  const [favoriteSlugs, recipes] = await Promise.all([
    getCurrentUserFavoriteSlugs(),
    getCatalogRecipes()
  ]);

  return <RecipeCatalog favoriteSlugs={favoriteSlugs} recipes={recipes} />;
}
