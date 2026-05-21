import { createHmac, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type UserRole = "user" | "admin";

export type CurrentUser = {
  email: string;
  name: string;
  role: UserRole;
};

type DemoUser = CurrentUser & {
  passwordHash: string;
  passwordSalt: string;
};

const SESSION_COOKIE_NAME = "chefos_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const demoUsers: DemoUser[] = [
  {
    email: "admin@chefos-recipes.bg",
    name: "Admin",
    passwordHash: "xxxPKHpLqEP8Oz_bymHN72s-PcPWZTAi0lUqlBtxmM2Sp9Nw3FBgXbMxUSI62Yp42Eqeff9bfZWm-SWJ5mVdQg",
    passwordSalt: "chefos-admin-demo-salt",
    role: "admin"
  },
  {
    email: "user@chefos-recipes.bg",
    name: "User",
    passwordHash: "wXylwVlZAPehJM-mM31kla8QkmGVyZTdQjoNNtL423O9ldVfi6yuiZ8CwCDv8ZIIYoYMuLfPGVxcMB1Nbn9EvQ",
    passwordSalt: "chefos-user-demo-salt",
    role: "user"
  }
];

function getSessionSecret() {
  return process.env.AUTH_SESSION_SECRET ?? "chefos-recipes-demo-session-secret";
}

function signSessionPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function encodeSession(email: string) {
  const payload = Buffer.from(email, "utf8").toString("base64url");
  const signature = signSessionPayload(payload);

  return `${payload}.${signature}`;
}

function decodeSession(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const [payload, signature] = value.split(".");

  if (!payload || !signature) {
    return undefined;
  }

  const expectedSignature = signSessionPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return undefined;
  }

  return Buffer.from(payload, "base64url").toString("utf8");
}

function toCurrentUser(user: DemoUser): CurrentUser {
  return {
    email: user.email,
    name: user.name,
    role: user.role
  };
}

export function verifyDemoUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLocaleLowerCase("bg-BG");
  const user = demoUsers.find((demoUser) => demoUser.email === normalizedEmail);

  if (!user) {
    return undefined;
  }

  const passwordHash = scryptSync(password, user.passwordSalt, 64).toString("base64url");
  const passwordHashBuffer = Buffer.from(passwordHash);
  const expectedPasswordHashBuffer = Buffer.from(user.passwordHash);

  if (
    passwordHashBuffer.length !== expectedPasswordHashBuffer.length ||
    !timingSafeEqual(passwordHashBuffer, expectedPasswordHashBuffer)
  ) {
    return undefined;
  }

  return toCurrentUser(user);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const email = decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const user = demoUsers.find((demoUser) => demoUser.email === email);

  return user ? toCurrentUser(user) : undefined;
}

export async function createSession(user: CurrentUser) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, encodeSession(user.email), {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/profile");
  }

  return user;
}
