import {
  findCategories,
  findFavoriteRecipes,
  findRecipeBySlug,
  findRecipes,
  getAdminSummary
} from "./repository";

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const DEFAULT_PAGE = 1;

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  if (!value || !Number.isFinite(value) || value < 1) {
    return fallback;
  }

  return Math.floor(value);
}

export function listRecipes(params: PaginationParams = {}) {
  const total = findRecipes({ offset: 0, limit: Number.MAX_SAFE_INTEGER }).total;
  const page = normalizePositiveInteger(params.page, DEFAULT_PAGE);
  const pageSize = normalizePositiveInteger(params.pageSize, Math.max(total, 1));
  const offset = (page - 1) * pageSize;
  const result = findRecipes({ offset, limit: pageSize });

  return {
    items: result.items,
    total: result.total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(result.total / pageSize))
  } satisfies PaginatedResult<(typeof result.items)[number]>;
}

export function getRecipeBySlug(slug: string) {
  return findRecipeBySlug(slug);
}

export function listCategories() {
  return findCategories();
}

export function listFavoriteRecipes() {
  return findFavoriteRecipes(3);
}

export function getAdminRecipeSummary() {
  return getAdminSummary();
}
