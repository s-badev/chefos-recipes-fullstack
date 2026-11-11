/** UTC ISO week: Thursday determines the week-year, Monday starts each week. */
export function isoWeek(date: Date): number {
  const thursday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7));
  const start = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  return Math.ceil(((thursday.getTime() - start.getTime()) / 86400000 + 1) / 7);
}

export function weeklyRecipe<T>(recipes: readonly T[], date = new Date()): { recipe: T; number: string } {
  if (!recipes.length) throw new Error("A curated recipe is required");
  const index = (isoWeek(date) - 1) % recipes.length;
  return { recipe: recipes[index], number: String(index + 1).padStart(2, "0") };
}
