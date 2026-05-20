import { NextResponse } from "next/server";
import { listRecipes } from "../../../server/recipes/service";

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
