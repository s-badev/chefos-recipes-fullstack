import {
  categories as categoriesTable,
  favorites as favoritesTable,
  getDb,
  recipeSteps as recipeStepsTable,
  recipeTags as recipeTagsTable,
  recipes as recipesTable,
  tags as tagsTable,
  users as usersTable,
  asc,
  count,
  desc,
  eq,
  inArray
} from "@chefos/db";

import { recipes as sampleRecipes, type Recipe, type RecipeCategory } from "../../data/recipes";

export type RecipePageQuery = {
  offset: number;
  limit: number;
};

export type RecipePage = {
  items: Recipe[];
  total: number;
};

export type AdminRecipeSummary = {
  totalRecipes: number;
  totalCategories: number;
  totalTags: number;
  totalUsers: number;
};

type RecipeListRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number | null;
  difficulty: string;
  category: string;
};

export type RecipeMutationInput = {
  title: string;
  category: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
};

const FALLBACK_ADMIN_EMAIL = "admin@example.com";

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

function mapRecipeRow(
  row: RecipeListRow,
  tagsByRecipeId: Map<string, string[]>,
  stepsByRecipeId: Map<string, string[]>
): Recipe {
  return {
    title: row.title,
    slug: row.slug,
    description: row.description ?? "",
    prepTimeMinutes: row.prepTimeMinutes ?? 0,
    cookTimeMinutes: row.cookTimeMinutes ?? 0,
    servings: row.servings ?? 0,
    difficulty: formatDifficulty(row.difficulty),
    category: row.category,
    tags: tagsByRecipeId.get(row.id) ?? [],
    ingredients: [],
    steps: stepsByRecipeId.get(row.id) ?? []
  };
}

function addGroupedValue(map: Map<string, string[]>, key: string, value: string) {
  const values = map.get(key) ?? [];

  values.push(value);
  map.set(key, values);
}

async function getRecipeTags(recipeIds: string[]) {
  const tagsByRecipeId = new Map<string, string[]>();

  if (recipeIds.length === 0) {
    return tagsByRecipeId;
  }

  const db = getDb();
  const rows = await db
    .select({
      recipeId: recipeTagsTable.recipeId,
      tagName: tagsTable.name
    })
    .from(recipeTagsTable)
    .innerJoin(tagsTable, eq(recipeTagsTable.tagId, tagsTable.id))
    .where(inArray(recipeTagsTable.recipeId, recipeIds))
    .orderBy(asc(recipeTagsTable.recipeId), asc(tagsTable.name));

  for (const row of rows) {
    addGroupedValue(tagsByRecipeId, row.recipeId, row.tagName);
  }

  return tagsByRecipeId;
}

async function getRecipeSteps(recipeIds: string[]) {
  const stepsByRecipeId = new Map<string, string[]>();

  if (recipeIds.length === 0) {
    return stepsByRecipeId;
  }

  const db = getDb();
  const rows = await db
    .select({
      recipeId: recipeStepsTable.recipeId,
      instruction: recipeStepsTable.instruction
    })
    .from(recipeStepsTable)
    .where(inArray(recipeStepsTable.recipeId, recipeIds))
    .orderBy(asc(recipeStepsTable.recipeId), asc(recipeStepsTable.stepNumber));

  for (const row of rows) {
    addGroupedValue(stepsByRecipeId, row.recipeId, row.instruction);
  }

  return stepsByRecipeId;
}

export async function findRecipes({ offset, limit }: RecipePageQuery): Promise<RecipePage> {
  const db = getDb();
  const [items, totalRows] = await Promise.all([
    db
      .select({
        id: recipesTable.id,
        title: recipesTable.title,
        slug: recipesTable.slug,
        description: recipesTable.description,
        prepTimeMinutes: recipesTable.prepTimeMinutes,
        cookTimeMinutes: recipesTable.cookTimeMinutes,
        servings: recipesTable.servings,
        difficulty: recipesTable.difficulty,
        category: categoriesTable.name
      })
      .from(recipesTable)
      .innerJoin(categoriesTable, eq(recipesTable.categoryId, categoriesTable.id))
      .orderBy(desc(recipesTable.createdAt), asc(recipesTable.title))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(recipesTable)
  ]);

  const recipeIds = items.map((recipe) => recipe.id);
  const [tagsByRecipeId, stepsByRecipeId] = await Promise.all([
    getRecipeTags(recipeIds),
    getRecipeSteps(recipeIds)
  ]);

  return {
    items: items.map((recipe) => mapRecipeRow(recipe, tagsByRecipeId, stepsByRecipeId)),
    total: Number(totalRows[0]?.value ?? 0)
  };
}

export async function findRecipeBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: recipesTable.id,
      title: recipesTable.title,
      slug: recipesTable.slug,
      description: recipesTable.description,
      prepTimeMinutes: recipesTable.prepTimeMinutes,
      cookTimeMinutes: recipesTable.cookTimeMinutes,
      servings: recipesTable.servings,
      difficulty: recipesTable.difficulty,
      category: categoriesTable.name
    })
    .from(recipesTable)
    .innerJoin(categoriesTable, eq(recipesTable.categoryId, categoriesTable.id))
    .where(eq(recipesTable.slug, slug))
    .limit(1);

  const recipe = rows[0];

  if (!recipe) {
    return undefined;
  }

  const [tagsByRecipeId, stepsByRecipeId] = await Promise.all([
    getRecipeTags([recipe.id]),
    getRecipeSteps([recipe.id])
  ]);

  return mapRecipeRow(recipe, tagsByRecipeId, stepsByRecipeId);
}

