export type UserRole = "user" | "admin";

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  difficulty: DifficultyLevel;
  prepMinutes?: number;
  cookMinutes?: number;
  servings?: number;
  authorId?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeStep {
  id: string;
  recipeId: string;
  instruction: string;
  sortOrder?: number;
}

export interface Favorite {
  userId: string;
  recipeId: string;
}
