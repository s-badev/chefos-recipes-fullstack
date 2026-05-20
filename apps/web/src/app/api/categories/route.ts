import { NextResponse } from "next/server";
import { listCategories } from "../../../server/recipes/service";

export async function GET() {
  try {
    const categories = await listCategories();

    return NextResponse.json({
      data: categories,
      meta: {
        count: categories.length,
        source: "database"
      }
    });
  } catch {
    return NextResponse.json(
      {
        error: "Категориите не могат да бъдат заредени в момента"
      },
      { status: 500 }
    );
  }
}
