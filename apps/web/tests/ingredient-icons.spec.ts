import { expect, test } from "@playwright/test";
import { recipes } from "../src/data/recipes";
import { INGREDIENT_ICON_RULES, ingredientIconKey, productCountLabel } from "../src/lib/ingredient-icons";

/** Lines allowed to fall back to the stitched rhombus, each with its reason. Empty: every curated line has its icon. */
const ALLOWED_FALLBACK: Record<string, string> = {};

/** Lines a manually added recipe is likely to have (round 4: icons beyond the curated 24). */
const MANUAL_LINES = ["4 с.л. соев сос", "1 с.л. сусам", "1 ч.л. настърган джинджифил", "2 с.л. нишесте", "200 мл сметана", "100 г шоколад", "4 ябълки", "2 тиквички", "2 патладжана", "500 г филе от сьомга", "300 г червена леща", "100 г бадеми"];

test("coverage: every one of the curated ingredient lines gets a concrete icon", () => {
  const lines = recipes.flatMap(recipe => recipe.ingredients);
  expect(lines.length).toBe(172);
  const missing = lines.filter(line => ingredientIconKey(line) === "fallback" && !(line in ALLOWED_FALLBACK));
  expect(missing).toEqual([]);
  // Every rule is used by the curated data or by typical manual (admin) recipe lines, so nothing is drawn for nothing.
  const used = new Set([...lines, ...MANUAL_LINES].map(ingredientIconKey));
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

test("manual recipes: the new keys, and the specific before the general", () => {
  const cases: Array<[string, string]> = [
    ["4 с.л. соев сос", "soy-sauce"], ["200 мл доматен сос", "tomato"], ["1 с.л. сусам", "sesame"], ["1 ч.л. джинджифил", "ginger"],
    ["2 с.л. нишесте", "starch"], ["200 мл сметана", "cream"], ["100 г шоколад", "chocolate"], ["3 с.л. какао", "cocoa"],
    ["4 ябълки", "apple"], ["2 тиквички", "zucchini"], ["700 г настъргана тиква", "pumpkin"], ["2 патладжана", "eggplant"],
    ["2 риби", "fish"], ["500 г филе от сьомга", "fish"], ["300 г леща", "legumes"], ["200 г нахут", "legumes"], ["1 ч.ч. грах", "legumes"],
    ["350 г бял боб", "beans"], ["100 г бадеми", "nuts"], ["50 г лешници", "nuts"], ["2 с.л. фъстъци", "nuts"], ["40 г орехи", "walnuts"]
  ];
  for (const [line, key] of cases) expect(ingredientIconKey(line), line).toBe(key);
  // A sauce that is not soy sauce is not drawn as soy sauce.
  expect(ingredientIconKey("200 мл сос")).not.toBe("soy-sauce");
});
