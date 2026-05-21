import type { Metadata } from "next";
import Link from "next/link";
import { RecipeCard } from "../recipe-card";
import { recipes } from "../catalog/recipes";

export const metadata: Metadata = {
  title: "Любими рецепти | Chefo's Recipes",
  description: "Запазени идеи и любими рецепти в Chefo's Recipes."
};

const sampleFavorites = recipes.slice(0, 3);

export default function FavoritesPage() {
  return (
    <section className="page-shell space-y-10">
      <div className="grid gap-8 rounded-[2rem] border border-stone-200 bg-white/70 p-6 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.42fr)] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Chefo&apos;s Recipes
          </p>
          <h1 className="mt-2 text-5xl font-bold leading-tight text-stone-950 sm:text-6xl">
            Любими рецепти
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
            Тук ще се пазят рецептите, които искаш да приготвиш по-късно.
          </p>
        </div>

        <div className="info-card rounded-[1.7rem] p-5">
          <p className="text-base font-black text-brand-800">Скоро в профила</p>
          <p className="mt-2 text-base leading-7 text-stone-600">
            Любимите ще се пазят в твоето лично пространство.
          </p>
        </div>
      </div>

      <Link
        className="inline-flex rounded-full bg-brand-600 px-6 py-3 text-base font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
        href="/catalog"
      >
        Разгледай каталога
      </Link>

      <section className="space-y-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Любими идеи
          </p>
          <h2 className="mt-2 text-4xl font-bold text-stone-950">
            Така ще изглеждат запазените рецепти
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 xl:gap-8">
          {sampleFavorites.map((recipe, index) => (
            <RecipeCard
              className="min-h-[440px]"
              key={recipe.slug}
              recipe={recipe}
              tagLimit={2}
              visualIndex={index}
            />
          ))}
        </div>
      </section>

      <section className="info-note rounded-[2rem] p-8 text-center shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
          Още няма рецепти
        </p>
        <h2 className="mt-3 text-3xl font-bold text-stone-950">
          Все още няма запазени рецепти
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-stone-600">
          Когато запазиш първата си рецепта, тя ще се появи тук за бързо връщане към нея.
        </p>
      </section>
    </section>
  );
}
