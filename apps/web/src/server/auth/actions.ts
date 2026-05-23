"use server";

import { redirect } from "next/navigation";
import {
  clearSession,
  createRegisteredUser,
  createSession,
  verifyDemoUser,
  verifyRegisteredUser
} from "./session";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const user = verifyDemoUser(email, password) ?? (await verifyRegisteredUser(email, password));

  if (!user) {
    redirect("/login?error=invalid");
  }

  await createSession(user);
  redirect(user.role === "admin" ? "/admin" : "/profile");
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  let result: Awaited<ReturnType<typeof createRegisteredUser>>;

  try {
    result = await createRegisteredUser({ email, name, password });
  } catch {
    redirect("/register?error=server");
  }

  if ("error" in result) {
    redirect(`/register?error=${result.error}`);
  }

  await createSession(result.user);
  redirect("/profile");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
