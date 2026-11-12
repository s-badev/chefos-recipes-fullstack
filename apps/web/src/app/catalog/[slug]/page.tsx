import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findRecipeBySlug } from "../recipes";
import { PrintRecipeButton } from "../../print-recipe-button";
import { SplitWords } from "../../split-heading";
import { webImageSrc } from "../../../lib/images";
import { formatCookTime } from "../../../lib/format";
import { categoryHref } from "../../../lib/categories";
import { curatedNumberLabel, hasRecipePhoto, missingContentNotes, stepNumber, tagLine } from "../../../lib/recipe-detail";
import { isCurrentUserFavoriteRecipe } from "../../../server/favorites/service";
import { getPublicCatalogRecipeBySlug } from "../../../server/recipes/service";
import { IngredientChecklist } from "./ingredient-checklist";
import { RecipeFavorite } from "./recipe-favorite";
import { BackToCatalog } from "./back-to-catalog";

type RecipeDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

async function getRecipeForDetails(slug: string) {
  return findRecipeBySlug(slug) ?? (await getPublicCatalogRecipeBySlug(slug));
}

export async function generateMetadata({
  params
}: RecipeDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeForDetails(slug);

  if (!recipe) {
    return {
      title: "Рецептата не е намерена | Chefo's Recipes"
    };
  }

  const path = `/catalog/${recipe.slug}`;
  const images = hasRecipePhoto(recipe) ? [{ url: webImageSrc(recipe.imageSrc!), alt: recipe.imageAlt ?? recipe.title }] : undefined;
  return {
    // Absolute URLs for canonical/Open Graph: Netlify's URL at build time, else the public site.
    metadataBase: new URL(process.env.URL ?? "https://chefos-recipes.netlify.app"),
    title: `${recipe.title} | Chefo's Recipes`,
    description: recipe.description,
    alternates: { canonical: path },
    openGraph: { type: "article", locale: "bg_BG", siteName: "Chefo's Recipes", url: path, title: recipe.title, description: recipe.description, images },
    twitter: { card: images ? "summary_large_image" : "summary", title: recipe.title, description: recipe.description, images: images?.map(image => image.url) }
  };
}

export default async function RecipeDetailsPage({ params }: RecipeDetailsPageProps) {
  const { slug } = await params;
  const recipe = await getRecipeForDetails(slug);

  if (!recipe) {
    // Unknown slugs and hidden generated records both resolve to the styled 404 (HTTP 404).
    notFound();
  }

  const isFavorited = await isCurrentUserFavoriteRecipe(recipe.slug);
  const photo = hasRecipePhoto(recipe);
  const number = curatedNumberLabel(recipe.slug);
  const tags = tagLine(recipe.tags);
  const notes = missingContentNotes(recipe.ingredients.length, recipe.steps.length);
  const meta = [
    { label: "Подготовка", value: `${recipe.prepTimeMinutes} мин` },
    { label: "Готвене", value: formatCookTime(recipe.cookTimeMinutes) },
    { label: "Порции", value: String(recipe.servings) },
    { label: "Трудност", value: recipe.difficulty }
  ];

  return (
    <article className="recipe-print-page">
      <section
        aria-labelledby="recipe-title"
        className="recipe-hero recipe-print-hero"
        data-hero
        data-photo={photo ? "yes" : "none"}
        data-zoom={photo ? "" : undefined}
      >
        {photo ? (
          <div className="hero-par" data-par="0.14">
            <div className="zoom">
              <Image
                alt={recipe.imageAlt ?? `Снимка на ${recipe.title}`}
                className="ph"
                fill
                priority
                sizes="100vw"
                src={webImageSrc(recipe.imageSrc!)}
              />
            </div>
          </div>
        ) : null}
        <div className="hero-in">
          <div className="wrap">
            <p className="eyebrow rh-eyebrow">
              <Link href={categoryHref(recipe.category)}>{recipe.category}</Link>
              {number ? <span> · {number}</span> : null}
            </p>
            <h1 id="recipe-title" data-split><SplitWords text={recipe.title} /></h1>
            <p className="rh-desc">{recipe.description}</p>
          </div>
        </div>
      </section>

      <div className="wrap">
        <dl className="meta recipe-print-meta">
          {meta.map((item, index) => (
            <div data-r key={item.label} style={{ "--dl": `${index * 80}ms` } as CSSProperties}>
              <dt className="eyebrow">{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        {tags ? <p className="meta-tags" data-r>{tags}</p> : null}

        <div className={notes.all ? "rbody rbody-empty" : "rbody"}>
          {notes.all ? (
            <p className="r-missing">{notes.all}</p>
          ) : (
            <>
              <aside className="ings recipe-print-section" aria-labelledby={recipe.ingredients.length ? "ingredients-title" : undefined}>
                {recipe.ingredients.length ? (
                  <IngredientChecklist ingredients={recipe.ingredients} slug={recipe.slug} />
                ) : (
                  <p className="r-missing">{notes.ingredients}</p>
                )}
              </aside>
              <section className="steps recipe-print-section" aria-labelledby={recipe.steps.length ? "steps-title" : undefined}>
                {recipe.steps.length ? (
                  <>
                    <div className="prog" aria-hidden="true"><i /></div>
                    <h2 className="steps-h" id="steps-title" data-r>Начин на приготвяне</h2>
                    <ol className="st-list">
                      {recipe.steps.map((step, index) => (
                        <li className="st" data-r key={`${index}-${step}`}>
                          <span className="st-n" aria-hidden="true">{stepNumber(index)}</span>
                          <p>{step}</p>
                        </li>
                      ))}
                    </ol>
                  </>
                ) : (
                  <p className="r-missing">{notes.steps}</p>
                )}
              </section>
            </>
          )}

          <div className="actions no-print">
            <RecipeFavorite redirectTo={`/catalog/${recipe.slug}`} saved={isFavorited} slug={recipe.slug} />
            <PrintRecipeButton className="btn" icon={null} label="Принтирай рецептата" />
            <BackToCatalog />
          </div>
        </div>
      </div>
    </article>
  );
}
