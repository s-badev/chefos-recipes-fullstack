import { NextResponse } from "next/server";
import { getAllRecipes } from "../../../data/recipes";

export function GET() {
  const recipes = getAllRecipes();

  return NextResponse.json({
    data: recipes,
    meta: {
      count: recipes.length,
      source: "static-sample-data"
    }
  });
}
