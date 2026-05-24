import { NextResponse } from "next/server";
import { createRegisteredUser } from "../../../../../server/auth/session";
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

  const name = getStringField(body, "name");
  const email = getStringField(body, "email");
  const password = getStringField(body, "password");

  if (!name || !email || !password) {
    return jsonError("Name, email and password are required.", 400);
  }

  try {
    const result = await createRegisteredUser({ name, email, password });

    if ("error" in result) {
      if (result.error === "exists") {
        return jsonError("A user with this email already exists.", 409);
      }

      if (result.error === "invalid") {
        return jsonError("Name, a valid email and a password with at least 8 characters are required.", 400);
      }

      return jsonError("User could not be created.", 500);
    }

    const user = await toMobileApiUser(result.user);
    const token = signMobileToken(user);

    return NextResponse.json({ token, user }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "User could not be created.", 500);
  }
}
