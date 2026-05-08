import type { Metadata } from "next";
import Link from "next/link";
import { findRecipeBySlug, recipes } from "../recipes";

type RecipeDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
      title: "Рецептата не е намерена | Chefo’s Recipes"
    };
  }

  return {
    title: `${recipe.title} | Chefo’s Recipes`,
    description: recipe.description
  };
}

export default async function RecipeDetailsPage({ params }: RecipeDetailsPageProps) {
  const { slug } = await params;
  const recipe = findRecipeBySlug(slug);

  if (!recipe) {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-dashed border-brand-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
          Chefo’s Recipes
        </p>
        <h2 className="mt-3 text-3xl font-bold text-stone-950">Рецептата не е намерена</h2>
        <p className="mt-3 text-base leading-7 text-stone-600">
          Тази рецепта липсва в примерните данни. Върни се към каталога и избери друга.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          href="/catalog"
        >
          Обратно към каталога
        </Link>
      </section>
    );
  }

  return (
    <article className="space-y-8">
      <Link className="inline-flex text-sm font-bold text-brand-700 hover:text-brand-900" href="/catalog">
        Обратно към каталога
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
              Категория: {recipe.category}
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">
              Трудност: {recipe.difficulty}
            </span>
          </div>
          <h2 className="text-4xl font-bold leading-tight text-stone-950 sm:text-5xl">
            {recipe.title}
          </h2>
          <p className="max-w-3xl text-lg leading-8 text-stone-600">{recipe.description}</p>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600 shadow-sm"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-stone-500">Време за подготовка</p>
              <p className="mt-1 text-xl font-bold text-stone-950">{recipe.prepTimeMinutes} мин</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500">Време за готвене</p>
              <p className="mt-1 text-xl font-bold text-stone-950">{recipe.cookTimeMinutes} мин</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500">Порции</p>
              <p className="mt-1 text-xl font-bold text-stone-950">{recipe.servings}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500">Трудност</p>
              <p className="mt-1 text-xl font-bold text-stone-950">{recipe.difficulty}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-stone-950">Продукти</h3>
          <ul className="mt-5 space-y-3">
            {recipe.ingredients.map((ingredient) => (
              <li className="flex gap-3 text-sm leading-6 text-stone-700" key={ingredient}>
                <span className="mt-2 h-2 w-2 rounded-full bg-brand-500" />
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-stone-950">Начин на приготвяне</h3>
          <ol className="mt-5 space-y-4">
            {recipe.steps.map((step, index) => (
              <li className="flex gap-4 text-sm leading-6 text-stone-700" key={step}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </article>
  );
}
