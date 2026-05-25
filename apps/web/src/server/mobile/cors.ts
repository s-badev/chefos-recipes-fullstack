import { NextResponse } from "next/server";

const LOCAL_ALLOWED_ORIGINS = new Set([
  "http://localhost:8081",
  "http://localhost:8082",
  "http://localhost:19006",
  "http://127.0.0.1:8081",
  "http://127.0.0.1:8082"
]);

function getAllowedOrigins() {
  const origins = new Set(LOCAL_ALLOWED_ORIGINS);
  const envOrigin = process.env.MOBILE_ALLOWED_ORIGIN?.trim();

  if (envOrigin) {
    origins.add(envOrigin);
  }

  return origins;
}

export function getCorsHeaders(origin: string | null) {
  if (!origin) {
    return undefined;
  }

  const allowedOrigins = getAllowedOrigins();

  if (!allowedOrigins.has(origin)) {
    return undefined;
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  } satisfies Record<string, string>;
}

export function withCors(request: Request, response: NextResponse) {
  const headers = getCorsHeaders(request.headers.get("origin"));

  if (!headers) {
    return response;
  }

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export function createCorsOptionsResponse(request: Request) {
  const response = new NextResponse(null, { status: 204 });

  return withCors(request, response);
}
