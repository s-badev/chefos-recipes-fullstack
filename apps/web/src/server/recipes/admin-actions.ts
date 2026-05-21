"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../auth/session";
import { createRecipe, deleteRecipeBySlug, updateRecipeBySlug } from "./service";

export async function createRecipeAction(formData: FormData) {
  const admin = await requireAdmin();
  await createRecipe(formData, admin.email);
  revalidatePath("/admin");
  revalidatePath("/catalog");
  redirect("/admin");
}

export async function updateRecipeAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");

  await updateRecipeBySlug(slug, formData);
  revalidatePath("/admin");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${slug}`);
  redirect("/admin");
}

export async function deleteRecipeAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");

  await deleteRecipeBySlug(slug);
  revalidatePath("/admin");
  revalidatePath("/catalog");
}
