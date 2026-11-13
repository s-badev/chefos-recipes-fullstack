import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { pageMetadata, recipePath, recipeShareImage, recipeJsonLd, serializeJsonLd } from "../../../lib/site-metadata";
import Image from "next/image";
import { ResponsiveRecipeImage } from "../../responsive-recipe-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintRecipeButton } from "../../print-recipe-button";
import { SplitWords } from "../../split-heading";
import { StitchBand, StitchStar } from "../../stitch";
import { webImageSrc } from "../../../lib/images";
import { formatCookTime, formatTotalTime } from "../../../lib/format";
import { categoryHref } from "../../../lib/categories";
import { hasRecipePhoto, missingContentNotes, nextCuratedRecipe, stepNumber, tagLine } from "../../../lib/recipe-detail";
import { recipeExtrasFor } from "../../../data/recipe-extras";
import { isCurrentUserFavoriteRecipe } from "../../../server/favorites/service";
import { getWebRecipeForDetails } from "../../../server/recipes/web-details";
import { IngredientList } from "./ingredient-list";
import { RecipeFavorite } from "./recipe-favorite";
import { BackToCatalog } from "./back-to-catalog";

type RecipeDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: RecipeDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getWebRecipeForDetails(slug);

  if (!recipe) {
    return pageMetadata("Страницата не е намерена", "Адресът може да е грешен или рецептата вече да не е в каталога.", "/404", { noindex: true });
  }

  return pageMetadata(recipe.title, recipe.description, recipePath(recipe.slug), { article: true, image: recipeShareImage(recipe) });
}

export default async function RecipeDetailsPage({ params }: RecipeDetailsPageProps) {
  const { slug } = await params;
  const recipe = await getWebRecipeForDetails(slug);

  if (!recipe) {
    // Unknown slugs and hidden generated records both resolve to the styled 404 (HTTP 404).
    notFound();
  }

  const isFavorited = await isCurrentUserFavoriteRecipe(recipe.slug);
  const photo = hasRecipePhoto(recipe);
  const tags = tagLine(recipe.tags);
  const notes = missingContentNotes(recipe.ingredients.length, recipe.steps.length);
  const extras = recipeExtrasFor(recipe.slug);
  const next = nextCuratedRecipe(recipe.slug);
  const minutes = (value: number) => <>{value}<small> мин</small></>;

  return (
    <article className="recipe-print-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(recipeJsonLd(recipe)) }} />
      <section aria-labelledby="recipe-title" className="r-hero" data-hero data-photo={photo ? "yes" : "none"}>
        {photo ? (
          <div className="hero-ph">
            <Image alt={recipe.imageAlt ?? `Снимка на ${recipe.title}`} fill fetchPriority="high" priority quality={55} sizes="100vw" src={webImageSrc(recipe.imageSrc!)} />
          </div>
        ) : (
          // A manual recipe without its own photograph: the solid ground with the stitched star.
          <StitchStar className="r-star" />
        )}
        <div className="wrap hero-in">
          <p className="eyebrow">
            <Link href={categoryHref(recipe.category)}>{recipe.category}</Link>
          </p>
          <h1 data-split id="recipe-title"><SplitWords text={recipe.title} /></h1>
          <p className="r-desc">{recipe.description}</p>
          <StitchBand />
        </div>
      </section>

      <div className="wrap">
        <dl className="meta">
          <div className="rv"><dt>Подготовка</dt><dd>{minutes(recipe.prepTimeMinutes)}{extras.prepNote ? <span className="meta-note">{extras.prepNote}</span> : null}</dd></div>
          <div className="rv" style={{ "--d": "80ms" } as CSSProperties}><dt>Готвене</dt>{recipe.cookTimeMinutes ? <dd>{minutes(recipe.cookTimeMinutes)}</dd> : <dd className="word">{formatCookTime(0)}</dd>}</div>
          <div className="rv" style={{ "--d": "160ms" } as CSSProperties}><dt>Порции</dt><dd>{recipe.servings}</dd></div>
          <div className="rv" style={{ "--d": "240ms" } as CSSProperties}><dt>Трудност</dt><dd className="word">{recipe.difficulty}</dd></div>
        </dl>
        {tags ? <p className="tags">{tags}</p> : null}

        <div className={notes.all ? "rbody rbody-empty" : "rbody"}>
          {notes.all ? (
            <p className="r-missing">{notes.all}</p>
          ) : (
            <>
              <aside aria-labelledby={recipe.ingredients.length ? "ingredients-title" : undefined} className="ings">
                {recipe.ingredients.length ? (
                  <IngredientList ingredients={recipe.ingredients} />
                ) : (
                  <p className="r-missing">{notes.ingredients}</p>
                )}
              </aside>
              <section aria-labelledby={recipe.steps.length ? "steps-title" : undefined} className="steps">
                {recipe.steps.length ? (
                  <>
                    <h2 id="steps-title">Начин на приготвяне</h2>
                    <ol className="st-list">
                      {recipe.steps.map((step, index) => (
                        <li className="st rv" key={`${index}-${step}`}>
                          <span aria-hidden="true" className="st-n">{stepNumber(index)}</span>
                          <p><span className="sr-only">Стъпка {index + 1}: </span>{step}</p>
                        </li>
                      ))}
                    </ol>
                  </>
                ) : (
                  <p className="r-missing">{notes.steps}</p>
                )}
                {notes.all ? null : <RecipeActions isFavorited={isFavorited} slug={recipe.slug} />}
              </section>
            </>
          )}
          {notes.all ? <RecipeActions isFavorited={isFavorited} slug={recipe.slug} /> : null}
        </div>

        {/* The next curated recipe: a large row with its photograph on the right. */}
        <Link className="next no-print" href={`/catalog/${next.recipe.slug}`}>
          <span>
            <span className="ne">Следваща рецепта</span>
            <b>{next.recipe.title}</b>
            <span className="nm">{next.recipe.category} · {formatTotalTime(next.recipe.prepTimeMinutes, next.recipe.cookTimeMinutes)}</span>
          </span>
          <span className="ni">
            {hasRecipePhoto(next.recipe) ? <ResponsiveRecipeImage alt="" fill sizes="(max-width: 640px) 100vw, 320px" src={webImageSrc(next.recipe.imageSrc!)} /> : <span className="ci-empty"><StitchStar /></span>}
          </span>
        </Link>
      </div>
    </article>
  );
}

function RecipeActions({ slug, isFavorited }: { slug: string; isFavorited: boolean }) {
  return (
    <div className="actions no-print">
      <RecipeFavorite redirectTo={`/catalog/${slug}`} saved={isFavorited} slug={slug} />
      <PrintRecipeButton className="btn out" icon={null} label="Отпечатай рецептата" />
      <BackToCatalog />
    </div>
  );
}
