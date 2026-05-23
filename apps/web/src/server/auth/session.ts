import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import path from "path";

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

type RegisteredUser = DemoUser;

const SESSION_COOKIE_NAME = "chefos_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const REGISTERED_USERS_FILE = path.join(
  process.cwd(),
  ".next",
  "cache",
  "chefos-registered-users.json"
);

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

function normalizeEmail(email: string) {
  return email.trim().toLocaleLowerCase("bg-BG");
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("base64url");
}

function verifyPassword(password: string, salt: string, expectedHash: string) {
  const passwordHash = hashPassword(password, salt);
  const passwordHashBuffer = Buffer.from(passwordHash);
  const expectedPasswordHashBuffer = Buffer.from(expectedHash);

  return (
    passwordHashBuffer.length === expectedPasswordHashBuffer.length &&
    timingSafeEqual(passwordHashBuffer, expectedPasswordHashBuffer)
  );
}

async function readRegisteredUsers(): Promise<RegisteredUser[]> {
  try {
    const file = await readFile(REGISTERED_USERS_FILE, "utf8");
    const users = JSON.parse(file);

    return Array.isArray(users) ? users : [];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeRegisteredUsers(users: RegisteredUser[]) {
  await mkdir(path.dirname(REGISTERED_USERS_FILE), { recursive: true });
  await writeFile(REGISTERED_USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export function verifyDemoUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = demoUsers.find((demoUser) => demoUser.email === normalizedEmail);

  if (!user) {
    return undefined;
  }

  if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return undefined;
  }

  return toCurrentUser(user);
}

export async function verifyRegisteredUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const registeredUsers = await readRegisteredUsers();
  const user = registeredUsers.find((registeredUser) => registeredUser.email === normalizedEmail);

  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return undefined;
  }

  return toCurrentUser(user);
}

export async function createRegisteredUser(input: {
  email: string;
  name: string;
  password: string;
}) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!name || !email || !email.includes("@") || password.length < 8) {
    return { error: "invalid" as const };
  }

  const registeredUsers = await readRegisteredUsers();
  const existingDemoUser = demoUsers.some((demoUser) => demoUser.email === email);
  const existingRegisteredUser = registeredUsers.some(
    (registeredUser) => registeredUser.email === email
  );

  if (existingDemoUser || existingRegisteredUser) {
    return { error: "exists" as const };
  }

  const passwordSalt = randomBytes(16).toString("base64url");
  const user: RegisteredUser = {
    email,
    name,
    passwordHash: hashPassword(password, passwordSalt),
    passwordSalt,
    role: "user"
  };

  await writeRegisteredUsers([...registeredUsers, user]);

  return { user: toCurrentUser(user) };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const email = decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const demoUser = demoUsers.find((user) => user.email === email);

  if (demoUser) {
    return toCurrentUser(demoUser);
  }

  const registeredUsers = await readRegisteredUsers();
  const registeredUser = registeredUsers.find((user) => user.email === email);

  return registeredUser ? toCurrentUser(registeredUser) : undefined;
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
