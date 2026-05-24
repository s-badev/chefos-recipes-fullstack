import { jsonError, jsonResponse, optionsResponse } from "../../../../server/mobile/http";
import { listMobileCategories } from "../../../../server/mobile/recipes";

export async function GET(request: Request) {
  try {
    const categories = await listMobileCategories();

    return jsonResponse(request, { items: categories });
  } catch {
    return jsonError(request, "Categories could not be loaded.", 500);
  }
}

export async function OPTIONS(request: Request) {
  return optionsResponse(request);
}
