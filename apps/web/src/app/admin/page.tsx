import type { Metadata } from "next";
import Link from "next/link";
import { recipes } from "../catalog/recipes";

export const metadata: Metadata = {
  title: "Админ панел | Chefo’s Recipes",
  description: "UI основа за бъдещия админ панел на Chefo’s Recipes."
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

export default function AdminPage() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
            Chefo’s Recipes
          </p>
          <h2 className="mt-2 text-4xl font-bold text-stone-950 sm:text-5xl">Админ панел</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
            Това е начална UI основа за управление на рецепти. По-късно секцията ще бъде защитена
            и достъпна само за потребители с админ роля.
          </p>
        </div>

        <div className="rounded-3xl border border-brand-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-brand-800">Само placeholder действия</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Реалните действия ще бъдат свързани с API и база данни на следващ етап.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          type="button"
        >
          Добави рецепта
        </button>
        <Link
          className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-stone-800 shadow-sm transition hover:border-brand-300 hover:text-brand-800"
          href="/catalog"
        >
          Виж каталога
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm" key={stat.label}>
            <p className="text-sm font-bold text-stone-500">{stat.label}</p>
            <p className="mt-3 text-4xl font-bold text-stone-950">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
            Примерни рецепти
          </p>
          <h3 className="mt-2 text-2xl font-bold text-stone-950">Списък за управление</h3>
        </div>

        <div className="divide-y divide-stone-100">
          {recipes.slice(0, 6).map((recipe) => (
            <div
              className="grid gap-4 p-5 lg:grid-cols-[1.25fr_0.75fr_0.75fr_auto] lg:items-center"
              key={recipe.slug}
            >
              <div>
                <h4 className="text-lg font-bold text-stone-950">{recipe.title}</h4>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600">
                  {recipe.description}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-stone-500">Категория</p>
                <p className="mt-1 text-sm font-bold text-stone-950">{recipe.category}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-stone-500">Трудност</p>
                <p className="mt-1 text-sm font-bold text-stone-950">{recipe.difficulty}</p>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-brand-300 hover:text-brand-800"
                  type="button"
                >
                  Редактирай
                </button>
                <button
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                  type="button"
                >
                  Изтрий
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-brand-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-stone-950">Бележка за бъдеща интеграция</p>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Бутоните все още не изпълняват реални действия. По-късно добавянето, редакцията и
          изтриването ще минават през защитени API endpoints и операции към базата данни.
        </p>
      </section>
    </section>
  );
}
