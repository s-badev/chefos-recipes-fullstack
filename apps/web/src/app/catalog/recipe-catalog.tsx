"use client";

import { useEffect, useMemo, useState } from "react";
import { RecipeCard } from "../recipe-card";
import { recipes } from "./recipes";

const allCategoriesLabel = "Всички";
const catalogPageSize = 8;

type RecipeCatalogProps = {
  favoriteSlugs?: string[];
};

export function RecipeCatalog({ favoriteSlugs = [] }: RecipeCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(allCategoriesLabel);
  const [currentPage, setCurrentPage] = useState(1);
  const favoriteSlugSet = useMemo(() => new Set(favoriteSlugs), [favoriteSlugs]);

  const categories = useMemo(
    () => [allCategoriesLabel, ...Array.from(new Set(recipes.map((recipe) => recipe.category)))],
    []
  );

  const filteredRecipes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("bg-BG");

    return recipes.filter((recipe) => {
      const matchesCategory =
        selectedCategory === allCategoriesLabel || recipe.category === selectedCategory;
      const searchableText = [recipe.title, recipe.description, recipe.category, ...recipe.tags]
        .join(" ")
        .toLocaleLowerCase("bg-BG");

      return matchesCategory && searchableText.includes(normalizedSearch);
    });
  }, [searchTerm, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / catalogPageSize));
  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * catalogPageSize,
    currentPage * catalogPageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <section className="page-shell space-y-9">
      <div className="catalog-hero-panel grid gap-6 rounded-[2rem] border border-stone-200 bg-white/78 p-5 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.48fr)] lg:items-end xl:p-7">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Chefo&apos;s Recipes
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-stone-950 sm:text-[2.875rem]">
            Каталог с рецепти
          </h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-[#4a2a17]">
            Разгледай подбраните рецепти, филтрирай по категория и намери нещо подходящо за
            днешното готвене.
          </p>
        </div>

        <div className="catalog-search-panel rounded-[1.5rem] border border-brand-100 bg-[#fff8ee] p-4 shadow-sm">
          <label className="text-base font-black text-stone-800" htmlFor="recipe-search">
            Търсене
          </label>
          <input
            className="catalog-search-input mt-2.5 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            id="recipe-search"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Търси рецепта, категория или таг..."
            type="search"
            value={searchTerm}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-[1.6rem] border border-stone-200 bg-white/72 p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
              Филтри
            </p>
            <h2 className="mt-1 text-2xl font-bold text-stone-950">Избери категория</h2>
          </div>
          <p className="inline-flex w-fit rounded-full border border-brand-100 bg-[#fff8ee] px-3.5 py-2 text-sm font-bold text-[#3a2417] shadow-sm">
            {filteredRecipes.length} намерени рецепти
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = category === selectedCategory;

            return (
              <button
                className={[
                  "rounded-full border px-4 py-2 text-sm font-black transition",
                  isSelected
                    ? "border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-900/20"
                    : "border-stone-200 bg-white/86 text-stone-700 hover:border-brand-300 hover:text-brand-800"
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

      {filteredRecipes.length > 0 ? (
        <div className="space-y-5">
          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
            {paginatedRecipes.map((recipe, index) => (
              <RecipeCard
                favoriteRedirectTo="/catalog"
                isFavorited={favoriteSlugSet.has(recipe.slug)}
                key={recipe.slug}
                recipe={recipe}
                showFavoriteAction
                visualIndex={index}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-[1.7rem] border border-stone-200 bg-white/84 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <button
              className="rounded-full border border-stone-200 px-5 py-2.5 text-base font-black text-stone-700 transition enabled:hover:border-brand-300 enabled:hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              type="button"
            >
              Предишна
            </button>
            <p className="text-center text-base font-black text-stone-700">
              Страница {currentPage} от {totalPages}
            </p>
            <button
              className="rounded-full border border-stone-200 px-5 py-2.5 text-base font-black text-stone-700 transition enabled:hover:border-brand-300 enabled:hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              type="button"
            >
              Следваща
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-brand-200 bg-white/86 p-10 text-center shadow-sm">
          <h3 className="text-3xl font-bold text-stone-950">Няма намерени рецепти</h3>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-stone-600">
            Опитай с друга дума за търсене или избери различна категория.
          </p>
        </div>
      )}
    </section>
  );
}
