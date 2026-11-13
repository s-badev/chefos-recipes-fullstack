import type { Metadata } from "next";
import { pageMetadata } from "../../lib/site-metadata";
import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "../../server/auth/actions";
import { getCurrentUser } from "../../server/auth/session";
import { safeNextPath } from "../../lib/navigation";
import { AuthLayout } from "../auth-layout";
import { AuthField, SubmitButton } from "../form-controls";
import { SplitWords } from "../split-heading";

export const metadata: Metadata = pageMetadata("Регистрация", "Създай профил в Chefo's Recipes и пази любимите си рецепти на едно място.", "/register", { noindex: true });

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

function getRegisterErrorMessage(error: string | undefined) {
  switch (error) {
    case "exists":
      return "Вече има профил с този имейл.";
    case "server":
      return "Регистрацията не беше успешна. Опитай отново след малко.";
    case "invalid":
      return "Попълни име, валиден имейл и парола с поне 8 символа.";
    default:
      return undefined;
  }
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const currentUser = await getCurrentUser();
  const params = await searchParams;
  const next = params?.next === undefined ? undefined : safeNextPath(params.next);
  const authSuffix = next === undefined ? "" : `?next=${encodeURIComponent(next)}`;
  const errorMessage = getRegisterErrorMessage(params?.error);

  if (currentUser) {
    redirect(next ?? (currentUser.role === "admin" ? "/admin" : "/profile"));
  }

  return (
    <AuthLayout
      heading={<>Създай <em>профил</em></>}
      mode="register"
      next={next}
      sub="Пази любимите си рецепти на едно място и се връщай към тях по всяко време."
      title={<><SplitWords text="Седни" /> <em><SplitWords start={1} text="на масата" /></em></>}
    >
      <form action={registerAction}>
        {next !== undefined ? <input name="next" type="hidden" value={next} /> : null}
        <AuthField autoCapitalize="words" autoComplete="name" label="Име" name="name" placeholder="Твоето име" required type="text" />
        <AuthField autoCapitalize="none" autoComplete="email" inputMode="email" label="Имейл" name="email" placeholder="ime@example.com" required spellCheck={false} type="email" />
        <AuthField autoComplete="new-password" label="Парола" minLength={8} name="password" placeholder="Създай парола" required type="password" />
        {errorMessage ? <p className="form-err" role="alert">{errorMessage}</p> : null}
        <SubmitButton className="btn fill" pendingLabel="Създаване…">Създай профил <span aria-hidden="true" className="ar">→</span></SubmitButton>
        <p className="alt">Вече имаш профил? <Link className="link" href={`/login${authSuffix}`}>Вход</Link></p>
      </form>
    </AuthLayout>
  );
}
