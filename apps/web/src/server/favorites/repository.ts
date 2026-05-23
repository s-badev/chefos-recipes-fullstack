import {
  and,
  asc,
  categories as categoriesTable,
  eq,
  favorites as favoritesTable,
  getDb,
  recipes as recipesTable,
  users as usersTable
} from "@chefos/db";

import type { CurrentUser } from "../auth/session";
import { findRecipeBySlug as findStaticRecipeBySlug, type Recipe } from "../../data/recipes";

type FavoriteRecipeRow = {
  title: string;
  slug: string;
  description: string | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number | null;
  difficulty: string;
  category: string;
};

function formatDifficulty(difficulty: string) {
  switch (difficulty) {
    case "easy":
      return "Лесна";
    case "medium":
      return "Средна";
    case "hard":
      return "Трудна";
    default:
      return difficulty;
  }
}

function mapFavoriteRecipe(row: FavoriteRecipeRow): Recipe {
  const staticRecipe = findStaticRecipeBySlug(row.slug);

  if (staticRecipe) {
    return staticRecipe;
  }

  return {
    title: row.title,
    slug: row.slug,
    description: row.description ?? "",
    prepTimeMinutes: row.prepTimeMinutes ?? 0,
    cookTimeMinutes: row.cookTimeMinutes ?? 0,
    servings: row.servings ?? 0,
    difficulty: formatDifficulty(row.difficulty),
    category: row.category,
    tags: [],
    ingredients: [],
    steps: []
  };
}

async function findUserIdByEmail(email: string) {
  const rows = await getDb()
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  return rows[0]?.id;
}

export async function resolveFavoriteUserId(user: CurrentUser) {
  const existingUserId = await findUserIdByEmail(user.email);

  if (existingUserId) {
    return existingUserId;
  }

  await getDb()
    .insert(usersTable)
    .values({
      name: user.name,
      email: user.email,
      passwordHash: "session-managed-user",
      role: user.role
    })
    .onConflictDoNothing();

  const insertedUserId = await findUserIdByEmail(user.email);

  if (!insertedUserId) {
    throw new Error("Could not resolve the current user for favorites.");
  }

  return insertedUserId;
}

async function findRecipeIdBySlug(slug: string) {
  const rows = await getDb()
    .select({ id: recipesTable.id })
    .from(recipesTable)
    .where(eq(recipesTable.slug, slug))
    .limit(1);

  return rows[0]?.id;
}

export async function addFavoriteRecipeForUser(user: CurrentUser, recipeSlug: string) {
  const [userId, recipeId] = await Promise.all([
    resolveFavoriteUserId(user),
    findRecipeIdBySlug(recipeSlug)
  ]);

  if (!recipeId) {
    throw new Error("Recipe is not available in the database.");
  }

  await getDb()
    .insert(favoritesTable)
    .values({
      userId,
      recipeId
    })
    .onConflictDoNothing();
}

export async function removeFavoriteRecipeForUser(user: CurrentUser, recipeSlug: string) {
  const [userId, recipeId] = await Promise.all([
    resolveFavoriteUserId(user),
    findRecipeIdBySlug(recipeSlug)
  ]);

  if (!recipeId) {
    return;
  }

  await getDb()
    .delete(favoritesTable)
    .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, recipeId)));
}

export async function isFavoriteRecipeForUser(user: CurrentUser, recipeSlug: string) {
  const [userId, recipeId] = await Promise.all([
    resolveFavoriteUserId(user),
    findRecipeIdBySlug(recipeSlug)
  ]);

  if (!recipeId) {
    return false;
  }

  const rows = await getDb()
    .select({ recipeId: favoritesTable.recipeId })
    .from(favoritesTable)
    .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, recipeId)))
    .limit(1);

  return Boolean(rows[0]);
}

export async function listFavoriteRecipeSlugsForUser(user: CurrentUser) {
  const userId = await resolveFavoriteUserId(user);
  const rows = await getDb()
    .select({ slug: recipesTable.slug })
    .from(favoritesTable)
    .innerJoin(recipesTable, eq(favoritesTable.recipeId, recipesTable.id))
    .where(eq(favoritesTable.userId, userId))
    .orderBy(asc(recipesTable.title));

  return rows.map((row) => row.slug);
}

export async function listFavoriteRecipesForUser(user: CurrentUser) {
  const userId = await resolveFavoriteUserId(user);
  const rows = await getDb()
    .select({
      title: recipesTable.title,
      slug: recipesTable.slug,
      description: recipesTable.description,
      prepTimeMinutes: recipesTable.prepTimeMinutes,
      cookTimeMinutes: recipesTable.cookTimeMinutes,
      servings: recipesTable.servings,
      difficulty: recipesTable.difficulty,
      category: categoriesTable.name
    })
    .from(favoritesTable)
    .innerJoin(recipesTable, eq(favoritesTable.recipeId, recipesTable.id))
    .innerJoin(categoriesTable, eq(recipesTable.categoryId, categoriesTable.id))
    .where(eq(favoritesTable.userId, userId))
    .orderBy(asc(recipesTable.title));

  return rows.map(mapFavoriteRecipe);
}
