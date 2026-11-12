import { expect, test } from "@playwright/test";
import { readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { recipes } from "../src/data/recipes";
import { transliterateRecipeName } from "../src/lib/transliteration";
const require = createRequire(import.meta.url);
const { createLoader } = require("../scripts/load-typescript.cjs");
const root = fileURLToPath(new URL("../", import.meta.url));

test("Bulgarian transliteration: all specified letters, й/ь, NFC, case and preserved invalid punctuation", () => {
  expect(transliterateRecipeName("Ж Х Ц Ч Ш Щ Ъ Ю Я Й Ь")).toBe("zh-h-ts-ch-sh-sht-a-yu-ya-y-y");
  expect(transliterateRecipeName("ПЪРЖЕНИ ФИЛИЙКИ")).toBe("parzheni-filiyki");
  expect(transliterateRecipeName("й".normalize("NFD"))).toBe("y");
  expect(transliterateRecipeName("  Пиле терияки ")).toBe("pile-teriyaki");
  expect(transliterateRecipeName("../пиле%2f")).toBe("../pile%2f");
});

test("all 24 curated titles transliterate to the existing original filenames, with no filename changes", async () => {
  const files = new Set(await readdir(path.join(root, "public/images/recipes")));
  expect(recipes).toHaveLength(24);
  const mismatches = recipes.flatMap(recipe => {
    const name = transliterateRecipeName(recipe.title) + ".png";
    return name === path.basename(recipe.imageSrc!) && files.has(name) ? [] : [{ title: recipe.title, name, file: recipe.imageSrc }];
  });
  expect(mismatches).toEqual([]);
});

const manual = (slug: string) => ({ ...recipes[0], slug, title: slug === "пиле-терияки" ? "Пиле терияки" : "Без собствена снимка", imageSrc: "/images/recipes/musaka-s-kartofi.png", imageAlt: undefined, ingredients: [], steps: [] });

function mockedWeb() {
  const probes: string[] = [];
  const repositoryQueries: unknown[] = [];
  const records = [manual("пиле-терияки"), manual("без-снимка"), manual("пиле-тариаки")];
  const load = createLoader({
    "server-only": {},
    "./repository": {
      findRecipes: async (query: unknown) => { repositoryQueries.push(query); return { items: records, total: records.length }; },
      findPublicRecipeBySlug: async (slug: string) => records.find(recipe => recipe.slug === slug) ?? null
    },
    "node:fs/promises": { stat: async (file: string) => {
      probes.push(file);
      if (path.basename(file) === "pile-teriyaki.webp") return { isFile: () => true };
      throw Object.assign(new Error("Missing test master"), { code: "ENOENT" });
    } },
    "next/image": { __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => React.createElement("img", { src, alt }) },
    "next/link": { __esModule: true, default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => React.createElement("a", { href, ...props }, children) },
    "./card-heart": { CardHeart: () => null },
    "../../../server/favorites/service": { isCurrentUserFavoriteRecipe: async () => false },
    "./recipe-favorite": { RecipeFavorite: () => null },
    "../../print-recipe-button": { PrintRecipeButton: () => null },
    "./back-to-catalog": { BackToCatalog: () => null },
    "next/navigation": { notFound: () => { throw new Error("Not found"); } }
  });
  return { load, probes, repositoryQueries };
}

test("repository mock: missing master keeps StitchStar; matching master appears in catalog/home tile and detail hero", async ({ page, baseURL }) => {
  const { load, probes, repositoryQueries } = mockedWeb();
  const { getCatalogCards } = load(path.join(root, "src/server/recipes/catalog.ts"));
  const { RecipeTile } = load(path.join(root, "src/app/recipe-tile.tsx"));
  const { default: Detail } = load(path.join(root, "src/app/catalog/[slug]/page.tsx"));
  const cards = await getCatalogCards();
  expect(repositoryQueries).toEqual([{ offset: 0, limit: 50, publicOnly: true }]);
  for (const [slug, photo] of [["пиле-терияки", true], ["без-снимка", false], ["пиле-тариаки", false]] as const) {
    const recipe = cards.find((card: { slug: string }) => card.slug === slug);
    for (const redirectTo of ["/catalog", "/"]) {
      const markup = renderToStaticMarkup(React.createElement(RecipeTile, { recipe, saved: false, redirectTo, reveal: false }));
      await page.setContent(`<base href="${baseURL}">${markup}`);
      await expect(page.locator(".ci img")).toHaveCount(photo ? 1 : 0);
      await expect(page.locator(".ci-empty .stitch-star")).toHaveCount(photo ? 0 : 1);
      if (photo) {
        await expect(page.locator(".ci img")).toHaveAttribute("alt", "Снимка на Пиле терияки");
        await expect.poll(() => page.locator(".ci img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      }
    }
    await page.setContent(`<base href="${baseURL}">${renderToStaticMarkup(await Detail({ params: Promise.resolve({ slug }) }))}`);
    await expect(page.locator(".r-hero")).toHaveAttribute("data-photo", photo ? "yes" : "none");
    await expect(page.locator(".r-hero img")).toHaveCount(photo ? 1 : 0);
    if (photo) await expect(page.locator(".r-hero img")).toHaveAttribute("src", "/images/recipes-web/pile-teriyaki.webp");
  }
  // Catalog and detail share positive/negative existence results; no database is loaded.
  expect(probes.map(file => path.basename(file)).sort()).toEqual(["bez-snimka.webp", "pile-tariaki.webp", "pile-teriyaki.webp"]);
});

test("invalid slugs never reach filesystem; own/curated photos bypass lookup; missing results are cached", async () => {
  const { load } = mockedWeb();
  const { createWebRecipeImageResolver } = load(path.join(root, "src/server/recipes/web-image.ts"));
  const probes: string[] = [];
  const resolve = createWebRecipeImageResolver(async (name: string) => { probes.push(name); return false; });
  for (const slug of ["../пиле", "пиле/терияки", "пиле\\терияки", "пиле%2f", "пиле?x", "пиле\u0000", "foo bar", "foo.bar"]) {
    expect((await resolve(manual(slug))).imageSrc).toBe(manual(slug).imageSrc);
  }
  await resolve(recipes[0]);
  await resolve({ ...manual("ръчна"), imageSrc: "/custom-own-photo.webp" });
  expect(probes).toEqual([]);
  await Promise.all([resolve(manual("липсва")), resolve(manual("липсва"))]);
  await resolve(manual("липсва"));
  expect(probes).toEqual(["lipsva"]);
});

test("public-only detail lookup never probes files for a hidden/missing record", async () => {
  const { load, probes } = mockedWeb();
  const { getWebRecipeForDetails } = load(path.join(root, "src/server/recipes/web-details.ts"));
  expect(await getWebRecipeForDetails("hidden-generated-record")).toBeNull();
  expect(probes).toEqual([]);
});
