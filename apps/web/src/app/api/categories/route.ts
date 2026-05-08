import { NextResponse } from "next/server";
import { recipes } from "../../catalog/recipes";

export function GET() {
  const categories = Array.from(new Set(recipes.map((recipe) => recipe.category))).map(
    (category) => ({
      name: category,
      recipeCount: recipes.filter((recipe) => recipe.category === category).length
    })
  );

  return NextResponse.json({
    data: categories,
    meta: {
      count: categories.length,
      source: "static-sample-data"
    }
  });
}
