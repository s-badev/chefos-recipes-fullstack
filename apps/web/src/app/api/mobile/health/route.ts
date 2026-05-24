import { jsonResponse, optionsResponse } from "../../../../server/mobile/http";

export async function GET(request: Request) {
  return jsonResponse(request, {
    ok: true,
    app: "Chefo's Recipes Mobile API"
  });
}

export async function OPTIONS(request: Request) {
  return optionsResponse(request);
}
