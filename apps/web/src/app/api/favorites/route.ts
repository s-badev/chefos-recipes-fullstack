import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../server/auth/session";
import { listFavoriteRecipes } from "../../../server/recipes/service";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходим е вход." }, { status: 401 });
  }

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
