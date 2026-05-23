import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { eq, getDb, users as usersTable } from "@chefos/db";
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
const PASSWORD_HASH_PREFIX = "scrypt";

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

function toCurrentUser(user: CurrentUser): CurrentUser {
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

function verifyScryptPassword(password: string, salt: string, expectedHash: string) {
  const passwordHash = hashPassword(password, salt);
  const passwordHashBuffer = Buffer.from(passwordHash);
  const expectedPasswordHashBuffer = Buffer.from(expectedHash);

  return (
    passwordHashBuffer.length === expectedPasswordHashBuffer.length &&
    timingSafeEqual(passwordHashBuffer, expectedPasswordHashBuffer)
  );
}

function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("base64url");

  return `${PASSWORD_HASH_PREFIX}$${salt}$${hashPassword(password, salt)}`;
}

function verifyStoredPassword(password: string, storedPasswordHash: string) {
  const [prefix, salt, expectedHash] = storedPasswordHash.split("$");

  if (prefix !== PASSWORD_HASH_PREFIX || !salt || !expectedHash) {
    return false;
  }

  return verifyScryptPassword(password, salt, expectedHash);
}

function isUniqueEmailError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

async function findDbUserByEmail(email: string) {
  const db = getDb();
  const rows = await db
    .select({
      email: usersTable.email,
      name: usersTable.name,
      passwordHash: usersTable.passwordHash,
      role: usersTable.role
    })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  return rows[0];
}

export function verifyDemoUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = demoUsers.find((demoUser) => demoUser.email === normalizedEmail);

  if (!user) {
    return undefined;
  }

  if (!verifyScryptPassword(password, user.passwordSalt, user.passwordHash)) {
    return undefined;
  }

  return toCurrentUser(user);
}

export async function verifyRegisteredUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);

  try {
    const user = await findDbUserByEmail(normalizedEmail);

    if (!user || !verifyStoredPassword(password, user.passwordHash)) {
      return undefined;
    }

    return toCurrentUser(user);
  } catch {
    return undefined;
  }
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

  const existingDemoUser = demoUsers.some((demoUser) => demoUser.email === email);
  const existingRegisteredUser = await findDbUserByEmail(email);

  if (existingDemoUser || existingRegisteredUser) {
    return { error: "exists" as const };
  }

  const now = new Date();

  try {
    const insertedUsers = await getDb()
      .insert(usersTable)
      .values({
        name,
        email,
        passwordHash: createPasswordHash(password),
        role: "user",
        createdAt: now,
        updatedAt: now
      })
      .returning({
        email: usersTable.email,
        name: usersTable.name,
        role: usersTable.role
      });

    const user = insertedUsers[0];

    if (!user) {
      return { error: "server" as const };
    }

    return { user: toCurrentUser(user) };
  } catch (error) {
    if (isUniqueEmailError(error)) {
      return { error: "exists" as const };
    }

    throw error;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const email = decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const demoUser = demoUsers.find((user) => user.email === email);

  if (demoUser) {
    return toCurrentUser(demoUser);
  }

  if (!email) {
    return undefined;
  }

  try {
    const registeredUser = await findDbUserByEmail(email);

    return registeredUser ? toCurrentUser(registeredUser) : undefined;
  } catch {
    return undefined;
  }
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
