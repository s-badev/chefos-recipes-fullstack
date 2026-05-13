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
const DEFAULT_PAGE_SIZE = 6;
const MAX_PAGE_SIZE = 50;

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  if (!value || !Number.isFinite(value) || value < 1) {
    return fallback;
  }

  return Math.floor(value);
}

export function listRecipes(params: PaginationParams = {}) {
  const page = normalizePositiveInteger(params.page, DEFAULT_PAGE);
  const requestedPageSize = normalizePositiveInteger(params.pageSize, DEFAULT_PAGE_SIZE);
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
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
