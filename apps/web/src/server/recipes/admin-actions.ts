"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../auth/session";
import { createRecipe, deleteRecipeBySlug, updateRecipeBySlug } from "./service";

export async function createRecipeAction(formData: FormData) {
  const admin = await requireAdmin();

  try {
    await createRecipe(formData, admin.email);
  } catch (error) {
    throw new Error("Рецептата не може да бъде създадена в момента. Провери данните и връзката с базата.");
  }

  revalidatePath("/admin");
  revalidatePath("/catalog");
  redirect("/admin");
}

export async function updateRecipeAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  let nextSlug = slug;

  try {
    const recipe = await updateRecipeBySlug(slug, formData);

    nextSlug = recipe.slug;
  } catch (error) {
    throw new Error("Промените по рецептата не могат да бъдат запазени в момента.");
  }

  revalidatePath("/admin");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${slug}`);
  revalidatePath(`/catalog/${nextSlug}`);
  redirect("/admin");
}

export async function deleteRecipeAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");

  try {
    await deleteRecipeBySlug(slug);
  } catch (error) {
    throw new Error("Рецептата не може да бъде изтрита в момента.");
  }

  revalidatePath("/admin");
  revalidatePath("/catalog");
}
