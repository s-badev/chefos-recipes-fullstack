import { NextResponse } from "next/server";
import { getRecipeBySlug } from "../../../../server/recipes/service";

type RecipeBySlugRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RecipeBySlugRouteContext) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    return NextResponse.json(
      {
        error: "Рецептата не е намерена"
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: recipe
  });
}
