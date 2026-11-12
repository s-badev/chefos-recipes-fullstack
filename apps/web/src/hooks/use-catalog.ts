"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { filterCatalog, type CardRecipe } from "../lib/catalog";
import { rememberCatalogHref } from "../lib/catalog-return";
import { sofraCategories } from "../lib/sofra";

const ALL = "Всички";

function locationState() {
  const params = new URLSearchParams(window.location.search);
  return { q: params.get("q") ?? "", category: params.get("category") ?? ALL };
}

/**
 * Catalog search and category, kept in the URL (?q=, ?category=) with a 250 ms debounce and
 * back/forward support. Every matching recipe is returned (no pages; the server bounds the list).
 * The search field is uncontrolled: text typed before hydration is read from the field on mount
 * and wins over the URL, so nothing the visitor typed is lost.
 */
export function useCatalog(recipes: readonly CardRecipe[], searchInput: RefObject<HTMLInputElement | null>, initial = { q: "", category: "" }) {
  const [searchTerm, setSearchTerm] = useState(initial.q);
  const [query, setQuery] = useState(initial.q);
  const [selectedCategory, setSelectedCategory] = useState(initial.category || ALL);
  const [ready, setReady] = useState(false);
  const fromHistory = useRef(false);

  useEffect(() => {
    function read(initial: boolean) {
      const value = locationState();
      const typed = initial ? searchInput.current?.value ?? "" : "";
      const term = typed && typed !== value.q ? typed : value.q;
      if (searchInput.current && searchInput.current.value !== term) searchInput.current.value = term;
      // Text from the URL needs no new history entry; typed text does (via the debounce below).
      fromHistory.current = term === value.q;
      setSearchTerm(term); setQuery(value.q); setSelectedCategory(value.category); setReady(true);
    }
    read(true);
    const onPop = () => read(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [searchInput]);

  useEffect(() => {
    if (!ready) return;
    if (fromHistory.current) {
      fromHistory.current = false;
      const location = locationState();
      // A keystroke can arrive before the mount/history effect was consumed. Only skip
      // when state still matches that URL; never discard a newer user edit.
      if (searchTerm === location.q && selectedCategory === location.category) return;
    }
    const timer = setTimeout(() => {
      setQuery(searchTerm);
      const url = new URL(window.location.href);
      searchTerm.trim() ? url.searchParams.set("q", searchTerm.trim()) : url.searchParams.delete("q");
      selectedCategory !== ALL ? url.searchParams.set("category", selectedCategory) : url.searchParams.delete("category");
      if (url.search !== window.location.search) window.history.pushState(null, "", url.pathname + url.search + url.hash);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, ready]);

  // Tabs in the table's order (Салати, Супи, Основни, …) with their counts.
  const categories = useMemo(() => [{ name: ALL, count: recipes.length }, ...sofraCategories(recipes).map(({ name, count }) => ({ name, count }))], [recipes]);
  const filteredRecipes = useMemo(() => filterCatalog(recipes, query, selectedCategory), [recipes, query, selectedCategory]);
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (selectedCategory !== ALL) params.set("category", selectedCategory);
  const catalogHref = `/catalog${params.size ? `?${params}` : ""}`;
  // The recipe page's "back to the recipes" link returns to this exact view (search and category).
  useEffect(() => { if (ready) rememberCatalogHref(catalogHref); }, [catalogHref, ready]);

  return {
    searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories, filteredRecipes, catalogHref,
    filtered: Boolean(searchTerm.trim()) || selectedCategory !== ALL,
    clear: () => {
      if (searchInput.current) searchInput.current.value = "";
      setSearchTerm(""); setSelectedCategory(ALL);
    }
  };
}
