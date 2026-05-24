import { NextResponse } from "next/server";
import { removeFavoriteRecipeForUser } from "../../../../../server/favorites/repository";
import { jsonError, requireMobileApiUser } from "../../../../../server/mobile/http";

type MobileFavoriteBySlugContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function DELETE(_request: Request, { params }: MobileFavoriteBySlugContext) {
  const auth = requireMobileApiUser(_request);

  if (auth.response) {
    return auth.response;
  }

  const { slug } = await params;

  if (!slug) {
    return jsonError("Recipe slug is required.", 400);
  }

  try {
    await removeFavoriteRecipeForUser(auth.user, slug);

    return NextResponse.json({
      ok: true,
      favorite: false,
      slug
    });
  } catch {
    return jsonError("Favorite could not be removed.", 500);
  }
}
