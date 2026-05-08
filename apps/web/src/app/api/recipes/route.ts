import { NextResponse } from "next/server";
import { recipes } from "../../catalog/recipes";

export function GET() {
  return NextResponse.json({
    data: recipes,
    meta: {
      count: recipes.length,
      source: "static-sample-data"
    }
  });
}
