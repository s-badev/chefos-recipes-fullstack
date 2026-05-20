import { NextResponse } from "next/server";
import { getAdminRecipeSummary } from "../../../../server/recipes/service";

export async function GET() {
  try {
    const summary = await getAdminRecipeSummary();

    return NextResponse.json({
      data: summary
    });
  } catch {
    return NextResponse.json(
      {
        error: "Админ статистиката не може да бъде заредена в момента"
      },
      { status: 500 }
    );
  }
}
