import type { Metadata } from "next";
import Image from "next/image";
import { webImageSrc } from "../../../lib/images";
import Link from "next/link";
import { findRecipeBySlug } from "../recipes";
import { PrintRecipeButton } from "../../print-recipe-button";
import { addFavoriteAction, removeFavoriteAction } from "../../../server/favorites/actions";
import { isCurrentUserFavoriteRecipe } from "../../../server/favorites/service";
import { getPublicCatalogRecipeBySlug } from "../../../server/recipes/service";

type RecipeDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

async function getRecipeForDetails(slug: string) {
  return findRecipeBySlug(slug) ?? (await getPublicCatalogRecipeBySlug(slug));
}

function getVisualClass(category: string) {
  const normalizedCategory = category.toLocaleLowerCase("bg-BG");

  if (normalizedCategory.includes("сал")) {
    return "recipe-photo--salad";
  }

  if (normalizedCategory.includes("тест") || normalizedCategory.includes("печ")) {
    return "recipe-photo--baked";
  }

  if (normalizedCategory.includes("суп")) {
    return "recipe-photo--soup";
  }

  if (normalizedCategory.includes("дес")) {
    return "recipe-photo--dessert";
  }

  return "recipe-photo--stew";
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

  return {
    title: `${recipe.title} | Chefo's Recipes`,
    description: recipe.description
  };
}

