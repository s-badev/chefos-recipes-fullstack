import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Вход | Chefo's Recipes",
  description: "Екран за вход в Chefo's Recipes."
};

export default function LoginPage() {
  return (
    <section className="mx-auto grid w-full max-w-[1400px] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.72fr)] lg:items-start">
      <div className="space-y-4">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
          Потребителски достъп
        </p>
        <h2 className="text-4xl font-bold text-stone-950 sm:text-5xl">Вход в профила</h2>
        <p className="text-base leading-7 text-stone-600">
          Скоро ще можеш да влизаш в профила си и да се връщаш към запазените рецепти.
        </p>
        <Link className="inline-flex text-sm font-bold text-brand-700 hover:text-brand-900" href="/register">
          Нямаш профил? Създай регистрация
        </Link>
      </div>

      <form className="w-full max-w-xl justify-self-end space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <label className="text-sm font-bold text-stone-800" htmlFor="email">
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
          <label className="text-sm font-bold text-stone-800" htmlFor="password">
            Парола
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            id="password"
            name="password"
            placeholder="Въведи парола"
            type="password"
          />
        </div>

        <button
          className="w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          type="button"
        >
          Вход
        </button>

        <p className="info-note rounded-2xl px-4 py-3 text-sm leading-6">
          Входът ще бъде активен скоро. Дотогава можеш свободно да разглеждаш каталога.
        </p>
      </form>
    </section>
  );
}
