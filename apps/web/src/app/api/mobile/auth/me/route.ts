import { jsonResponse, optionsResponse, requireMobileApiUser } from "../../../../../server/mobile/http";

export async function GET(request: Request) {
  const auth = requireMobileApiUser(request);

  if (auth.response) {
    return auth.response;
  }

  return jsonResponse(request, { user: auth.user });
}

export async function OPTIONS(request: Request) {
  return optionsResponse(request);
}
