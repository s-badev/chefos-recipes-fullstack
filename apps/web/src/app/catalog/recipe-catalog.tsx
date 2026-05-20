"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { recipes } from "./recipes";

const allCategoriesLabel = "Всички";
const catalogPageSize = 8;

function getFoodVisualClass(category: string) {
  const normalizedCategory = category.toLocaleLowerCase("bg-BG");

  if (normalizedCategory.includes("сал")) {
    return "food-visual--salad";
  }

  if (normalizedCategory.includes("тест") || normalizedCategory.includes("печ")) {
    return "food-visual--baked";
  }

  if (normalizedCategory.includes("суп")) {
    return "food-visual--soup";
  }

  if (normalizedCategory.includes("дес")) {
    return "food-visual--dessert";
  }

  return "food-visual--stew";
}

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
    <section className="space-y-10">
      <div className="-mx-6 grid gap-8 bg-white/35 px-6 py-8 sm:-mx-8 sm:px-8 lg:-mx-12 lg:grid-cols-[minmax(0,1fr)_minmax(430px,0.55fr)] lg:items-end lg:px-12 xl:-mx-16 xl:px-16 2xl:-mx-20 2xl:px-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
            Chefo’s Recipes
          </p>
          <h2 className="mt-2 text-4xl font-bold text-stone-950 sm:text-5xl">
            Каталог с рецепти
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">
            Разгледай подбраните рецепти, филтрирай по категория и намери нещо подходящо за
            днешното готвене.
          </p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <label className="text-sm font-bold text-stone-800" htmlFor="recipe-search">
            Търсене
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            id="recipe-search"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Търси рецепта..."
            type="search"
            value={searchTerm}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold text-stone-800">Категория</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = category === selectedCategory;

            return (
              <button
                className={[
                  "rounded-full border px-4 py-2 text-sm font-bold transition",
                  isSelected
                    ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                    : "border-stone-200 bg-white text-stone-700 hover:border-brand-300 hover:text-brand-800"
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
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-6 2xl:grid-cols-4">
            {paginatedRecipes.map((recipe) => (
              <Link
                className="recipe-card group flex min-h-[420px] flex-col overflow-hidden rounded-3xl p-5"
                href={`/catalog/${recipe.slug}`}
                key={recipe.slug}
              >
                <div
                  aria-label={`Илюстрация за ${recipe.title}`}
                  className={[
                    "food-visual -mx-5 -mt-5 mb-5 h-40 transition duration-300 group-hover:scale-[1.02]",
                    getFoodVisualClass(recipe.category)
                  ].join(" ")}
                  role="img"
                />
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
                    {recipe.category}
                  </span>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">
                    {recipe.difficulty}
                  </span>
                </div>

                <div className="mt-5 flex-1">
                  <h3 className="text-[1.6rem] font-bold leading-tight text-stone-950 group-hover:text-brand-800 xl:text-[1.7rem]">
                    {recipe.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-stone-600">{recipe.description}</p>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-y border-stone-100 py-4 text-sm">
                  <div>
                    <p className="text-[0.8rem] font-semibold text-stone-500">Време за подготовка</p>
                    <p className="mt-1 text-base font-bold text-stone-950">{recipe.prepTimeMinutes} мин</p>
                  </div>
                  <div>
                    <p className="text-[0.8rem] font-semibold text-stone-500">Време за готвене</p>
                    <p className="mt-1 text-base font-bold text-stone-950">{recipe.cookTimeMinutes} мин</p>
                  </div>
                  <div>
                    <p className="text-[0.8rem] font-semibold text-stone-500">Порции</p>
                    <p className="mt-1 text-base font-bold text-stone-950">{recipe.servings}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <span
                        className="rounded-full bg-stone-100 px-3 py-1 text-[0.8rem] font-medium text-stone-600"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <button
              className="rounded-full border border-stone-200 px-4 py-2 text-sm font-bold text-stone-700 transition enabled:hover:border-brand-300 enabled:hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              type="button"
            >
              Предишна
            </button>
            <p className="text-center text-sm font-bold text-stone-700">
              Страница {currentPage} от {totalPages}
            </p>
            <button
              className="rounded-full border border-stone-200 px-4 py-2 text-sm font-bold text-stone-700 transition enabled:hover:border-brand-300 enabled:hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              type="button"
            >
              Следваща
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-brand-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-stone-950">Няма намерени рецепти</h3>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Опитай с друга дума за търсене или избери различна категория.
          </p>
        </div>
      )}
    </section>
  );
}
