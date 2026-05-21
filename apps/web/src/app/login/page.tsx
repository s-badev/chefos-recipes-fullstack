import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "../../server/auth/actions";
import { getCurrentUser } from "../../server/auth/session";

export const metadata: Metadata = {
  title: "Вход | Chefo's Recipes",
  description: "Екран за вход в Chefo's Recipes."
};

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const currentUser = await getCurrentUser();
  const params = await searchParams;

  if (currentUser) {
    redirect(currentUser.role === "admin" ? "/admin" : "/profile");
  }

  return (
    <section className="page-shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.62fr)] lg:items-start">
      <div className="rounded-[2rem] border border-stone-200 bg-white/70 p-6 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-8 xl:p-10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
          Потребителски достъп
        </p>
        <h1 className="mt-2 text-5xl font-bold leading-tight text-stone-950 sm:text-6xl">
          Вход в профила
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
          Влез в профила си, за да виждаш любимите рецепти и правилната навигация според ролята си.
        </p>
        <Link className="mt-6 inline-flex text-base font-black text-brand-700 hover:text-brand-900" href="/register">
          Нямаш профил? Създай регистрация
        </Link>
      </div>

      <form
        action={loginAction}
        className="w-full space-y-5 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-8"
      >
        {params?.error === "invalid" ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-base font-bold text-red-700">
            Невалиден имейл или парола.
          </p>
        ) : null}

        <div>
          <label className="text-base font-black text-stone-800" htmlFor="email">
            Имейл
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            id="email"
            name="email"
            placeholder="ime@example.com"
            required
            type="email"
          />
        </div>

        <div>
          <label className="text-base font-black text-stone-800" htmlFor="password">
            Парола
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            id="password"
            name="password"
            placeholder="Въведи парола"
            required
            type="password"
          />
        </div>

        <button
          className="w-full rounded-full bg-brand-600 px-5 py-3 text-base font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
          type="submit"
        >
          Вход
        </button>

        <p className="info-note rounded-2xl px-4 py-3 text-base leading-7">
          Демо админ: admin@chefos-recipes.bg / admin12345<br />
          Демо потребител: user@chefos-recipes.bg / user12345
        </p>
      </form>
    </section>
  );
}
