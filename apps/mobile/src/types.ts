export type UserRole = "user" | "admin";

export type MobileUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type RecipeSummary = {
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

export type RecipeDetails = RecipeSummary & {
  ingredients: string[];
  steps: string[];
};

export type RecipeCategory = {
  name: string;
  slug: string;
  recipeCount: number;
};

export type PaginatedRecipes = {
  items: RecipeSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AuthResponse = {
  token: string;
  user: MobileUser;
};
