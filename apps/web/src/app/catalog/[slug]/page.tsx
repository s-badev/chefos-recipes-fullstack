import type { Metadata } from "next";
import Link from "next/link";
import { findRecipeBySlug, recipes } from "../recipes";

type RecipeDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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

export function generateStaticParams() {
  return recipes.map((recipe) => ({
    slug: recipe.slug
  }));
}

export async function generateMetadata({
  params
}: RecipeDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = findRecipeBySlug(slug);

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
  const recipe = findRecipeBySlug(slug);

  if (!recipe) {
    return (
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-dashed border-brand-200 bg-white/84 p-10 text-center shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
          Chefo&apos;s Recipes
        </p>
        <h1 className="mt-3 text-4xl font-bold text-stone-950">Рецептата не е намерена</h1>
        <p className="mt-3 text-base leading-7 text-stone-600">
          Тази рецепта не е налична в момента. Върни се към каталога и избери друга.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 text-base font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
          href="/catalog"
        >
          Обратно към каталога
        </Link>
      </section>
    );
  }

  return (
    <article className="page-shell space-y-10">
      <Link className="inline-flex text-base font-black text-brand-700 hover:text-brand-900" href="/catalog">
        Обратно към каталога
      </Link>

      <section className="grid gap-8 rounded-[2.2rem] border border-stone-200 bg-white/72 p-6 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.7fr)] lg:items-stretch xl:p-10">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-black text-brand-800">
              Категория: {recipe.category}
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-black text-stone-600">
              Трудност: {recipe.difficulty}
            </span>
          </div>
          <h1 className="text-5xl font-bold leading-tight text-stone-950 sm:text-6xl">
            {recipe.title}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-stone-600">{recipe.description}</p>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span
                className="rounded-full bg-white px-3 py-1 text-sm font-bold text-stone-600 shadow-sm"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.9rem] border border-white/70 bg-white shadow-sm">
          <div
            aria-label={`Илюстрация за ${recipe.title}`}
            className={["recipe-photo min-h-[280px] lg:min-h-full", getVisualClass(recipe.category)].join(" ")}
            role="img"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="editorial-card rounded-[1.8rem] p-6">
          <h2 className="text-3xl font-bold text-stone-950">Детайли</h2>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {[
              { label: "Подготовка", value: `${recipe.prepTimeMinutes} мин` },
              { label: "Готвене", value: `${recipe.cookTimeMinutes} мин` },
              { label: "Порции", value: recipe.servings },
              { label: "Трудност", value: recipe.difficulty }
            ].map((item) => (
              <div className="rounded-2xl bg-[#fff7ec] p-4" key={item.label}>
                <p className="text-sm font-black uppercase tracking-[0.12em] text-stone-500">
                  {item.label}
                </p>
                <p className="mt-1 text-xl font-bold text-stone-950">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="editorial-card rounded-[1.8rem] p-6">
          <h2 className="text-3xl font-bold text-stone-950">Продукти</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {recipe.ingredients.map((ingredient) => (
              <li className="flex gap-3 text-base leading-7 text-stone-700" key={ingredient}>
                <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="editorial-card rounded-[1.8rem] p-6">
        <h2 className="text-3xl font-bold text-stone-950">Начин на приготвяне</h2>
        <ol className="mt-6 grid gap-4">
          {recipe.steps.map((step, index) => (
            <li className="flex gap-4 text-base leading-7 text-stone-700" key={step}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-base font-black text-white">
                {index + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
