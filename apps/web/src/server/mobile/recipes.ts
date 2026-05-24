import {
  and,
  asc,
  categories as categoriesTable,
  count,
  desc,
  eq,
  getDb,
  ilike,
  inArray,
  or,
  recipeSteps as recipeStepsTable,
  recipeTags as recipeTagsTable,
  recipes as recipesTable,
  tags as tagsTable,
  type SQL
} from "@chefos/db";
import {
  findRecipeBySlug as findStaticRecipeBySlug,
  type Recipe
} from "../../data/recipes";

export type MobileRecipeSummary = {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string | null;
  category: string;
  difficulty: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  tags: string[];
};

export type MobileRecipeDetail = MobileRecipeSummary & {
  ingredients: string[];
  steps: string[];
};

export type MobileRecipeListParams = {
  page: number;
  pageSize: number;
  category?: string;
  search?: string;
};

type MobileRecipeRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
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

  const rows = await getDb()
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

  const rows = await getDb()
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

function getWhereClause(params: Pick<MobileRecipeListParams, "category" | "search">) {
  const filters: SQL[] = [];

  if (params.category) {
    filters.push(eq(categoriesTable.name, params.category));
  }

  if (params.search) {
    const searchPattern = `%${params.search}%`;
    const searchFilter = or(
      ilike(recipesTable.title, searchPattern),
      ilike(recipesTable.description, searchPattern),
      ilike(categoriesTable.name, searchPattern)
    );

    if (searchFilter) {
      filters.push(searchFilter);
    }
  }

  return filters.length > 0 ? and(...filters) : undefined;
}

function rowToMobileRecipeSummary(
  row: MobileRecipeRow,
  tags: string[]
): MobileRecipeSummary {
  const staticRecipe = findStaticRecipeBySlug(row.slug);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? "",
    imageUrl: row.imageUrl ?? staticRecipe?.imageSrc ?? null,
    imageAlt: row.imageAlt ?? staticRecipe?.imageAlt ?? null,
    category: row.category,
    difficulty: formatDifficulty(row.difficulty),
    prepTimeMinutes: row.prepTimeMinutes ?? 0,
    cookTimeMinutes: row.cookTimeMinutes ?? 0,
    servings: row.servings ?? 0,
    tags
  };
}

function staticRecipeToMobileRecipe(recipe: Recipe): MobileRecipeDetail {
  return {
    id: recipe.slug,
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description,
    imageUrl: recipe.imageSrc ?? null,
    imageAlt: recipe.imageAlt ?? null,
    category: recipe.category,
    difficulty: recipe.difficulty,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    tags: recipe.tags,
    ingredients: recipe.ingredients,
    steps: recipe.steps
  };
}

export function recipeToMobileSummary(recipe: Recipe): MobileRecipeSummary {
  const detail = staticRecipeToMobileRecipe(recipe);

  return {
    id: detail.id,
    title: detail.title,
    slug: detail.slug,
    description: detail.description,
    imageUrl: detail.imageUrl,
    imageAlt: detail.imageAlt,
    category: detail.category,
    difficulty: detail.difficulty,
    prepTimeMinutes: detail.prepTimeMinutes,
    cookTimeMinutes: detail.cookTimeMinutes,
    servings: detail.servings,
    tags: detail.tags
  };
}

export async function listMobileCategories() {
  const rows = await getDb()
    .select({
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      recipeCount: count(recipesTable.id)
    })
    .from(categoriesTable)
    .leftJoin(recipesTable, eq(recipesTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id, categoriesTable.name, categoriesTable.slug)
    .orderBy(asc(categoriesTable.name));

  return rows.map((row) => ({
    name: row.name,
    slug: row.slug,
    recipeCount: Number(row.recipeCount)
  }));
}

export async function listMobileRecipes(params: MobileRecipeListParams) {
  const whereClause = getWhereClause(params);
  const offset = (params.page - 1) * params.pageSize;
  const db = getDb();
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: recipesTable.id,
        title: recipesTable.title,
        slug: recipesTable.slug,
        description: recipesTable.description,
        imageUrl: recipesTable.imageUrl,
        imageAlt: recipesTable.imageAlt,
        prepTimeMinutes: recipesTable.prepTimeMinutes,
        cookTimeMinutes: recipesTable.cookTimeMinutes,
        servings: recipesTable.servings,
        difficulty: recipesTable.difficulty,
        category: categoriesTable.name
      })
      .from(recipesTable)
      .innerJoin(categoriesTable, eq(recipesTable.categoryId, categoriesTable.id))
      .where(whereClause)
      .orderBy(desc(recipesTable.createdAt), asc(recipesTable.title))
      .limit(params.pageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(recipesTable)
      .innerJoin(categoriesTable, eq(recipesTable.categoryId, categoriesTable.id))
      .where(whereClause)
  ]);
  const recipeIds = rows.map((recipe) => recipe.id);
  const tagsByRecipeId = await getRecipeTags(recipeIds);
  const total = Number(totalRows[0]?.value ?? 0);

  return {
    items: rows.map((row) => rowToMobileRecipeSummary(row, tagsByRecipeId.get(row.id) ?? [])),
    total
  };
}

export async function getMobileRecipeBySlug(slug: string): Promise<MobileRecipeDetail | undefined> {
  const rows = await getDb()
    .select({
      id: recipesTable.id,
      title: recipesTable.title,
      slug: recipesTable.slug,
      description: recipesTable.description,
      imageUrl: recipesTable.imageUrl,
      imageAlt: recipesTable.imageAlt,
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
  const row = rows[0];

  if (!row) {
    const staticRecipe = findStaticRecipeBySlug(slug);

    return staticRecipe ? staticRecipeToMobileRecipe(staticRecipe) : undefined;
  }

  const [tagsByRecipeId, stepsByRecipeId] = await Promise.all([
    getRecipeTags([row.id]),
    getRecipeSteps([row.id])
  ]);
  const staticRecipe = findStaticRecipeBySlug(row.slug);
  const summary = rowToMobileRecipeSummary(row, tagsByRecipeId.get(row.id) ?? []);

  return {
    ...summary,
    ingredients: staticRecipe?.ingredients ?? [],
    steps: stepsByRecipeId.get(row.id) ?? staticRecipe?.steps ?? []
  };
}
