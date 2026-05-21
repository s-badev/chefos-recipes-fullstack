import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../server/auth/session";
import {
  deleteRecipeBySlug,
  getRecipeBySlug,
  updateRecipeBySlug
} from "../../../../server/recipes/service";

type RecipeBySlugRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RecipeBySlugRouteContext) {
  const { slug } = await params;

  try {
    const recipe = await getRecipeBySlug(slug);

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
  } catch {
    return NextResponse.json(
      {
        error: "Рецептата не може да бъде заредена в момента"
      },
      { status: 500 }
    );
  }
}

async function requireAdminApiUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: NextResponse.json({ error: "Необходим е вход." }, { status: 401 })
    };
  }

  if (user.role !== "admin") {
    return {
      response: NextResponse.json({ error: "Нямаш достъп до тази страница." }, { status: 403 })
    };
  }

  return { user };
}

async function getRecipeMutationFormData(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return request.formData();
  }

  const body = await request.json();
  const formData = new FormData();

  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== null) {
      formData.set(key, String(value));
    }
  }

  return formData;
}

export async function PATCH(request: Request, { params }: RecipeBySlugRouteContext) {
  const auth = await requireAdminApiUser();

  if (auth.response) {
    return auth.response;
  }

  const { slug } = await params;

  try {
    const formData = await getRecipeMutationFormData(request);
    const recipe = await updateRecipeBySlug(slug, formData);

    return NextResponse.json({ data: recipe });
  } catch {
    return NextResponse.json(
      { error: "Рецептата не може да бъде редактирана в момента." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RecipeBySlugRouteContext) {
  return PATCH(request, context);
}

export async function DELETE(_request: Request, { params }: RecipeBySlugRouteContext) {
  const auth = await requireAdminApiUser();

  if (auth.response) {
    return auth.response;
  }

  const { slug } = await params;

  try {
    await deleteRecipeBySlug(slug);

    return NextResponse.json({ data: { slug } });
  } catch {
    return NextResponse.json(
      { error: "Рецептата не може да бъде изтрита в момента." },
      { status: 500 }
    );
  }
}
