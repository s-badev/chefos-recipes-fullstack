"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "../../lib/navigation";
import { validEmail, validRegistration } from "../../lib/auth";
import {
  clearSession,
  createRegisteredUser,
  createSession,
  verifyDemoUser,
  verifyRegisteredUser
} from "./session";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = formData.has("next") ? safeNextPath(formData.get("next")) : undefined;
  const suffix = next === undefined ? "" : `&next=${encodeURIComponent(next)}`;
  if (!validEmail(email) || !password || password.length > 256) redirect(`/login?error=invalid${suffix}`);
  const user = verifyDemoUser(email, password) ?? (await verifyRegisteredUser(email, password));

  if (!user) {
    redirect(`/login?error=invalid${suffix}`);
  }

  await createSession(user);
  redirect(next ?? (user.role === "admin" ? "/admin" : "/profile"));
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = formData.has("next") ? safeNextPath(formData.get("next")) : undefined;
  const suffix = next === undefined ? "" : `&next=${encodeURIComponent(next)}`;
  if (!validRegistration(name, email, password)) redirect(`/register?error=invalid${suffix}`);
  let result: Awaited<ReturnType<typeof createRegisteredUser>>;

  try {
    result = await createRegisteredUser({ email, name, password });
  } catch {
    redirect(`/register?error=server${suffix}`);
  }

  if ("error" in result) {
    redirect(`/register?error=${result.error}${suffix}`);
  }

  await createSession(result.user);
  redirect(next ?? "/profile");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
