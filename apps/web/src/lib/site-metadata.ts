import type { Metadata } from "next";
import type { Recipe } from "../data/recipes";
import masters from "./web-images.json";
import { hasRecipePhoto } from "./recipe-detail";

export const PUBLIC_SITE_URL = "https://chefos-recipes.netlify.app";
export function siteOrigin(override = process.env.SITE_URL): string {
  if (!override) return PUBLIC_SITE_URL;
  try {
    const url = new URL(override);
    if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) return url.origin;
  } catch { /* An invalid optional override falls back to the public site. */ }
  return PUBLIC_SITE_URL;
}
export const SITE_URL = siteOrigin();
export const HOME_TITLE = "Chefo's Recipes — български домашни рецепти";
export const SITE_DESCRIPTION = "Подбрани български домашни рецепти с продукти, стъпки, време за приготвяне и порции – за всеки ден.";
export const SITE_IMAGE = "/images/social/site.jpg";
export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;
export const recipePath = (slug: string) => `/catalog/${encodeURIComponent(slug)}`;

export function recipeShareImage(recipe: Pick<Recipe, "slug" | "imageSrc">): string {
  if (!hasRecipePhoto(recipe)) return SITE_IMAGE;
  const name = /^\/images\/(?:recipes|recipes-web)\/([a-z0-9-]+)\.(?:png|webp)$/.exec(recipe.imageSrc ?? "")?.[1];
  return name && masters.includes(name) ? `/images/social/${name}.jpg` : SITE_IMAGE;
}

export function pageMetadata(title: string, description: string, path: string, options: { noindex?: boolean; image?: string; article?: boolean } = {}): Metadata {
  const image = { url: absoluteUrl(options.image ?? SITE_IMAGE), width: 1200, height: 630, type: "image/jpeg", alt: title };
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: { index: !options.noindex, follow: !options.noindex },
    openGraph: { title, description, url: absoluteUrl(path), type: options.article ? "article" : "website", locale: "bg_BG", siteName: "Chefo's Recipes", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] }
  };
}

export const rootMetadata: Metadata = {
  ...pageMetadata(HOME_TITLE, SITE_DESCRIPTION, "/"),
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: "%s · Chefo's Recipes" }
};

/** No queries: called with the same recipe already loaded for the detail page. */
export function recipeJsonLd(recipe: Recipe) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    image: [absoluteUrl(recipeShareImage(recipe))],
    description: recipe.description,
    prepTime: `PT${Math.max(0, recipe.prepTimeMinutes)}M`,
    cookTime: `PT${Math.max(0, recipe.cookTimeMinutes)}M`,
    recipeYield: `${recipe.servings} порции`,
    recipeCategory: recipe.category,
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.steps.map((text, index) => ({ "@type": "HowToStep", position: index + 1, text }))
  };
}

// Prevent a recipe containing </script> from escaping the JSON-LD script element.
export const serializeJsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