export async function findCategories(): Promise<RecipeCategory[]> {
  const db = getDb();
  const rows = await db
    .select({
      name: categoriesTable.name,
      recipeCount: count(recipesTable.id)
    })
    .from(categoriesTable)
    .leftJoin(recipesTable, eq(recipesTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id, categoriesTable.name)
    .orderBy(asc(categoriesTable.name));

  return rows.map((row) => ({
    name: row.name,
    recipeCount: Number(row.recipeCount)
  }));
}

export function findFavoriteRecipes(limit = 3) {
  return sampleRecipes.slice(0, limit);
}

export async function getAdminSummary(): Promise<AdminRecipeSummary> {
  const db = getDb();
  const [recipeRows, categoryRows, tagRows, userRows] = await Promise.all([
    db.select({ value: count() }).from(recipesTable),
    db.select({ value: count() }).from(categoriesTable),
    db.select({ value: count() }).from(tagsTable),
    db.select({ value: count() }).from(usersTable)
  ]);

  return {
    totalRecipes: Number(recipeRows[0]?.value ?? 0),
    totalCategories: Number(categoryRows[0]?.value ?? 0),
    totalTags: Number(tagRows[0]?.value ?? 0),
    totalUsers: Number(userRows[0]?.value ?? 0)
  };
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLocaleLowerCase("bg-BG")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `recipe-${Date.now()}`;
}

function validateRecipeInput(input: RecipeMutationInput) {
  if (!input.title || !input.category || !input.description) {
    throw new Error("Recipe title, category, and description are required.");
  }
}

async function findOrCreateCategoryId(categoryName: string) {
  const db = getDb();
  const categorySlug = slugify(categoryName);
  const existingCategory = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, categorySlug))
    .limit(1);

  if (existingCategory[0]) {
    return existingCategory[0].id;
  }

  const insertedCategory = await db
    .insert(categoriesTable)
    .values({
      name: categoryName,
      slug: categorySlug
    })
    .returning({ id: categoriesTable.id });

  return insertedCategory[0].id;
}

async function findAuthorId(authorEmail: string) {
  const db = getDb();
  const authorRows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, authorEmail))
    .limit(1);

  if (authorRows[0]) {
    return authorRows[0].id;
  }

  const fallbackRows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, FALLBACK_ADMIN_EMAIL))
    .limit(1);

  if (fallbackRows[0]) {
    return fallbackRows[0].id;
  }

  throw new Error("Admin author is not available.");
}

async function createUniqueRecipeSlug(title: string, currentSlug?: string) {
  const db = getDb();
  const baseSlug = slugify(title);

  for (let index = 0; index < 20; index += 1) {
    const candidate = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
    const existingRows = await db
      .select({ slug: recipesTable.slug })
      .from(recipesTable)
      .where(eq(recipesTable.slug, candidate))
      .limit(1);

    if (!existingRows[0] || existingRows[0].slug === currentSlug) {
      return candidate;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

export async function createRecipeRecord(input: RecipeMutationInput, authorEmail: string) {
  validateRecipeInput(input);

  const db = getDb();
  const [categoryId, authorId, slug] = await Promise.all([
    findOrCreateCategoryId(input.category),
    findAuthorId(authorEmail),
    createUniqueRecipeSlug(input.title)
  ]);

  const insertedRows = await db
    .insert(recipesTable)
    .values({
      title: input.title,
      slug,
      description: input.description,
      prepTimeMinutes: input.prepTimeMinutes,
      cookTimeMinutes: input.cookTimeMinutes,
      servings: input.servings,
      difficulty: input.difficulty,
      categoryId,
      authorId
    })
    .returning({ slug: recipesTable.slug });

  return insertedRows[0];
}

export async function updateRecipeRecordBySlug(slug: string, input: RecipeMutationInput) {
  validateRecipeInput(input);

  const db = getDb();
  const categoryId = await findOrCreateCategoryId(input.category);
  const nextSlug = await createUniqueRecipeSlug(input.title, slug);
  const updatedRows = await db
    .update(recipesTable)
    .set({
      title: input.title,
      slug: nextSlug,
      description: input.description,
      prepTimeMinutes: input.prepTimeMinutes,
      cookTimeMinutes: input.cookTimeMinutes,
      servings: input.servings,
      difficulty: input.difficulty,
      categoryId,
      updatedAt: new Date()
    })
    .where(eq(recipesTable.slug, slug))
    .returning({ slug: recipesTable.slug });

  return updatedRows[0];
}

export async function deleteRecipeRecordBySlug(slug: string) {
  const db = getDb();
  const recipeRows = await db
    .select({ id: recipesTable.id })
    .from(recipesTable)
    .where(eq(recipesTable.slug, slug))
    .limit(1);
  const recipe = recipeRows[0];

  if (!recipe) {
    return;
  }

  await db.delete(favoritesTable).where(eq(favoritesTable.recipeId, recipe.id));
  await db.delete(recipeTagsTable).where(eq(recipeTagsTable.recipeId, recipe.id));
  await db.delete(recipeStepsTable).where(eq(recipeStepsTable.recipeId, recipe.id));
  await db.delete(recipesTable).where(eq(recipesTable.id, recipe.id));
}
