"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCatalog } from "../../hooks/use-catalog";
import type { CardRecipe } from "../../lib/catalog";
import { recipeCountLabel } from "../../lib/format";
import { RecipeTile, type TileVariant } from "../recipe-tile";
import { SplitWords } from "../split-heading";

/** The catalog rhythm from the mock: wide, then smaller cards, never an even 3- or 4-up grid. */
const PATTERN: TileVariant[] = ["wide", "half", "half", "half", "half", "wide"];

type RecipeCatalogProps = {
  favoriteSlugs?: string[];
  recipes: CardRecipe[];
  /** ?q= and ?category= read on the server, so the first render is already filtered. */
  initialQuery?: string;
  initialCategory?: string;
};

export function RecipeCatalog({ favoriteSlugs = [], recipes, initialQuery = "", initialCategory = "" }: RecipeCatalogProps) {
  const searchInput = useRef<HTMLInputElement>(null);
  const { setSearchTerm, selectedCategory, setSelectedCategory, categories, filteredRecipes, filtered, clear, catalogHref } = useCatalog(recipes, searchInput, { q: initialQuery, category: initialCategory });
  const favoriteSlugSet = useMemo(() => new Set(favoriteSlugs), [favoriteSlugs]);
  const categoryCount = categories.length - 1;

  // A filter change fades the cards out, swaps the list and fades the new cards in (opacity and
  // transform only); without motion the list simply changes.
  const [shown, setShown] = useState(filteredRecipes);
  const [swapping, setSwapping] = useState(false);
  useEffect(() => {
    if (shown === filteredRecipes) {
      // The new list is in place: fade it in on the frame after it was painted at opacity 0.
      if (!swapping) return;
      let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => setSwapping(false)); });
      return () => cancelAnimationFrame(frame);
    }
    if (document.documentElement.dataset.motion !== "on") { setShown(filteredRecipes); return; }
    setSwapping(true);
    const timer = setTimeout(() => setShown(filteredRecipes), 220);
    return () => clearTimeout(timer);
  }, [filteredRecipes, shown, swapping]);

  return (
    <>
      <div className="wrap cat-head">
        <p className="eyebrow rv">{recipeCountLabel(recipes.length)} · {categoryCount} {categoryCount === 1 ? "категория" : "категории"}</p>
        <h1 data-split><SplitWords text="Всички" /> <em><SplitWords start={1} text="рецепти" /></em></h1>
        <label className="search rv">
          <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <span className="sr-only">Търсене</span>
          <input autoComplete="off" defaultValue={initialQuery} onChange={event => setSearchTerm(event.target.value)} placeholder="Търси рецепта, продукт или категория" ref={searchInput} type="search" />
        </label>
      </div>
      <div className="fbar">
        <div className="wrap">
          <div aria-label="Категории" className="tabs" role="group">
            {categories.map(category => (
              <button aria-pressed={category.name === selectedCategory} className="tab" key={category.name} onClick={() => setSelectedCategory(category.name)} type="button">
                {category.name}<sup aria-hidden="true">{category.count}</sup>
              </button>
            ))}
          </div>
          <div className="fbar-end">
            {filtered ? <button className="clear" onClick={clear} type="button">Изчисти</button> : null}
            <p aria-live="polite" className="count">{recipeCountLabel(filteredRecipes.length)}</p>
          </div>
        </div>
      </div>
      <div className="wrap cat-grid">
        <div className={swapping ? "cards cat swap" : "cards cat"}>
          {shown.map((recipe, index) => (
            <RecipeTile
              index={index}
              key={recipe.slug}
              priority={index < 3}
              recipe={recipe}
              redirectTo={catalogHref}
              reveal={false}
              saved={favoriteSlugSet.has(recipe.slug)}
              variant={PATTERN[index % PATTERN.length]}
            />
          ))}
        </div>
        {filteredRecipes.length === 0 ? (
          <div className="empty">
            <h2>Няма намерени рецепти</h2>
            <span>Опитай с друга дума или изчисти филтъра.</span>
          </div>
        ) : null}
      </div>
    </>
  );
}
