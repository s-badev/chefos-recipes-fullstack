import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "../../server/auth/session";
import { deleteRecipeAction } from "../../server/recipes/admin-actions";
import { getAdminRecipeSummary, listRecipes } from "../../server/recipes/service";

export const metadata: Metadata = {
  title: "Админ панел | Chefo's Recipes",
  description: "Зона за управление на рецепти в Chefo's Recipes."
};

const ADMIN_RECIPE_PAGE_SIZE = 50;

export default async function AdminPage() {
  await requireAdmin();
  const [recipePage, summary] = await Promise.all([
    listRecipes({ page: 1, pageSize: ADMIN_RECIPE_PAGE_SIZE }),
    getAdminRecipeSummary()
  ]);
  const stats = [
    {
      label: "Общо рецепти",
      value: summary.totalRecipes
    },
    {
      label: "Категории",
      value: summary.totalCategories
    },
    {
      label: "Тагове",
      value: summary.totalTags
    }
  ];

  return (
    <section className="page-shell space-y-10">
      <div className="rounded-none border border-neutral-200 bg-surface p-6  sm:p-8">
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Chefo&apos;s Recipes
          </p>
          <h1 className="mt-2 text-5xl font-bold leading-tight text-neutral-950 sm:text-6xl">
            Админ панел
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-ink sm:text-xl sm:leading-9">
            Админ панелът показва текущия каталог, категории и тагове за преглед и управление.
          </p>
        </div>

      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="ui-button rounded-none bg-brand-600 px-6 py-3 text-base font-black text-white   transition-transform hover:bg-accent-hover"
          href="/admin/recipes/new"
        >
          Добави рецепта
        </Link>
        <Link
          className="ui-button rounded-none border border-neutral-300 bg-surface px-6 py-3 text-base font-black text-neutral-800  transition-transform hover:border-brand-300 hover:text-brand-800"
          href="/catalog"
        >
          Виж каталога
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3 xl:gap-8">
        {stats.map((stat) => (
          <div className="editorial-card rounded-none p-6" key={stat.label}>
            <p className="text-base font-black text-muted">{stat.label}</p>
            <p className="mt-3 text-4xl font-bold text-neutral-950">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-none border border-neutral-200 bg-surface ">
        <div className="border-b border-neutral-200 p-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Рецепти
          </p>
          <h2 className="mt-2 text-3xl font-bold text-neutral-950">Списък за управление</h2>
        </div>

        <div className="space-y-3 bg-bg p-4 sm:p-5">
          <p className="px-1 text-sm font-bold text-neutral-600">
            Показани {recipePage.items.length} от {recipePage.total} рецепти от базата данни
          </p>

          {recipePage.items.map((recipe) => (
            <div
              className="admin-row grid gap-5 rounded-none border border-neutral-200/80 bg-surface p-5 transition-transform hover:border-brand-200 hover:bg-bg sm:p-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(8.5rem,auto)_minmax(8.5rem,auto)_auto] lg:items-center lg:gap-6 xl:p-7"
              key={recipe.slug}
            >
              <div className="min-w-0">
                <h3 className="text-xl font-semibold text-neutral-950">{recipe.title}</h3>
                <p className="mt-2 line-clamp-2 max-w-3xl text-base font-medium leading-7 text-neutral-600">
                  {recipe.description}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[0.8rem] font-bold uppercase tracking-[0.14em] text-neutral-600">
                  Категория
                </p>
                <p className="inline-flex rounded-none border border-brand-200 bg-brand-50 px-4 py-1.5 text-base font-bold leading-6 text-brand-800">
                  {recipe.category}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[0.8rem] font-bold uppercase tracking-[0.14em] text-neutral-600">
                  Трудност
                </p>
                <p className="inline-flex rounded-none border border-neutral-200 bg-bg px-4 py-1.5 text-base font-bold leading-6 text-muted">
                  {recipe.difficulty}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-center lg:justify-end lg:justify-self-end">
                <Link
                  className="admin-action inline-flex h-10 items-center justify-center whitespace-nowrap rounded-none border border-neutral-200 bg-surface px-5 text-base font-semibold leading-none text-neutral-700  transition-transform hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                  href={`/admin/recipes/${recipe.slug}/edit`}
                >
                  Редактирай
                </Link>
                <form action={deleteRecipeAction} className="flex items-center">
                  <input name="slug" type="hidden" value={recipe.slug} />
                  <button
                    className="admin-action inline-flex h-10 items-center justify-center whitespace-nowrap rounded-none border border-red-200 bg-bg px-5 text-base font-semibold leading-none text-red-700  transition-transform hover:border-red-300 hover:bg-bg hover:text-red-800"
                    type="submit"
                  >
                    Изтрий
                  </button>
                </form>
              </div>
            </div>
          ))}

          <div className="flex justify-center border-t border-neutral-200/80 px-1 pt-5">
            <Link
              className="ui-button rounded-none bg-brand-600 px-6 py-3 text-base font-black text-white   transition-transform hover:bg-accent-hover"
              href="/admin/recipes/new"
            >
              Добави рецепта
            </Link>
          </div>
        </div>
      </section>

      <section className="info-note rounded-none p-6 ">
        <p className="text-lg font-bold text-neutral-950">Управление на каталога</p>
        <p className="mt-2 text-lg font-medium leading-8 text-ink">
          Използвай списъка за бърз преглед на рецептите, редакция на съдържание и поддръжка на
          подреден каталог.
        </p>
        <p className="mt-3 text-base font-medium leading-7 text-ink">
          Тук се виждат всички рецепти от базата, включително записите за тест на мащабируемост.
          Публичният каталог показва подбраните рецепти плюс ръчно добавените админ рецепти.
        </p>
      </section>
    </section>
  );
}
