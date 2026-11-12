"use client";

import { useMemo } from "react";
import { useCatalog } from "../../hooks/use-catalog";
import type { CardRecipe } from "../../lib/catalog";
import { RecipeCard } from "../recipe-card";
import { foundRecipesLabel } from "../../lib/format";

const allCategoriesLabel = "Всички";

type RecipeCatalogProps = {
  favoriteSlugs?: string[];
  recipes: CardRecipe[];
};

export function RecipeCatalog({
  favoriteSlugs = [],
  recipes
}: RecipeCatalogProps) {
  const { searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, currentPage, setCurrentPage, categories, filteredRecipes, totalPages, paginatedRecipes, clear, catalogHref } = useCatalog(recipes);
  const favoriteSlugSet = useMemo(() => new Set(favoriteSlugs), [favoriteSlugs]);


  return (
    <section className="page-shell space-y-9">
      <div className="catalog-hero-panel grid gap-6 rounded-none border border-neutral-200 bg-surface p-5  sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.48fr)] lg:items-end xl:p-7">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Chefo&apos;s Recipes
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-neutral-950 sm:text-[2.875rem]">
            Каталог с рецепти
          </h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-ink">
            Разгледай подбраните рецепти, филтрирай по категория и намери нещо подходящо за
            днешното готвене.
          </p>
        </div>

        <div className="catalog-search-panel rounded-none border border-brand-100 bg-bg p-4 ">
          <label className="text-base font-black text-neutral-800" htmlFor="recipe-search">
            Търсене
          </label>
          <input
            className="catalog-search-input mt-2.5 w-full rounded-none border border-neutral-200 bg-surface px-4 py-3 text-base text-neutral-950  transition-transform placeholder:text-muted focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            id="recipe-search"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Търси рецепта, категория или таг..."
            type="search"
            value={searchTerm}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-none border border-neutral-200 bg-surface p-4 ">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
              Филтри
            </p>
            <h2 className="mt-1 text-2xl font-bold text-neutral-950">Избери категория</h2>
          </div>
          <p className="inline-flex w-fit rounded-none border border-brand-100 bg-bg px-3.5 py-2 text-sm font-bold text-ink ">
            {foundRecipesLabel(filteredRecipes.length)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = category === selectedCategory;

            return (
              <button
                aria-pressed={isSelected}
                className={[
                  "rounded-none border px-4 py-2 text-sm font-black transition",
                  isSelected
                    ? "border-brand-600 bg-brand-600 text-white  "
                    : "border-neutral-200 bg-surface text-neutral-700 hover:border-brand-300 hover:text-brand-800"
                ].join(" ")}
                key={category}
                onClick={() => setSelectedCategory(category)}
                type="button"
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {searchTerm || selectedCategory !== allCategoriesLabel ? <button className="underline" type="button" onClick={clear}>Изчисти</button> : null}
      {filteredRecipes.length > 0 ? (
        <div className="space-y-5">
          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
            {paginatedRecipes.map((recipe, index) => (
              <RecipeCard
                favoriteRedirectTo={catalogHref}
                isFavorited={favoriteSlugSet.has(recipe.slug)}
                key={recipe.slug}
                recipe={recipe}
                priority={currentPage === 1 && index < 4}
                showFavoriteAction
                visualIndex={index}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-none border border-neutral-200 bg-surface p-4  sm:flex-row sm:items-center sm:justify-between">
            <button
              className="rounded-none border border-neutral-200 px-5 py-2.5 text-base font-black text-neutral-700 transition-transform enabled:hover:border-brand-300 enabled:hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              type="button"
            >
              Предишна
            </button>
            <p className="text-center text-base font-black text-neutral-700">
              Страница {currentPage} от {totalPages}
            </p>
            <button
              className="rounded-none border border-neutral-200 px-5 py-2.5 text-base font-black text-neutral-700 transition-transform enabled:hover:border-brand-300 enabled:hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              type="button"
            >
              Следваща
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-none border border-dashed border-brand-200 bg-surface p-10 text-center ">
          <h3 className="text-3xl font-bold text-neutral-950">Няма намерени рецепти</h3>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-neutral-600">
            Опитай с друга дума за търсене или избери различна категория.
          </p>
        </div>
      )}
    </section>
  );
}
