"use client";

import { useEffect, useMemo, useState } from "react";
import { RecipeCard } from "../recipe-card";
import { recipes } from "./recipes";

const allCategoriesLabel = "Всички";
const catalogPageSize = 8;

export function RecipeCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(allCategoriesLabel);
  const [currentPage, setCurrentPage] = useState(1);

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
    <section className="page-shell space-y-10">
      <div className="grid gap-8 rounded-[2rem] border border-stone-200 bg-white/72 p-6 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.52fr)] lg:items-end xl:p-10">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Chefo&apos;s Recipes
          </p>
          <h1 className="mt-2 text-5xl font-bold leading-tight text-stone-950 sm:text-6xl">
            Каталог с рецепти
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">
            Разгледай подбраните рецепти, филтрирай по категория и намери нещо подходящо за
            днешното готвене.
          </p>
        </div>

        <div className="rounded-[1.7rem] border border-stone-200 bg-[#fffaf3] p-5 shadow-sm">
          <label className="text-base font-black text-stone-800" htmlFor="recipe-search">
            Търсене
          </label>
          <input
            className="mt-3 w-full rounded-2xl border border-stone-200 bg-white px-5 py-4 text-lg text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            id="recipe-search"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Търси рецепта, категория или таг..."
            type="search"
            value={searchTerm}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
              Филтри
            </p>
            <h2 className="mt-1 text-2xl font-bold text-stone-950">Избери категория</h2>
          </div>
          <p className="text-base font-bold text-stone-500">
            {filteredRecipes.length} намерени рецепти
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = category === selectedCategory;

            return (
              <button
                className={[
                  "rounded-full border px-5 py-2.5 text-base font-black transition",
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
        <div className="space-y-7">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {paginatedRecipes.map((recipe, index) => (
              <RecipeCard key={recipe.slug} recipe={recipe} visualIndex={index} />
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