export default async function RecipeDetailsPage({ params }: RecipeDetailsPageProps) {
  const { slug } = await params;
  const recipe = await getRecipeForDetails(slug);

  if (!recipe) {
    return (
      <section className="mx-auto max-w-3xl rounded-none border border-dashed border-brand-200 bg-white/84 p-10 text-center ">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
          Chefo&apos;s Recipes
        </p>
        <h1 className="mt-3 text-4xl font-bold text-neutral-950">Рецептата не е намерена</h1>
        <p className="mt-3 text-base leading-7 text-neutral-600">
          Тази рецепта не е налична в момента. Върни се към каталога и избери друга.
        </p>
        <Link
          className="ui-button mt-6 inline-flex rounded-none bg-brand-600 px-6 py-3 text-base font-black text-white   transition-transform hover:bg-brand-700"
          href="/catalog"
        >
          Обратно към каталога
        </Link>
      </section>
    );
  }

  const isFavorited = await isCurrentUserFavoriteRecipe(recipe.slug);

  return (
    <article className="recipe-print-page page-shell space-y-10 pb-4">
      <Link className="no-print inline-flex rounded-none px-1 text-base font-black text-brand-700 transition-transform hover:text-brand-900 focus-visible:ring-4 focus-visible:ring-brand-100" href="/catalog">
        Обратно към каталога
      </Link>

      <section className="recipe-print-hero grid gap-8 rounded-none border border-neutral-200 bg-white/72 p-6  sm:p-8 lg:grid-cols-[minmax(0,0.58fr)_minmax(380px,0.42fr)] lg:items-center xl:p-10">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-none bg-brand-50 px-3 py-1 text-sm font-black text-brand-800">
              Категория: {recipe.category}
            </span>
            <span className="rounded-none bg-neutral-100 px-3 py-1 text-sm font-black text-neutral-600">
              Трудност: {recipe.difficulty}
            </span>
          </div>
          <h1 className="text-5xl font-bold leading-tight text-neutral-950 sm:text-[3.5rem]">
            {recipe.title}
          </h1>
          <p className="max-w-3xl text-lg font-medium leading-8 text-ink">{recipe.description}</p>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span
                className="rounded-none bg-white px-3 py-1 text-sm font-bold text-neutral-600 "
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="recipe-print-image overflow-hidden rounded-none border border-white/70 bg-white ">
          {recipe.imageSrc ? (
            <div className="relative h-[320px] overflow-hidden bg-neutral-100 sm:h-[380px] lg:h-[420px]">
              <Image
                alt={recipe.imageAlt ?? `Снимка на ${recipe.title}`}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 35vw, 100vw"
                src={webImageSrc(recipe.imageSrc)}
              />
              <div className="no-print absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/24" />
            </div>
          ) : (
            <div
              aria-label={`Снимка на ${recipe.title}`}
              className={["recipe-photo h-[320px] sm:h-[380px] lg:h-[420px]", getVisualClass(recipe.category)].join(" ")}
              role="img"
            />
          )}
        </div>
      </section>

      <section className="recipe-print-content grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:items-start xl:gap-8">
        <aside className="recipe-print-section order-1 lg:col-start-2 lg:row-start-1">
          <div className="editorial-card rounded-none p-6">
            <h2 className="text-3xl font-bold text-neutral-950">Детайли</h2>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {[
                { label: "Подготовка", value: `${recipe.prepTimeMinutes} мин` },
                { label: "Готвене", value: `${recipe.cookTimeMinutes} мин` },
                { label: "Порции", value: recipe.servings },
                { label: "Трудност", value: recipe.difficulty }
              ].map((item) => (
                <div className="detail-stat-tile rounded-none border border-transparent bg-bg p-4" key={item.label}>
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xl font-bold text-neutral-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <aside className="no-print order-4 lg:col-start-2 lg:row-start-2">
          <div className="editorial-card rounded-none p-6">
            <h2 className="text-3xl font-bold text-neutral-950">Бързи действия</h2>
            <div className="mt-5 grid gap-3">
              <Link
                className="quick-action flex items-center justify-between rounded-none border border-brand-200 bg-bg px-4 py-3 text-base font-black text-ink transition-transform hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
                href="/catalog"
              >
                <span>Виж каталога</span>
                <span aria-hidden="true" className="text-brand-700">
                  →
                </span>
              </Link>
              <form action={isFavorited ? removeFavoriteAction : addFavoriteAction}>
                <input name="recipeSlug" type="hidden" value={recipe.slug} />
                <input name="redirectTo" type="hidden" value={`/catalog/${recipe.slug}`} />
                <button
                  className={[
                    "quick-action flex w-full items-center justify-between rounded-none border px-4 py-3 text-left text-base font-black transition",
                    isFavorited
                      ? "border-brand-200 bg-white text-ink hover:border-brand-400 hover:bg-bg hover:text-brand-800"
                      : "border-brand-200 bg-bg text-ink hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
                  ].join(" ")}
                  type="submit"
                >
                  <span>{isFavorited ? "Премахни от любими" : "Запази в любими"}</span>
                  <span aria-hidden="true" className="text-brand-700">
                    ♥
                  </span>
                </button>
              </form>
              <PrintRecipeButton className="quick-action flex w-full items-center justify-between rounded-none border border-brand-200 bg-bg px-4 py-3 text-left text-base font-black text-ink transition-transform hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800" />
            </div>
          </div>
        </aside>

        <section className="recipe-print-section editorial-card order-2 rounded-none p-6 lg:col-start-1 lg:row-start-1">
          <h2 className="text-3xl font-bold text-neutral-950">Продукти</h2>
          {recipe.ingredients.length > 0 ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {recipe.ingredients.map((ingredient) => (
                <li
                  className="ingredient-item flex items-center gap-3 rounded-none border border-brand-200/60 bg-bg px-4 py-3 text-[0.98rem] font-medium leading-6 text-ink"
                  key={ingredient}
                >
                  <span className="h-2 w-2 shrink-0 rounded-none bg-brand-500" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-none border border-brand-200/60 bg-bg px-4 py-3 text-base font-medium leading-7 text-ink">
              Няма въведени продукти за тази рецепта.
            </p>
          )}
        </section>

        <section className="recipe-print-section editorial-card order-3 w-full rounded-none p-6 sm:p-8 lg:col-start-1 lg:row-start-2">
          <h2 className="text-3xl font-bold text-neutral-950">Начин на приготвяне</h2>
          {recipe.steps.length > 0 ? (
            <ol className="mt-6 grid gap-5">
              {recipe.steps.map((step, index) => (
                <li className="flex gap-4 text-base font-medium leading-7 text-ink" key={step}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-none bg-brand-600 text-base font-black text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 rounded-none border border-brand-200/60 bg-bg px-4 py-3 text-base font-medium leading-7 text-ink">
              Начинът на приготвяне все още не е описан.
            </p>
          )}
        </section>
      </section>
    </article>
  );
}
