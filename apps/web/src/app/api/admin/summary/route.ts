import { NextResponse } from "next/server";
import { recipes } from "../../../catalog/recipes";

export function GET() {
  const categories = new Set(recipes.map((recipe) => recipe.category));
  const tags = new Set(recipes.flatMap((recipe) => recipe.tags));

  return NextResponse.json({
    data: {
      totalRecipes: recipes.length,
      totalCategories: categories.size,
      totalTags: tags.size
    },
    message: "Placeholder админ статистика. Реалните данни ще идват от база данни."
  });
}
