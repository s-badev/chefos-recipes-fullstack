import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../server/auth/session";
import { createRecipe, listRecipes } from "../../../server/recipes/service";

function parseOptionalNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const recipePage = await listRecipes({
      page: parseOptionalNumber(searchParams.get("page")),
      pageSize: parseOptionalNumber(searchParams.get("pageSize"))
    });

    return NextResponse.json({
      items: recipePage.items,
      data: recipePage.items,
      total: recipePage.total,
      page: recipePage.page,
      pageSize: recipePage.pageSize,
      totalPages: recipePage.totalPages,
      meta: {
        count: recipePage.items.length,
        total: recipePage.total,
        page: recipePage.page,
        pageSize: recipePage.pageSize,
        totalPages: recipePage.totalPages,
        source: "database"
      }
    });
  } catch {
    return NextResponse.json(
      {
        error: "Рецептите не могат да бъдат заредени в момента"
      },
      { status: 500 }
    );
  }
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

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходим е вход." }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Нямаш достъп до тази страница." }, { status: 403 });
  }

  try {
    const formData = await getRecipeMutationFormData(request);
    const recipe = await createRecipe(formData, user.email);

    return NextResponse.json({ data: recipe }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Рецептата не може да бъде създадена в момента." },
      { status: 500 }
    );
  }
}
