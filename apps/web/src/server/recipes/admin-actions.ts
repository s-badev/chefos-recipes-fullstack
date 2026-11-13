"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../auth/session";
import { createRecipe, deleteRecipeBySlug, updateRecipeBySlug } from "./service";
import type { RecipeFormState } from "../../app/admin/recipes/recipe-form-state";

function validateRecipeForm(formData: FormData): NonNullable<RecipeFormState["fieldErrors"]> {
  const fieldErrors: NonNullable<RecipeFormState["fieldErrors"]> = {};

  if (!String(formData.get("title") ?? "").trim()) {
    fieldErrors.title = "Въведи заглавие на рецептата.";
  }
  if (!String(formData.get("category") ?? "").trim()) {
    fieldErrors.category = "Въведи категория.";
  }
  if (!String(formData.get("description") ?? "").trim()) {
    fieldErrors.description = "Добави кратко описание.";
  }

  return fieldErrors;
}

export async function createRecipeFormAction(
  _previousState: RecipeFormState,
  formData: FormData
): Promise<RecipeFormState> {
  const admin = await requireAdmin();
  const fieldErrors = validateRecipeForm(formData);

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    await createRecipe(formData, admin.email);
  } catch {
    return { formError: "Рецептата не може да бъде запазена в момента. Провери данните и опитай отново." };
  }

  revalidatePath("/admin");
  revalidatePath("/catalog");
  redirect("/admin");
}

export async function updateRecipeFormAction(
  _previousState: RecipeFormState,
  formData: FormData
): Promise<RecipeFormState> {
  await requireAdmin();
  const fieldErrors = validateRecipeForm(formData);

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const slug = String(formData.get("slug") ?? "");

  try {
    await updateRecipeBySlug(slug, formData);
  } catch {
    return { formError: "Промените не могат да бъдат запазени в момента. Провери данните и опитай отново." };
  }

  revalidatePath("/admin");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${slug}`);
  redirect("/admin");
}

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
