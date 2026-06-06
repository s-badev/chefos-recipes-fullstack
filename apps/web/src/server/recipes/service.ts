import {
  createRecipeRecord,
  deleteRecipeRecordBySlug,
  findCategories,
  findPublicRecipeBySlug,
  findRecipeBySlug,
  findRecipes,
  getAdminSummary,
  updateRecipeRecordBySlug
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

function normalizeSlug(value: string) {
  const trimmedValue = value.trim();

  try {
    return decodeURIComponent(trimmedValue);
  } catch {
    return trimmedValue;
  }
}

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  if (!value || !Number.isFinite(value) || value < 1) {
    return fallback;
  }

  return Math.floor(value);
}

export async function listRecipes(params: PaginationParams = {}) {
  return listRecipePage(params);
}

export async function listPublicCatalogRecipes(params: PaginationParams = {}) {
  return listRecipePage(params, { publicOnly: true });
}

async function listRecipePage(
  params: PaginationParams = {},
  options: { publicOnly?: boolean } = {}
) {
  const page = normalizePositiveInteger(params.page, DEFAULT_PAGE);
  const requestedPageSize = normalizePositiveInteger(params.pageSize, DEFAULT_PAGE_SIZE);
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  const offset = (page - 1) * pageSize;
  const result = await findRecipes({ offset, limit: pageSize, publicOnly: options.publicOnly });

  return {
    items: result.items,
    total: result.total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(result.total / pageSize))
  } satisfies PaginatedResult<(typeof result.items)[number]>;
}

export function getRecipeBySlug(slug: string) {
  return findRecipeBySlug(normalizeSlug(slug));
}

export function getPublicCatalogRecipeBySlug(slug: string) {
  return findPublicRecipeBySlug(normalizeSlug(slug));
}

export function listCategories() {
  return findCategories();
}

export function getAdminRecipeSummary() {
  return getAdminSummary();
}

export function createRecipe(formData: FormData, authorEmail: string) {
  return createRecipeRecord(parseRecipeFormData(formData), authorEmail);
}

export function updateRecipeBySlug(slug: string, formData: FormData) {
  return updateRecipeRecordBySlug(normalizeSlug(slug), parseRecipeFormData(formData));
}

export function deleteRecipeBySlug(slug: string) {
  return deleteRecipeRecordBySlug(normalizeSlug(slug));
}

function parseRecipeFormData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    prepTimeMinutes: normalizePositiveInteger(Number(formData.get("prepTime")), 0),
    cookTimeMinutes: normalizePositiveInteger(Number(formData.get("cookTime")), 0),
    servings: normalizePositiveInteger(Number(formData.get("servings")), 1),
    difficulty: "medium" as const
  };
}
