import type { Metadata } from "next";
import Link from "next/link";
import { recipes } from "../catalog/recipes";

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

export default function AdminPage() {
  return (
    <section className="page-shell space-y-10">
      <div className="grid gap-8 rounded-[2rem] border border-stone-200 bg-white/70 p-6 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.42fr)] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Chefo&apos;s Recipes
          </p>
          <h1 className="mt-2 text-5xl font-bold leading-tight text-stone-950 sm:text-6xl">
            Админ панел
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
            Зона за подреждане на рецепти, преглед на категории и подготовка на ново съдържание.
          </p>
        </div>

        <div className="info-card rounded-[1.7rem] p-5">
          <p className="text-sm font-black text-brand-800">Подготовка за управление</p>
          <p className="mt-2 text-[15px] leading-7 text-stone-600">
            Админ зоната ще помага за добавяне, редакция и подреждане на рецепти.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="rounded-full bg-brand-600 px-6 py-3 text-sm font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
          href="/admin/recipes/new"
        >
          Добави рецепта
        </Link>
        <Link
          className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-black text-stone-800 shadow-sm transition hover:border-brand-300 hover:text-brand-800"
          href="/catalog"
        >
          Виж каталога
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3 xl:gap-8">
        {stats.map((stat) => (
          <div className="editorial-card rounded-[1.8rem] p-6" key={stat.label}>
            <p className="text-sm font-black text-stone-500">{stat.label}</p>
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

        <div className="divide-y divide-stone-100">
          {recipes.slice(0, 6).map((recipe) => (
            <div
              className="grid gap-5 p-6 transition hover:bg-brand-50/50 lg:grid-cols-[1.25fr_0.7fr_0.7fr_auto] lg:items-center xl:p-7"
              key={recipe.slug}
            >
              <div>
                <h3 className="text-xl font-bold text-stone-950">{recipe.title}</h3>
                <p className="mt-2 line-clamp-2 text-[15px] leading-7 text-stone-600">
                  {recipe.description}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
                  Категория
                </p>
                <p className="mt-1 text-sm font-black text-stone-950">{recipe.category}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
                  Трудност
                </p>
                <p className="mt-1 text-sm font-black text-stone-950">{recipe.difficulty}</p>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-black text-stone-700 transition hover:border-brand-300 hover:text-brand-800"
                  href={`/admin/recipes/${recipe.slug}/edit`}
                >
                  Редактирай
                </Link>
                <button
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:border-red-300 hover:bg-red-100"
                  type="button"
                >
                  Изтрий
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="info-note rounded-[1.8rem] p-6 shadow-sm">
        <p className="text-sm font-black text-stone-950">Бележка</p>
        <p className="mt-2 text-[15px] leading-7 text-stone-600">
          Добавянето, редакцията и изтриването ще бъдат достъпни, когато зоната за управление е
          готова за работа.
        </p>
      </section>
    </section>
  );
}
