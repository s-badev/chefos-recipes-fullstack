"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { filterCatalog, type CardRecipe } from "../lib/catalog";
import { rememberCatalogHref } from "../lib/catalog-return";

function locationState() {
  const params = new URLSearchParams(window.location.search);
  return { q: params.get("q") ?? "", category: params.get("category") ?? "Всички" };
}

export function useCatalog(recipes: readonly CardRecipe[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Всички");
  const [currentPage, setCurrentPage] = useState(1);
  const [ready, setReady] = useState(false);
  const fromHistory = useRef(false);
  useEffect(() => {
    function read() {
      const value = locationState(); fromHistory.current = true;
      setSearchTerm(value.q); setQuery(value.q); setSelectedCategory(value.category); setCurrentPage(1); setReady(true);
    }
    read(); window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  useEffect(() => {
    if (!ready) return;
    if (fromHistory.current) { fromHistory.current = false; return; }
    const timer = setTimeout(() => {
      setQuery(searchTerm); setCurrentPage(1);
      const url = new URL(window.location.href);
      searchTerm.trim() ? url.searchParams.set("q", searchTerm.trim()) : url.searchParams.delete("q");
      selectedCategory !== "Всички" ? url.searchParams.set("category", selectedCategory) : url.searchParams.delete("category");
      if (url.search !== window.location.search) window.history.pushState(null, "", url.pathname + url.search + url.hash);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, ready]);
  const categories = useMemo(() => ["Всички", ...new Set(recipes.map(recipe => recipe.category))], [recipes]);
  const filteredRecipes = useMemo(() => filterCatalog(recipes, query, selectedCategory), [recipes, query, selectedCategory]);
  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / 8));
  const page = Math.min(currentPage, totalPages);
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (selectedCategory !== "Всички") params.set("category", selectedCategory);
  const catalogHref = `/catalog${params.size ? `?${params}` : ""}`;
  // The recipe page's "back to catalog" link returns to this exact view (search and category).
  useEffect(() => { if (ready) rememberCatalogHref(catalogHref); }, [catalogHref, ready]);
  return { searchTerm, setSearchTerm, selectedCategory, setSelectedCategory: (value: string) => { setSelectedCategory(value); setCurrentPage(1); },
    catalogHref,
    currentPage: page, setCurrentPage, categories, filteredRecipes, totalPages,
    paginatedRecipes: filteredRecipes.slice((page - 1) * 8, page * 8),
    clear: () => { setSearchTerm(""); setSelectedCategory("Всички"); setCurrentPage(1); } };
}
