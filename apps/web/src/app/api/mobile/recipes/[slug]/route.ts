import { jsonError, jsonResponse, optionsResponse } from "../../../../../server/mobile/http";
import { getMobileRecipeBySlug } from "../../../../../server/mobile/recipes";

type MobileRecipeBySlugContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, { params }: MobileRecipeBySlugContext) {
  const { slug } = await params;

  try {
    const recipe = await getMobileRecipeBySlug(slug);

    if (!recipe) {
      return jsonError(request, "Recipe was not found.", 404);
    }

    return jsonResponse(request, recipe);
  } catch {
    return jsonError(request, "Recipe could not be loaded.", 500);
  }
}

export async function OPTIONS(request: Request) {
  return optionsResponse(request);
}
