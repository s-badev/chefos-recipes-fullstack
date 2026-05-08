import type { Metadata } from "next";
import { RecipeCatalog } from "./recipe-catalog";

export const metadata: Metadata = {
  title: "Каталог с рецепти | Chefo’s Recipes",
  description: "Разгледай български рецепти по категория, време и трудност."
};

export default function CatalogPage() {
  return <RecipeCatalog />;
}
