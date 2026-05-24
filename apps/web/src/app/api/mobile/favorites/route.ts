import { NextResponse } from "next/server";
import {
  addFavoriteRecipeForUser,
  listFavoriteRecipesForUser
} from "../../../../server/favorites/repository";
import {
  jsonError,
  readJsonBody,
  requireMobileApiUser
} from "../../../../server/mobile/http";
import {
  getMobileRecipeBySlug,
  recipeToMobileSummary
} from "../../../../server/mobile/recipes";

export async function GET(request: Request) {
  const auth = requireMobileApiUser(request);

  if (auth.response) {
    return auth.response;
  }

  try {
    const favoriteRecipes = await listFavoriteRecipesForUser(auth.user);

    return NextResponse.json({
      items: favoriteRecipes.map(recipeToMobileSummary)
    });
  } catch {
    return jsonError("Favorites could not be loaded.", 500);
  }
}

export async function POST(request: Request) {
  const auth = requireMobileApiUser(request);

  if (auth.response) {
    return auth.response;
  }

  const body = await readJsonBody(request);
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";

  if (!slug) {
    return jsonError("Recipe slug is required.", 400);
  }

  try {
    const recipe = await getMobileRecipeBySlug(slug);

    if (!recipe) {
      return jsonError("Recipe was not found.", 404);
    }

    const result = await addFavoriteRecipeForUser(auth.user, slug);

    if (!result.ok) {
      return jsonError("Recipe was not found.", 404);
    }

    return NextResponse.json({
      ok: true,
      favorite: true,
      slug
    });
  } catch {
    return jsonError("Favorite could not be saved.", 500);
  }
}
