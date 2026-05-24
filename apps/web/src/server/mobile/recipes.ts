import { findRecipeBySlug, getAllRecipes, type Recipe } from "../../data/recipes";

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

type MobileCategory = {
  name: string;
  slug: string;
  recipeCount: number;
};

const CATEGORY_ORDER = ["Салати", "Тестени", "Основни", "Супи", "Бързи ястия", "Десерти"];

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("bg-BG");
}

function slugifyCategory(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("bg-BG")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "");
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

export async function listMobileCategories(): Promise<MobileCategory[]> {
  const recipes = getAllRecipes();
  const counts = recipes.reduce<Record<string, number>>((acc, recipe) => {
    acc[recipe.category] = (acc[recipe.category] ?? 0) + 1;
    return acc;
  }, {});

  return CATEGORY_ORDER.filter((category) => counts[category]).map((category) => ({
    name: category,
    slug: slugifyCategory(category),
    recipeCount: counts[category] ?? 0
  }));
}

export async function listMobileRecipes(params: MobileRecipeListParams) {
  const recipes = getAllRecipes();
  const searchTerm = params.search ? normalizeText(params.search) : "";

  const filtered = recipes.filter((recipe) => {
    if (params.category && recipe.category !== params.category) {
      return false;
    }

    if (!searchTerm) {
      return true;
    }

    const searchableText = normalizeText(
      [recipe.title, recipe.description, recipe.category, ...recipe.tags].join(" ")
    );

    return searchableText.includes(searchTerm);
  });

  const total = filtered.length;
  const offset = (params.page - 1) * params.pageSize;
  const items = filtered.slice(offset, offset + params.pageSize).map(recipeToMobileSummary);

  return {
    items,
    total
  };
}

export async function getMobileRecipeBySlug(slug: string): Promise<MobileRecipeDetail | undefined> {
  const staticRecipe = findRecipeBySlug(slug);

  return staticRecipe ? staticRecipeToMobileRecipe(staticRecipe) : undefined;
}
