"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "../auth/session";
import { loginHref, safeNextPath } from "../../lib/navigation";
import type { FavoriteState } from "../../lib/favorites";
import { getPublicCatalogRecipeBySlug } from "../recipes/service";
import { findRecipeBySlug as findCuratedRecipe } from "../../data/recipes";
import {
  addFavoriteRecipeForUser,
  removeFavoriteRecipeForUser
} from "./repository";

function getRecipeSlug(formData: FormData) {
  return String(formData.get("recipeSlug") ?? "").trim();
}

function getRedirectPath(formData: FormData, fallback: string) {
  return safeNextPath(formData.get("redirectTo"), fallback);
}

function revalidateFavoriteViews(recipeSlug: string) {
  revalidatePath("/", "layout");
  revalidatePath("/favorites");
  revalidatePath("/profile");
  revalidatePath("/catalog");

  if (recipeSlug) {
    revalidatePath(`/catalog/${recipeSlug}`);
  }
}

export async function addFavoriteAction(formData: FormData) {
  const recipeSlug = getRecipeSlug(formData);
  const redirectTo = getRedirectPath(formData, recipeSlug ? `/catalog/${recipeSlug}` : "/catalog");
  const user = await getCurrentUser();

  if (!user) {
    redirect(loginHref(redirectTo));
  }

  if (recipeSlug) {
    const result = await addFavoriteRecipeForUser(user, recipeSlug);

    if (result.ok) {
      revalidateFavoriteViews(recipeSlug);
    } else {
      console.warn(`[favorites] ${result.error} (slug: ${recipeSlug})`);
    }
  }

  redirect(redirectTo);
}

export async function removeFavoriteAction(formData: FormData) {
  const recipeSlug = getRecipeSlug(formData);
  const redirectTo = getRedirectPath(formData, recipeSlug ? `/catalog/${recipeSlug}` : "/favorites");
  const user = await getCurrentUser();

  if (!user) {
    redirect(loginHref(redirectTo));
  }

  if (recipeSlug) {
    await removeFavoriteRecipeForUser(user, recipeSlug);
    revalidateFavoriteViews(recipeSlug);
  }

  redirect(redirectTo);
}

export async function updateFavoriteAction(previous: FavoriteState, formData: FormData): Promise<FavoriteState> {
  const slug = getRecipeSlug(formData);
  const redirectTo = getRedirectPath(formData, `/catalog/${encodeURIComponent(slug)}`);
  const user = await getCurrentUser();
  if (!user) redirect(loginHref(redirectTo));
  if (!findCuratedRecipe(slug) && !(await getPublicCatalogRecipeBySlug(slug))) return { saved: previous.saved, message: "Рецептата не е налична." };
  const saved = formData.get("saved") === "true";
  if (saved) {
    const result = await addFavoriteRecipeForUser(user, slug);
    if (!result.ok) return { saved: previous.saved, message: "Рецептата не може да бъде запазена. Опитай отново." };
  } else await removeFavoriteRecipeForUser(user, slug);
  revalidateFavoriteViews(slug);
  return { saved, message: "" };
}
