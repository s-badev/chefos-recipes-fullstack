import type { Metadata } from "next";
import Link from "next/link";
import { recipes } from "../catalog/recipes";

export const metadata: Metadata = {
  title: "Любими рецепти | Chefo’s Recipes",
  description: "Запазени идеи и любими рецепти в Chefo’s Recipes."
};

const sampleFavorites = recipes.slice(0, 3);

export default function FavoritesPage() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
            Chefo’s Recipes
          </p>
          <h2 className="mt-2 text-4xl font-bold text-stone-950 sm:text-5xl">
            Любими рецепти
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
            Тук ще се пазят рецептите, които искаш да приготвиш по-късно.
          </p>
        </div>

        <div className="rounded-3xl border border-brand-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-brand-800">Скоро в профила</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Любимите ще се пазят в твоето лично пространство.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          href="/catalog"
        >
          Разгледай каталога
        </Link>
      </div>

      <section className="space-y-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
            Любими идеи
          </p>
          <h3 className="mt-2 text-2xl font-bold text-stone-950">
            Така ще изглеждат запазените рецепти
          </h3>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {sampleFavorites.map((recipe) => (
            <Link
              className="group flex min-h-[300px] flex-col rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
              href={`/catalog/${recipe.slug}`}
              key={recipe.slug}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
                  {recipe.category}
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">
                  {recipe.difficulty}
                </span>
              </div>

              <div className="mt-5 flex-1">
                <h4 className="text-2xl font-bold leading-tight text-stone-950 group-hover:text-brand-800">
                  {recipe.title}
                </h4>
                <p className="mt-3 text-sm leading-6 text-stone-600">{recipe.description}</p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 border-y border-stone-100 py-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-stone-500">Подготовка</p>
                  <p className="mt-1 font-bold text-stone-950">{recipe.prepTimeMinutes} мин</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500">Готвене</p>
                  <p className="mt-1 font-bold text-stone-950">{recipe.cookTimeMinutes} мин</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500">Порции</p>
                  <p className="mt-1 font-bold text-stone-950">{recipe.servings}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {recipe.tags.slice(0, 2).map((tag) => (
                  <span
                    className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-brand-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
          Още няма рецепти
        </p>
        <h3 className="mt-3 text-2xl font-bold text-stone-950">Все още няма запазени рецепти</h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-stone-600">
          Когато запазиш първата си рецепта, тя ще се появи тук за бързо връщане към нея.
        </p>
      </section>
    </section>
  );
}
