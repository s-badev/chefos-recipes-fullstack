import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/site-metadata";
import { RecipeCatalog } from "../recipe-catalog";
import { getCurrentUserFavoriteSlugs } from "../../../server/favorites/service";
import { getCatalogCards } from "../../../server/recipes/catalog";

export const metadata: Metadata = pageMetadata("Каталог с рецепти", "Разгледай български рецепти по категория, време и трудност.", "/catalog");

export const dynamic = "force-dynamic";


type CatalogPageProps = { searchParams: Promise<{ q?: string | string[]; category?: string | string[] }> };

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const [favoriteSlugs, recipes, params] = await Promise.all([
    getCurrentUserFavoriteSlugs(),
    getCatalogCards(),
    searchParams
  ]);
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

  // The server renders the filtered view of ?q= / ?category= at once, so there is no flash of all recipes.
  return <RecipeCatalog favoriteSlugs={favoriteSlugs} initialCategory={first(params.category)} initialQuery={first(params.q)} recipes={recipes} />;
}
