import { NextResponse } from "next/server";
import { listCategories } from "../../../server/recipes/service";

export function GET() {
  const categories = listCategories();

  return NextResponse.json({
    data: categories,
    meta: {
      count: categories.length,
      source: "static-sample-data"
    }
  });
}
