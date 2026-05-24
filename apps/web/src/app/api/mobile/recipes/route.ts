import { NextResponse } from "next/server";
import { jsonError } from "../../../../server/mobile/http";
import { listMobileRecipes } from "../../../../server/mobile/recipes";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parsePositiveInteger(searchParams.get("page"), DEFAULT_PAGE);
  const pageSize = Math.min(
    parsePositiveInteger(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );
  const category = searchParams.get("category")?.trim() || undefined;
  const search = searchParams.get("search")?.trim() || undefined;

  try {
    const recipePage = await listMobileRecipes({
      page,
      pageSize,
      category,
      search
    });
    const totalPages = Math.max(1, Math.ceil(recipePage.total / pageSize));

    return NextResponse.json({
      items: recipePage.items,
      page,
      pageSize,
      total: recipePage.total,
      totalPages
    });
  } catch {
    return jsonError("Recipes could not be loaded.", 500);
  }
}
