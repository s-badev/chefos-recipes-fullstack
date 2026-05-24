import { NextResponse } from "next/server";
import { requireMobileApiUser } from "../../../../../server/mobile/http";

export async function GET(request: Request) {
  const auth = requireMobileApiUser(request);

  if (auth.response) {
    return auth.response;
  }

  return NextResponse.json({ user: auth.user });
}
