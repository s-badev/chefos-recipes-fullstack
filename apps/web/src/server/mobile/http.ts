import { NextResponse } from "next/server";
import { verifyMobileToken } from "./auth";

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function readJsonBody(request: Request) {
  try {
    const body = await request.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return undefined;
    }

    return body as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

export function requireMobileApiUser(request: Request) {
  let user;

  try {
    user = verifyMobileToken(request);
  } catch (error) {
    return {
      response: jsonError(
        error instanceof Error ? error.message : "Mobile authentication could not be verified.",
        500
      )
    };
  }

  if (!user) {
    return {
      response: jsonError("Missing or invalid mobile authentication token.", 401)
    };
  }

  return { user };
}
