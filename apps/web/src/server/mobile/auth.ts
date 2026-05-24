import { createHmac, timingSafeEqual } from "crypto";
import type { CurrentUser, UserRole } from "../auth/session";
import { resolveFavoriteUserId } from "../favorites/repository";

export type MobileApiUser = CurrentUser & {
  id: string;
};

type MobileTokenPayload = MobileApiUser & {
  exp: number;
  iat: number;
};

const MOBILE_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function getMobileJwtSecret() {
  const secret = process.env.MOBILE_JWT_SECRET;

  if (!secret) {
    throw new Error("MOBILE_JWT_SECRET is required for mobile API JWT authentication.");
  }

  return secret;
}

function encodeJson(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function signPayload(header: string, payload: string) {
  return createHmac("sha256", getMobileJwtSecret())
    .update(`${header}.${payload}`)
    .digest("base64url");
}

function hasValidSignature(signature: string, expectedSignature: string) {
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  return (
    signatureBuffer.length === expectedSignatureBuffer.length &&
    timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  );
}

function isUserRole(role: unknown): role is UserRole {
  return role === "user" || role === "admin";
}

function parsePayload(payload: string): MobileTokenPayload | undefined {
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<MobileTokenPayload>;

    if (
      typeof parsed.id !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.name !== "string" ||
      !isUserRole(parsed.role) ||
      typeof parsed.exp !== "number" ||
      typeof parsed.iat !== "number"
    ) {
      return undefined;
    }

    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
      exp: parsed.exp,
      iat: parsed.iat
    };
  } catch {
    return undefined;
  }
}

export async function toMobileApiUser(user: CurrentUser): Promise<MobileApiUser> {
  const id = await resolveFavoriteUserId(user);

  return {
    id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

export function signMobileToken(user: MobileApiUser) {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: "HS256", typ: "JWT" });
  const payload = encodeJson({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: now,
    exp: now + MOBILE_TOKEN_TTL_SECONDS
  } satisfies MobileTokenPayload);
  const signature = signPayload(header, payload);

  return `${header}.${payload}.${signature}`;
}

export function verifyMobileToken(request: Request): MobileApiUser | undefined {
  const authorization = request.headers.get("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return undefined;
  }

  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    return undefined;
  }

  const expectedSignature = signPayload(header, payload);

  if (!hasValidSignature(signature, expectedSignature)) {
    return undefined;
  }

  const parsedPayload = parsePayload(payload);

  if (!parsedPayload || parsedPayload.exp < Math.floor(Date.now() / 1000)) {
    return undefined;
  }

  return {
    id: parsedPayload.id,
    email: parsedPayload.email,
    name: parsedPayload.name,
    role: parsedPayload.role
  };
}
