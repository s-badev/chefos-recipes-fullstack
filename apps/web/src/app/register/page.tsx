import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Регистрация | Chefo's Recipes",
  description: "Екран за регистрация в Chefo's Recipes."
};

export default function RegisterPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div className="space-y-4">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
          Нов профил
        </p>
        <h2 className="text-4xl font-bold text-stone-950 sm:text-5xl">Създай регистрация</h2>
        <p className="text-base leading-7 text-stone-600">
          Регистрацията ще позволи запазване на любими рецепти и личен профил. Реалното създаване
          на акаунт ще бъде свързано по-късно.
        </p>
        <Link className="inline-flex text-sm font-bold text-brand-700 hover:text-brand-900" href="/login">
          Вече имаш профил? Влез
        </Link>
      </div>

      <form className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <label className="text-sm font-bold text-stone-800" htmlFor="name">
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
            placeholder="Създай парола"
            type="password"
          />
        </div>

        <button
          className="w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          type="button"
        >
          Регистрация
        </button>

        <p className="rounded-2xl border border-dashed border-brand-200 bg-brand-50 px-4 py-3 text-sm leading-6 text-brand-900">
          Формата е неактивна. По-късно паролата ще се хешира и профилът ще се записва в базата.
        </p>
      </form>
    </section>
  );
}
