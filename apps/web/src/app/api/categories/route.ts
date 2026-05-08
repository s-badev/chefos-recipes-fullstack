import { NextResponse } from "next/server";
import { getCategories } from "../../../data/recipes";

export function GET() {
  const categories = getCategories();

  return NextResponse.json({
    data: categories,
    meta: {
      count: categories.length,
      source: "static-sample-data"
    }
  });
}
