import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../server/auth/session";
import { listFavoriteRecipesForUser } from "../../../server/favorites/repository";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходим е вход." }, { status: 401 });
  }

  const favoriteRecipes = await listFavoriteRecipesForUser(user);

  return NextResponse.json({
    data: favoriteRecipes,
    meta: {
      count: favoriteRecipes.length,
      source: "database"
    }
  });
}
