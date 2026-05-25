"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "../auth/session";
import {
  addFavoriteRecipeForUser,
  removeFavoriteRecipeForUser
} from "./repository";

function getRecipeSlug(formData: FormData) {
  return String(formData.get("recipeSlug") ?? "").trim();
}

function getRedirectPath(formData: FormData, fallback: string) {
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();

  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return fallback;
  }

  return redirectTo;
}

function revalidateFavoriteViews(recipeSlug: string) {
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
    redirect("/login");
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
    redirect("/login");
  }

  if (recipeSlug) {
    await removeFavoriteRecipeForUser(user, recipeSlug);
    revalidateFavoriteViews(recipeSlug);
  }

  redirect(redirectTo);
}
