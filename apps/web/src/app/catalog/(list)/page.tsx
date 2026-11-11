import type { Metadata } from "next";
import { RecipeCatalog } from "../recipe-catalog";
import { getCurrentUserFavoriteSlugs } from "../../../server/favorites/service";
import { getCatalogCards } from "../../../server/recipes/catalog";

export const metadata: Metadata = {
  title: "Каталог с рецепти | Chefo's Recipes",
  description: "Разгледай български рецепти по категория, време и трудност."
};

export const dynamic = "force-dynamic";


export default async function CatalogPage() {
  const [favoriteSlugs, recipes] = await Promise.all([
    getCurrentUserFavoriteSlugs(),
    getCatalogCards()
  ]);

  return <RecipeCatalog favoriteSlugs={favoriteSlugs} recipes={recipes} />;
}
