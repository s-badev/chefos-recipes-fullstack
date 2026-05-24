import { NextResponse } from "next/server";
import { verifyMobileToken } from "./auth";
import { createCorsOptionsResponse, withCors } from "./cors";

export function jsonResponse(request: Request, data: unknown, init?: ResponseInit) {
  const response = NextResponse.json(data, init);

  return withCors(request, response);
}

export function jsonError(request: Request, error: string, status: number) {
  return jsonResponse(request, { error }, { status });
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
        request,
        error instanceof Error ? error.message : "Mobile authentication could not be verified.",
        500
      )
    };
  }

  if (!user) {
    return {
      response: jsonError(request, "Missing or invalid mobile authentication token.", 401)
    };
  }

  return { user };
}

export function optionsResponse(request: Request) {
  return createCorsOptionsResponse(request);
}
