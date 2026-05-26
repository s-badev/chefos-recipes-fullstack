import { NextResponse } from "next/server";

export function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  } satisfies Record<string, string>;
}

export function withCors(_request: Request, response: NextResponse) {
  const headers = getCorsHeaders();

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export function createCorsOptionsResponse(request: Request) {
  const response = new NextResponse(null, { status: 204 });

  return withCors(request, response);
}
