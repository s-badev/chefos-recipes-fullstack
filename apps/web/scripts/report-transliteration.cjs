const path = require("node:path");
const fs = require("node:fs");
const { createLoader } = require("./load-typescript.cjs");
const root = path.resolve(__dirname, "..");
const load = createLoader();
const { recipes } = load(path.join(root, "src/data/recipes.ts"));
const { transliterateRecipeName } = load(path.join(root, "src/lib/transliteration.ts"));
const rows = recipes.map(recipe => {
  const transliteration = transliterateRecipeName(recipe.title) + ".png";
  const file = path.basename(recipe.imageSrc);
  return { title: recipe.title, transliteration, file, matches: transliteration === file && fs.existsSync(path.join(root, "public/images/recipes", file)) };
});
const out = path.resolve(root, "../../docs/redesign/shots/images-followup");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "transliteration.json"), JSON.stringify(rows, null, 2) + "\n");
console.table(rows);
console.log(JSON.stringify({ mismatches: rows.filter(row => !row.matches) }));
