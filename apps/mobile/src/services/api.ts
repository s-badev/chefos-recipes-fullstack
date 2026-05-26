import type {
  AuthResponse,
  MobileUser,
  PaginatedRecipes,
  RecipeCategory,
  RecipeDetails,
  RecipeSummary
} from "../types";

const DEFAULT_API_BASE_URL = "http://192.168.1.17:3000";
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");

type RequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: Record<string, unknown>;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(`${API_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function normalizeImageUrl(imageUrl: string | null) {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return `${API_BASE_URL}/${imageUrl}`;
}

function normalizeRecipeSummary(recipe: RecipeSummary): RecipeSummary {
  return {
    ...recipe,
    imageUrl: normalizeImageUrl(recipe.imageUrl)
  };
}

async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch {
    throw new ApiError("Няма връзка със сървъра. Провери API адреса и опитай отново.", 0);
  }

  const data = await response.json().catch(() => undefined);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : "Заявката не беше успешна.";

    throw new ApiError(message, response.status);
  }

  return data as T;
}

export async function getHealth() {
  return requestJson<{ ok: boolean; app: string }>("/api/mobile/health");
}

export async function getCategories() {
  const data = await requestJson<{ items: RecipeCategory[] }>("/api/mobile/categories");

  return data.items;
}

export async function getRecipes(params: {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}) {
  const data = await requestJson<PaginatedRecipes>(
    buildUrl("/api/mobile/recipes", {
      page: params.page,
      pageSize: params.pageSize,
      category: params.category,
      search: params.search
    }).replace(API_BASE_URL, "")
  );

  return {
    ...data,
    items: data.items.map(normalizeRecipeSummary)
  };
}

export async function getRecipeBySlug(slug: string) {
  const recipe = await requestJson<RecipeDetails>(`/api/mobile/recipes/${encodeURIComponent(slug)}`);

  return {
    ...recipe,
    imageUrl: normalizeImageUrl(recipe.imageUrl)
  };
}

export async function loginUser(input: { email: string; password: string }) {
  return requestJson<AuthResponse>("/api/mobile/auth/login", {
    method: "POST",
    body: input
  });
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  return requestJson<AuthResponse>("/api/mobile/auth/register", {
    method: "POST",
    body: input
  });
}

export async function getCurrentUser(token: string) {
  const data = await requestJson<{ user: MobileUser }>("/api/mobile/auth/me", { token });

  return data.user;
}

export async function getFavorites(token: string) {
  const data = await requestJson<{ items: RecipeSummary[] }>("/api/mobile/favorites", { token });

  return data.items.map(normalizeRecipeSummary);
}

export async function addFavorite(token: string, slug: string) {
  return requestJson<{ ok: boolean; favorite: true; slug: string }>("/api/mobile/favorites", {
    method: "POST",
    token,
    body: { slug }
  });
}

export async function removeFavorite(token: string, slug: string) {
  return requestJson<{ ok: boolean; favorite: false; slug: string }>(
    `/api/mobile/favorites/${encodeURIComponent(slug)}`,
    {
      method: "DELETE",
      token
    }
  );
}
