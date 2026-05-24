import { NextResponse } from "next/server";
import { jsonError } from "../../../../../server/mobile/http";
import { getMobileRecipeBySlug } from "../../../../../server/mobile/recipes";

type MobileRecipeBySlugContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: MobileRecipeBySlugContext) {
  const { slug } = await params;

  try {
    const recipe = await getMobileRecipeBySlug(slug);

    if (!recipe) {
      return jsonError("Recipe was not found.", 404);
    }

    return NextResponse.json(recipe);
  } catch {
    return jsonError("Recipe could not be loaded.", 500);
  }
}
