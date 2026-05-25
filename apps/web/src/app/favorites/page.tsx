import type { Metadata } from "next";
import Link from "next/link";
import { RecipeCard } from "../recipe-card";
import { getCurrentUserFavoriteRecipes } from "../../server/favorites/service";

export const metadata: Metadata = {
  title: "Любими рецепти | Chefo's Recipes",
  description: "Запазени идеи и любими рецепти в Chefo's Recipes."
};

export default async function FavoritesPage() {
  const favoriteRecipes = await getCurrentUserFavoriteRecipes();

  return (
    <section className="page-shell space-y-8">
      <div className="rounded-[2rem] border border-stone-200 bg-white/70 p-5 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
          Chefo&apos;s Recipes
        </p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-stone-950 sm:text-[2.875rem]">
          Любими рецепти
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
          Тук ще се пазят рецептите, които искаш да приготвиш по-късно.
        </p>
      </div>

      <Link
        className="inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
        href="/catalog"
      >
        Разгледай каталога
      </Link>

      {favoriteRecipes.length > 0 ? (
        <section className="space-y-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
              Любими идеи
            </p>
            <h2 className="mt-2 text-3xl font-bold text-stone-950 sm:text-[2.125rem]">
              Твоите запазени рецепти
            </h2>
          </div>

          <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
            {favoriteRecipes.map((recipe, index) => (
              <RecipeCard
                className="min-h-[440px]"
                favoriteRedirectTo="/favorites"
                isFavorited
                key={recipe.slug}
                recipe={recipe}
                showFavoriteAction
                tagLimit={2}
                visualIndex={index}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="info-note rounded-[2rem] p-6 text-center shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Още няма рецепти
          </p>
          <h2 className="mt-2 text-2xl font-bold text-stone-950">
            Все още няма запазени рецепти
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-stone-600">
            Когато запазиш първата си рецепта, тя ще се появи тук за бързо връщане към нея.
          </p>
          <Link
            className="mt-5 inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
            href="/catalog"
          >
            Разгледай каталога
          </Link>
        </section>
      )}
    </section>
  );
}
