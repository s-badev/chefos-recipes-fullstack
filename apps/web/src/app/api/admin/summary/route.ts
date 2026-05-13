import { NextResponse } from "next/server";
import { getAdminRecipeSummary } from "../../../../server/recipes/service";

export function GET() {
  const summary = getAdminRecipeSummary();

  return NextResponse.json({
    data: summary,
    message: "Placeholder админ статистика. Реалните данни ще идват от база данни."
  });
}
