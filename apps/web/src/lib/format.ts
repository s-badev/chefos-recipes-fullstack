/** Visible wording shared by every recipe view, so cards, details and lists say the same thing. */

/** Cooking time: "Без готвене" for 0, otherwise "45 мин". */
export function formatCookTime(minutes: number): string {
  return minutes > 0 ? `${minutes} мин` : "Без готвене";
}

/** Total of preparation and cooking: "65 мин", or "Без готвене" when both are 0. */
export function formatTotalTime(prepMinutes: number, cookMinutes: number): string {
  return formatCookTime(prepMinutes + cookMinutes);
}

/** "1 порция" / "4 порции". */
export function servingsLabel(servings: number): string {
  return `${servings} ${servings === 1 ? "порция" : "порции"}`;
}

/** "1 рецепта" / "5 рецепти"; `pad` renders "01 рецепта". */
export function recipeCountLabel(count: number, pad = false): string {
  const number = pad ? String(count).padStart(2, "0") : String(count);
  return `${number} ${count === 1 ? "рецепта" : "рецепти"}`;
}

/** Search result count: "1 намерена рецепта" / "12 намерени рецепти". */
export function foundRecipesLabel(count: number): string {
  return count === 1 ? "1 намерена рецепта" : `${count} намерени рецепти`;
}
