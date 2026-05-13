import { recipes, type Recipe, type RecipeCategory } from "../../data/recipes";

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
};

export function findRecipes({ offset, limit }: RecipePageQuery): RecipePage {
  // Later this maps directly to Drizzle `.limit(limit).offset(offset)` queries.
  return {
    items: recipes.slice(offset, offset + limit),
    total: recipes.length
  };
}

export function findRecipeBySlug(slug: string) {
  return recipes.find((recipe) => recipe.slug === slug);
}

export function findCategories(): RecipeCategory[] {
  return Array.from(new Set(recipes.map((recipe) => recipe.category))).map((category) => ({
    name: category,
    recipeCount: recipes.filter((recipe) => recipe.category === category).length
  }));
}

export function findFavoriteRecipes(limit = 3) {
  return recipes.slice(0, limit);
}

export function getAdminSummary(): AdminRecipeSummary {
  const categories = findCategories();
  const tags = Array.from(new Set(recipes.flatMap((recipe) => recipe.tags)));

  return {
    totalRecipes: recipes.length,
    totalCategories: categories.length,
    totalTags: tags.length
  };
}
