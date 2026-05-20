import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Регистрация | Chefo's Recipes",
  description: "Екран за регистрация в Chefo's Recipes."
};

export default function RegisterPage() {
  return (
    <section className="page-shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.62fr)] lg:items-start">
      <div className="rounded-[2rem] border border-stone-200 bg-white/70 p-6 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-8 xl:p-10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
          Нов профил
        </p>
        <h1 className="mt-2 text-5xl font-bold leading-tight text-stone-950 sm:text-6xl">
          Създай регистрация
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
          Регистрацията ще позволи запазване на любими рецепти и личен профил. Реалното
          създаване на акаунт ще бъде свързано по-късно.
        </p>
        <Link className="mt-6 inline-flex text-sm font-black text-brand-700 hover:text-brand-900" href="/login">
          Вече имаш профил? Влез
        </Link>
      </div>

      <form className="w-full space-y-5 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-8">
        <div>
          <label className="text-sm font-black text-stone-800" htmlFor="name">
            Име
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            id="name"
            name="name"
            placeholder="Твоето име"
            type="text"
          />
        </div>

        <div>
          <label className="text-sm font-black text-stone-800" htmlFor="email">
            Имейл
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            id="email"
            name="email"
            placeholder="ime@example.com"
            type="email"
          />
        </div>

        <div>
          <label className="text-sm font-black text-stone-800" htmlFor="password">
            Парола
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            id="password"
            name="password"
            placeholder="Създай парола"
            type="password"
          />
        </div>

        <button
          className="w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
          type="button"
        >
          Регистрация
        </button>

        <p className="info-note rounded-2xl px-4 py-3 text-sm leading-6">
          Регистрацията ще бъде активна скоро, за да пазиш любимите си рецепти на едно място.
        </p>
      </form>
    </section>
  );
}
