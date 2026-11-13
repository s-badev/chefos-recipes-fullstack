import type { Metadata } from "next";
import { pageMetadata } from "../../lib/site-metadata";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "../../server/auth/actions";
import { getCurrentUser } from "../../server/auth/session";
import { safeNextPath } from "../../lib/navigation";
import { AuthLayout } from "../auth-layout";
import { AuthField, SubmitButton } from "../form-controls";
import { SplitWords } from "../split-heading";

export const metadata: Metadata = pageMetadata("Вход", "Влез в профила си в Chefo's Recipes и се върни към любимите си рецепти.", "/login", { noindex: true });

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const currentUser = await getCurrentUser();
  const params = await searchParams;
  const next = params?.next === undefined ? undefined : safeNextPath(params.next);
  const authSuffix = next === undefined ? "" : `?next=${encodeURIComponent(next)}`;

  if (currentUser) {
    redirect(next ?? (currentUser.role === "admin" ? "/admin" : "/profile"));
  }

  return (
    <AuthLayout
      heading="Влез в профила си"
      mode="login"
      next={next}
      sub="Любимите ти рецепти те чакат там, където ги остави."
      title={<><SplitWords text="Добре дошъл" /> <em><SplitWords start={2} text="отново" /></em></>}
    >
      <form action={loginAction}>
        {next !== undefined ? <input name="next" type="hidden" value={next} /> : null}
        <AuthField autoCapitalize="none" autoComplete="email" inputMode="email" label="Имейл" name="email" placeholder="ime@example.com" required spellCheck={false} type="email" />
        <AuthField autoComplete="current-password" label="Парола" name="password" placeholder="Въведи парола" required type="password" />
        {params?.error === "invalid" ? <p className="form-err" role="alert">Невалиден имейл или парола.</p> : null}
        <SubmitButton className="btn fill" pendingLabel="Влизане…">Влез <span aria-hidden="true" className="ar">→</span></SubmitButton>
        <p className="alt">Нямаш профил? <Link className="link" href={`/register${authSuffix}`}>Регистрация</Link></p>
      </form>
    </AuthLayout>
  );
}
