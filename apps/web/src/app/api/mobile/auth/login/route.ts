import { NextResponse } from "next/server";
import {
  verifyDemoUser,
  verifyRegisteredUser
} from "../../../../../server/auth/session";
import { jsonError, readJsonBody } from "../../../../../server/mobile/http";
import { signMobileToken, toMobileApiUser } from "../../../../../server/mobile/auth";

function getStringField(body: Record<string, unknown>, field: string) {
  const value = body[field];

  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);

  if (!body) {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const email = getStringField(body, "email");
  const password = getStringField(body, "password");

  if (!email || !password) {
    return jsonError("Email and password are required.", 400);
  }

  try {
    const currentUser = verifyDemoUser(email, password) ?? (await verifyRegisteredUser(email, password));

    if (!currentUser) {
      return jsonError("Invalid email or password.", 401);
    }

    const user = await toMobileApiUser(currentUser);
    const token = signMobileToken(user);

    return NextResponse.json({ token, user });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Login failed.", 500);
  }
}
