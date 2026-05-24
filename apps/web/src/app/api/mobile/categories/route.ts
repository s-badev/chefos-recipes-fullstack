import { NextResponse } from "next/server";
import { jsonError } from "../../../../server/mobile/http";
import { listMobileCategories } from "../../../../server/mobile/recipes";

export async function GET() {
  try {
    const categories = await listMobileCategories();

    return NextResponse.json({ items: categories });
  } catch {
    return jsonError("Categories could not be loaded.", 500);
  }
}
