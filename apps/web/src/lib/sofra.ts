import { isoWeek } from "./weekly";

type SofraRecipe = { slug: string; category: string };

/** The table's editorial order (as in the approved mock); other categories follow alphabetically. */
const TABLE_ORDER = ["Салати", "Супи", "Основни", "Тестени", "Бързи ястия", "Десерти"];

export type SofraCategory<T extends SofraRecipe> = {
  name: string;
  count: number;
  /** The first recipe of the category in the data: its photo is the plate. */
  cover: T;
  recipes: T[];
};

/** Categories around the table, each with its count, cover dish and recipes in data order. */
export function sofraCategories<T extends SofraRecipe>(recipes: readonly T[]): SofraCategory<T>[] {
  const byName = new Map<string, T[]>();
  for (const recipe of recipes) {
    const list = byName.get(recipe.category);
    if (list) list.push(recipe); else byName.set(recipe.category, [recipe]);
  }
  const rank = (name: string) => { const index = TABLE_ORDER.indexOf(name); return index < 0 ? TABLE_ORDER.length : index; };
  return [...byName.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b, "bg"))
    .map(([name, list]) => ({ name, count: list.length, cover: list[0], recipes: list }));
}

/**
 * "Какво да сготвиш днес": five recipes for the current ISO week, never the recipe of the week.
 * The window moves by five each week, so consecutive weeks show different dishes.
 */
export function todayRecipes<T extends SofraRecipe>(recipes: readonly T[], weeklySlug: string, date = new Date()): T[] {
  const pool = recipes.filter(recipe => recipe.slug !== weeklySlug);
  if (pool.length <= 5) return [...pool];
  const start = ((isoWeek(date) - 1) * 5) % pool.length;
  return Array.from({ length: 5 }, (_, i) => pool[(start + i) % pool.length]);
}
