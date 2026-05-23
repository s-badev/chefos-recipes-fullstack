import { getCurrentUser, requireUser } from "../auth/session";
import {
  isFavoriteRecipeForUser,
  listFavoriteRecipesForUser,
  listFavoriteRecipeSlugsForUser
} from "./repository";

export async function getCurrentUserFavoriteSlugs() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  return listFavoriteRecipeSlugsForUser(user);
}

export async function getCurrentUserFavoriteRecipes() {
  const user = await requireUser();

  return listFavoriteRecipesForUser(user);
}

export async function isCurrentUserFavoriteRecipe(recipeSlug: string) {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  return isFavoriteRecipeForUser(user, recipeSlug);
}
