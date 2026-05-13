import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Нова рецепта | Chefo's Recipes",
  description: "Placeholder форма за добавяне на рецепта."
};

export default function NewRecipePage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
            Админ действие
          </p>
          <h2 className="mt-2 text-4xl font-bold text-stone-950 sm:text-5xl">Добави рецепта</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
            Това е неактивна форма за бъдещото създаване на рецепти. Реалното добавяне ще използва
            Server Actions или API поток на следващ етап.
          </p>
        </div>
        <Link className="text-sm font-bold text-brand-700 hover:text-brand-900" href="/admin">
          Обратно към админ панела
        </Link>
      </div>

      <form className="grid gap-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:grid-cols-2">
        <div>
          <label className="text-sm font-bold text-stone-800" htmlFor="title">
            Заглавие
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            id="title"
            name="title"
            placeholder="Например: Домашна мусака"
            type="text"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-stone-800" htmlFor="category">
            Категория
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            id="category"
            name="category"
            placeholder="Основни"
            type="text"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="text-sm font-bold text-stone-800" htmlFor="description">
            Описание
          </label>
          <textarea
            className="mt-2 min-h-32 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            id="description"
            name="description"
            placeholder="Кратко описание на рецептата"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-stone-800" htmlFor="prepTime">
            Време за подготовка
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            id="prepTime"
            name="prepTime"
            placeholder="20"
            type="number"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-stone-800" htmlFor="cookTime">
            Време за готвене
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            id="cookTime"
            name="cookTime"
            placeholder="45"
            type="number"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-stone-800" htmlFor="servings">
            Порции
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            id="servings"
            name="servings"
            placeholder="4"
            type="number"
          />
        </div>

        <div className="flex items-end">
          <button
            className="w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
            type="button"
          >
            Запази чернова
          </button>
        </div>
      </form>

      <p className="rounded-3xl border border-dashed border-brand-200 bg-white p-5 text-sm leading-6 text-stone-600 shadow-sm">
        Формата не записва данни. По-късно създаването ще минава през защитена админ операция и
        Drizzle заявка към Neon.
      </p>
    </section>
  );
}
