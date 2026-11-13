const path = require("node:path");
const { createLoader } = require("./load-typescript.cjs");
require("@next/env").loadEnvConfig(path.resolve(__dirname, ".."));
const { listPublicCatalogRecipes } = createLoader()(path.resolve(__dirname, "../src/server/recipes/service.ts"));
// The bounded public repository query is read-only. Never log credentials or connection settings.
listPublicCatalogRecipes({ page: 1, pageSize: 50 }).then(page => {
  console.log(JSON.stringify(page.items.filter(recipe => /тери|тари|teriyaki/i.test(recipe.title + recipe.slug)).map(({ title, slug, imageSrc }) => ({ title, slug, imageSrc })), null, 2));
}).catch(error => { console.error(error.name, "Read-only recipe inspection failed"); process.exitCode = 1; });
