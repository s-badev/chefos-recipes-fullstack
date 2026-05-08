import { NextResponse } from "next/server";
import { getAllRecipes, getCategories, getTags } from "../../../../data/recipes";

export function GET() {
  const recipes = getAllRecipes();
  const categories = getCategories();
  const tags = getTags();

  return NextResponse.json({
    data: {
      totalRecipes: recipes.length,
      totalCategories: categories.length,
      totalTags: tags.length
    },
    message: "Placeholder админ статистика. Реалните данни ще идват от база данни."
  });
}
