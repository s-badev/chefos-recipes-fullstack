/**
 * Which drawn icon stands in front of an ingredient line ("4 зрели домата" → tomato).
 * Pure and data-only: the drawings live in src/components/ingredient-icon.tsx.
 *
 * The rules run in order, the specific before the general: "прясно мляко" is not "кисело мляко",
 * "червен пипер" (paprika) is not "червени чушки" (peppers), "кисело зеле" is not "зелка".
 * A line that lists several seasonings ("Чубрица, сол и черен пипер") gets the shared spices icon;
 * a line of alternatives ("Сирене, мед или сладко за сервиране") gets the icon of the first one.
 * Anything unknown (a manually added admin recipe) gets the stitched rhombus, so rows stay aligned.
 */
export const INGREDIENT_ICON_RULES = [
  ["sauerkraut", /кисело зеле/],
  ["yogurt", /кисело мляко/],
  ["fresh-milk", /прясно мляко|\bмляко\b/],
  ["pastry", /кори за (баница|баклава)/],
  ["baking-soda", /сода бикарбонат/],
  ["beans", /\bбоб\b/],
  ["paprika", /червен пипер/],
  ["peppers", /чушк/],
  ["cabbage", /зелк/],
  ["kashkaval", /кашкавал/],
  ["cheese", /сирене/],
  ["tomato", /домат/],
  ["cucumber", /краставиц/],
  ["leek", /\bпраз\b/],
  ["garlic", /чесън/],
  ["onion", /\bлук\b/],
  ["egg", /яйц|яйце/],
  ["butter", /масло/],
  ["oil", /олио/],
  ["vinegar", /оцет/],
  ["flour", /брашно/],
  ["yeast", /\bмая\b/],
  ["sugar", /захар/],
  ["walnuts", /орех/],
  ["rice", /ориз/],
  ["potato", /картоф/],
  ["carrot", /морков/],
  ["mushroom", /гъб/],
  ["pumpkin", /тиква/],
  ["chicken", /пилешк/],
  ["tripe", /шкембе/],
  ["ham", /шунка/],
  ["mince", /кайма/],
  ["meat", /свинск|телешк|агнешк|месо/],
  ["broth", /бульон/],
  ["water", /\bвода\b/],
  ["wine", /\bвино\b/],
  ["lemon", /лимон/],
  ["cocoa", /какао/],
  ["biscuits", /бисквит/],
  ["bread", /хляб|филии/],
  ["noodles", /фиде/],
  ["celery", /целина/],
  ["cinnamon", /канела/],
  ["vanilla", /ванилия/],
  ["herbs", /магданоз|копър|джоджен|чубрица|босилек|мащерка/],
  ["salt", /\bсол\b/]
] as const;

export type IngredientIconKey = (typeof INGREDIENT_ICON_RULES)[number][0] | "spices" | "fallback";

/** "\b" does not see Cyrillic letters as word characters, so word edges are marked by hand. */
function wordBoundaries(pattern: RegExp) {
  return new RegExp(pattern.source.replace(/\\b/g, "(?:^|$|(?<=[\\s,.;:()])|(?=[\\s,.;:()]))"), "u");
}
const RULES = INGREDIENT_ICON_RULES.map(([key, pattern]) => [key, wordBoundaries(pattern)] as const);
const SEASONINGS = wordBoundaries(/\bсол\b|пипер|чубрица|джоджен|магданоз|копър|оцет|олио/);

function single(text: string): IngredientIconKey {
  return RULES.find(([, pattern]) => pattern.test(text))?.[0] ?? "fallback";
}

export function ingredientIconKey(line: string): IngredientIconKey {
  const text = line.toLocaleLowerCase("bg-BG").trim();
  if (!text) return "fallback";
  // Alternatives: the first one is what goes on the table.
  if (/\sили\s/u.test(text)) return single(text.split(/,|\sили\s/u)[0]);
  // Several products on one line: seasonings together get the shared spices icon.
  const parts = text.split(/,|\sи\s/u).map(part => part.trim()).filter(Boolean);
  if (parts.length > 1) return parts.every(part => SEASONINGS.test(part)) ? "spices" : single(parts[0]);
  return single(text);
}

/** "1 продукт" / "8 продукта". */
export function productCountLabel(count: number): string {
  return count === 1 ? "1 продукт" : `${count} продукта`;
}
