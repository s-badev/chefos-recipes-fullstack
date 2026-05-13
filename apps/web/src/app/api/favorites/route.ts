import { NextResponse } from "next/server";
import { listFavoriteRecipes } from "../../../server/recipes/service";

export function GET() {
  const favoriteRecipes = listFavoriteRecipes();

  return NextResponse.json({
    data: favoriteRecipes,
    message: "Примерни любими рецепти. Реалните любими ще бъдат свързани с потребителски профил.",
    meta: {
      count: favoriteRecipes.length,
      source: "static-sample-data"
    }
  });
}
