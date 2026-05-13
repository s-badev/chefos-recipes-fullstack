import { NextResponse } from "next/server";
import { listRecipes } from "../../../server/recipes/service";

function parseOptionalNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recipePage = listRecipes({
    page: parseOptionalNumber(searchParams.get("page")),
    pageSize: parseOptionalNumber(searchParams.get("pageSize"))
  });

  return NextResponse.json({
    data: recipePage.items,
    meta: {
      count: recipePage.items.length,
      total: recipePage.total,
      page: recipePage.page,
      pageSize: recipePage.pageSize,
      totalPages: recipePage.totalPages,
      source: "static-sample-data"
    }
  });
}
