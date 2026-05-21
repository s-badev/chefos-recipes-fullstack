import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../server/auth/session";
import { getAdminRecipeSummary } from "../../../../server/recipes/service";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходим е вход." }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Нямаш достъп до тази страница." }, { status: 403 });
  }

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
