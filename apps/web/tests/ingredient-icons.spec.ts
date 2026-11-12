import { expect, test } from "@playwright/test";
import { recipes } from "../src/data/recipes";
import { INGREDIENT_ICON_RULES, ingredientIconKey, productCountLabel } from "../src/lib/ingredient-icons";

/** Lines allowed to fall back to the stitched rhombus, each with its reason. Empty: every curated line has its icon. */
const ALLOWED_FALLBACK: Record<string, string> = {};

test("coverage: every one of the curated ingredient lines gets a concrete icon", () => {
  const lines = recipes.flatMap(recipe => recipe.ingredients);
  expect(lines.length).toBe(172);
  const missing = lines.filter(line => ingredientIconKey(line) === "fallback" && !(line in ALLOWED_FALLBACK));
  expect(missing).toEqual([]);
  // Every rule is used by the data, so the drawn set is exactly what the recipes need.
  const used = new Set(lines.map(ingredientIconKey));
  expect(INGREDIENT_ICON_RULES.map(([key]) => key).filter(key => !used.has(key))).toEqual([]);
});

test("the specific before the general: look-alike pairs get different icons", () => {
  const pairs: Array<[string, string, string, string]> = [
    ["1 л прясно мляко", "fresh-milk", "250 г кисело мляко", "yogurt"],
    ["1 ч.л. червен пипер", "paprika", "2 печени червени чушки", "peppers"],
    ["12 листа кисело зеле", "sauerkraut", "1 малка зелка", "cabbage"],
    ["500 г кори за баница", "pastry", "500 г брашно", "flour"],
    ["500 г кори за баклава", "pastry", "300 г смлени орехи", "walnuts"],
    ["1 ч.л. сода бикарбонат", "baking-soda", "1 ч.л. сол", "salt"],
    ["350 г бял боб", "beans", "150 г бяло сирене", "cheese"],
    ["100 г кашкавал", "kashkaval", "300 г сирене", "cheese"],
    ["500 г цедено кисело мляко", "yogurt", "80 мл прясно мляко", "fresh-milk"],
    ["500 г пилешко месо", "chicken", "700 г свинска плешка", "meat"],
    ["1 малка глава червен лук", "onion", "3 стръка праз", "leek"]
  ];
  for (const [a, keyA, b, keyB] of pairs) {
    expect(ingredientIconKey(a), a).toBe(keyA);
    expect(ingredientIconKey(b), b).toBe(keyB);
  }
});

test("lines with several products: seasonings share one icon; alternatives take the first", () => {
  expect(ingredientIconKey("Чубрица, сол и черен пипер")).toBe("spices");
  expect(ingredientIconKey("Магданоз и сол на вкус")).toBe("spices");
  expect(ingredientIconKey("Оцет, сол и лют пипер")).toBe("spices");
  expect(ingredientIconKey("Олио за пържене")).toBe("oil");
  expect(ingredientIconKey("Пудра захар за сервиране")).toBe("sugar");
  expect(ingredientIconKey("Сирене, мед или сладко за сервиране")).toBe("cheese");
});

test("an unknown line (a manually added recipe) gets the stitched rhombus", () => {
  for (const line of ["2 бр. авокадо", "Щипка шафран", "", "   "]) expect(ingredientIconKey(line), line).toBe("fallback");
});

test("static count with the right form", () => {
  expect(productCountLabel(1)).toBe("1 продукт");
  expect(productCountLabel(2)).toBe("2 продукта");
  expect(productCountLabel(8)).toBe("8 продукта");
});
