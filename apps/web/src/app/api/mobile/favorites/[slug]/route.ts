import { removeFavoriteRecipeForUser } from "../../../../../server/favorites/repository";
import { jsonError, jsonResponse, optionsResponse, requireMobileApiUser } from "../../../../../server/mobile/http";

type MobileFavoriteBySlugContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function DELETE(request: Request, { params }: MobileFavoriteBySlugContext) {
  const auth = requireMobileApiUser(request);

  if (auth.response) {
    return auth.response;
  }

  const { slug } = await params;

  if (!slug) {
    return jsonError(request, "Recipe slug is required.", 400);
  }

  try {
    await removeFavoriteRecipeForUser(auth.user, slug);

    return jsonResponse(request, {
      ok: true,
      favorite: false,
      slug
    });
  } catch {
    return jsonError(request, "Favorite could not be removed.", 500);
  }
}

export async function OPTIONS(request: Request) {
  return optionsResponse(request);
}
