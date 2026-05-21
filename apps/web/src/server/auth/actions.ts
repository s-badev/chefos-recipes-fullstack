"use server";

import { redirect } from "next/navigation";
import { clearSession, createSession, verifyDemoUser } from "./session";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const user = verifyDemoUser(email, password);

  if (!user) {
    redirect("/login?error=invalid");
  }

  await createSession(user);
  redirect(user.role === "admin" ? "/admin" : "/profile");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
