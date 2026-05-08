import { NextResponse } from "next/server";
import { recipes } from "../../catalog/recipes";

export function GET() {
  const favoriteRecipes = recipes.slice(0, 3);

  return NextResponse.json({
    data: favoriteRecipes,
    message: "Примерни любими рецепти. Реалните любими ще бъдат свързани с потребителски профил.",
    meta: {
      count: favoriteRecipes.length,
      source: "static-sample-data"
    }
  });
}
