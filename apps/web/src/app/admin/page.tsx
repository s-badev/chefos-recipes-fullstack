import type { Metadata } from "next";
import Link from "next/link";
import { recipes } from "../catalog/recipes";
import { requireAdmin } from "../../server/auth/session";
import { deleteRecipeAction } from "../../server/recipes/admin-actions";

export const metadata: Metadata = {
  title: "Админ панел | Chefo's Recipes",
  description: "Зона за управление на рецепти в Chefo's Recipes."
};

const categories = Array.from(new Set(recipes.map((recipe) => recipe.category)));
const tags = Array.from(new Set(recipes.flatMap((recipe) => recipe.tags)));

const stats = [
  {
    label: "Общо рецепти",
    value: recipes.length
  },
  {
    label: "Категории",
    value: categories.length
  },
  {
    label: "Тагове",
    value: tags.length
  }
];

export default async function AdminPage() {
  await requireAdmin();

  return (
    <section className="page-shell space-y-10">
      <div className="rounded-[2rem] border border-stone-200 bg-white/70 p-6 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-8">
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Chefo&apos;s Recipes
          </p>
          <h1 className="mt-2 text-5xl font-bold leading-tight text-stone-950 sm:text-6xl">
            Админ панел
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-[#4a2a17] sm:text-xl sm:leading-9">
            Админ панелът показва текущия каталог, категории и тагове за преглед и управление.
          </p>
        </div>

      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="ui-button rounded-full bg-brand-600 px-6 py-3 text-base font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
          href="/admin/recipes/new"
        >
          Добави рецепта
        </Link>
        <Link
          className="ui-button rounded-full border border-stone-300 bg-white px-6 py-3 text-base font-black text-stone-800 shadow-sm transition hover:border-brand-300 hover:text-brand-800"
          href="/catalog"
        >
          Виж каталога
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3 xl:gap-8">
        {stats.map((stat) => (
          <div className="editorial-card rounded-[1.8rem] p-6" key={stat.label}>
            <p className="text-base font-black text-stone-500">{stat.label}</p>
            <p className="mt-3 text-4xl font-bold text-stone-950">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/84 shadow-[0_18px_52px_rgba(89,52,22,0.08)]">
        <div className="border-b border-stone-200 p-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Рецепти
          </p>
          <h2 className="mt-2 text-3xl font-bold text-stone-950">Списък за управление</h2>
        </div>

        <div className="space-y-3 bg-[#fffaf3]/60 p-4 sm:p-5">
          <p className="px-1 text-sm font-bold text-stone-600">
            Показани {recipes.length} от {recipes.length} рецепти
          </p>

          {recipes.map((recipe) => (
            <div
              className="admin-row grid gap-5 rounded-[1.45rem] border border-stone-200/80 bg-white/78 p-5 shadow-sm shadow-stone-900/[0.03] transition hover:border-brand-200 hover:bg-[#fff8ee] hover:shadow-[0_14px_34px_rgba(89,52,22,0.08)] sm:p-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(8.5rem,auto)_minmax(8.5rem,auto)_auto] lg:items-center lg:gap-6 xl:p-7"
              key={recipe.slug}
            >
              <div className="min-w-0">
                <h3 className="text-xl font-semibold text-stone-950">{recipe.title}</h3>
                <p className="mt-2 line-clamp-2 max-w-3xl text-base font-medium leading-7 text-stone-600">
                  {recipe.description}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[0.8rem] font-bold uppercase tracking-[0.14em] text-stone-600">
                  Категория
                </p>
                <p className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-base font-bold leading-6 text-brand-800">
                  {recipe.category}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[0.8rem] font-bold uppercase tracking-[0.14em] text-stone-600">
                  Трудност
                </p>
                <p className="inline-flex rounded-full border border-amber-200 bg-[#fff4df] px-4 py-1.5 text-base font-bold leading-6 text-[#8a4b13]">
                  {recipe.difficulty}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-center lg:justify-end lg:justify-self-end">
                <Link
                  className="admin-action inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full border border-stone-200 bg-white px-5 text-base font-semibold leading-none text-stone-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                  href={`/admin/recipes/${recipe.slug}/edit`}
                >
                  Редактирай
                </Link>
                <form action={deleteRecipeAction} className="flex items-center">
                  <input name="slug" type="hidden" value={recipe.slug} />
                  <button
                    className="admin-action inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full border border-red-200 bg-[#fff3ed] px-5 text-base font-semibold leading-none text-red-700 shadow-sm transition hover:border-red-300 hover:bg-[#ffe8df] hover:text-red-800"
                    type="submit"
                  >
                    Изтрий
                  </button>
                </form>
              </div>
            </div>
          ))}

          <div className="flex justify-center border-t border-stone-200/80 px-1 pt-5">
            <Link
              className="ui-button rounded-full bg-brand-600 px-6 py-3 text-base font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
              href="/admin/recipes/new"
            >
              Добави рецепта
            </Link>
          </div>
        </div>
      </section>

      <section className="info-note rounded-[1.8rem] p-6 shadow-sm">
        <p className="text-lg font-bold text-stone-950">Управление на каталога</p>
        <p className="mt-2 text-lg font-medium leading-8 text-[#4a2a17]">
          Използвай списъка за бърз преглед на рецептите, редакция на съдържание и поддръжка на
          подреден каталог.
        </p>
      </section>
    </section>
  );
}
