import type { Metadata } from "next";
import { pageMetadata } from "../../../../lib/site-metadata";
import Link from "next/link";
import { requireAdmin } from "../../../../server/auth/session";
import { createRecipeAction } from "../../../../server/recipes/admin-actions";

export const metadata: Metadata = pageMetadata("Нова рецепта", "Форма за добавяне на рецепта.", "/admin/recipes/new", { noindex: true });

export default async function NewRecipePage() {
  await requireAdmin("/admin/recipes/new");

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
            Админ действие
          </p>
          <h1 className="mt-2 text-4xl font-bold text-neutral-950 sm:text-5xl">Добави рецепта</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
            Попълни основната информация и запази рецептата в каталога.
          </p>
        </div>
        <Link className="text-base font-bold text-brand-700 hover:text-brand-900" href="/admin">
          Обратно към админ панела
        </Link>
      </div>

      <form action={createRecipeAction} className="grid gap-5 rounded-none border border-neutral-200 bg-surface p-6  lg:grid-cols-2">
        <div>
          <label className="text-base font-bold text-neutral-800" htmlFor="title">
            Заглавие
          </label>
          <input
            className="mt-2 w-full rounded-none border border-neutral-200 bg-bg px-4 py-3 text-base text-neutral-950  transition-transform placeholder:text-muted focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-100"
            id="title"
            name="title"
            placeholder="Например: Домашна мусака"
            required
            type="text"
          />
        </div>

        <div>
          <label className="text-base font-bold text-neutral-800" htmlFor="category">
            Категория
          </label>
          <input
            className="mt-2 w-full rounded-none border border-neutral-200 bg-bg px-4 py-3 text-base text-neutral-950  transition-transform placeholder:text-muted focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-100"
            id="category"
            name="category"
            placeholder="Основни"
            required
            type="text"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="text-base font-bold text-neutral-800" htmlFor="description">
            Описание
          </label>
          <textarea
            className="mt-2 min-h-32 w-full rounded-none border border-neutral-200 bg-bg px-4 py-3 text-base text-neutral-950  transition-transform placeholder:text-muted focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-100"
            id="description"
            name="description"
            placeholder="Кратко описание на рецептата"
            required
          />
        </div>

        <div>
          <label className="text-base font-bold text-neutral-800" htmlFor="prepTime">
            Време за подготовка
          </label>
          <input
            className="mt-2 w-full rounded-none border border-neutral-200 bg-bg px-4 py-3 text-base text-neutral-950  transition-transform placeholder:text-muted focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-100"
            id="prepTime"
            name="prepTime"
            placeholder="20"
            type="number"
          />
        </div>

        <div>
          <label className="text-base font-bold text-neutral-800" htmlFor="cookTime">
            Време за готвене
          </label>
          <input
            className="mt-2 w-full rounded-none border border-neutral-200 bg-bg px-4 py-3 text-base text-neutral-950  transition-transform placeholder:text-muted focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-100"
            id="cookTime"
            name="cookTime"
            placeholder="45"
            type="number"
          />
        </div>

        <div>
          <label className="text-base font-bold text-neutral-800" htmlFor="servings">
            Порции
          </label>
          <input
            className="mt-2 w-full rounded-none border border-neutral-200 bg-bg px-4 py-3 text-base text-neutral-950  transition-transform placeholder:text-muted focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-100"
            id="servings"
            name="servings"
            placeholder="4"
            type="number"
          />
        </div>

        <div className="flex items-end">
          <button
            className="w-full rounded-none bg-brand-600 px-5 py-3 text-base font-bold text-white  transition-transform hover:bg-accent-hover"
            type="submit"
          >
            Запази рецепта
          </button>
        </div>
      </form>

      <p className="rounded-none border border-dashed border-brand-200 bg-surface p-5 text-base leading-7 text-neutral-600 ">
        След запис рецептата се добавя към каталога и може да бъде управлявана от админ панела.
      </p>
    </section>
  );
}
