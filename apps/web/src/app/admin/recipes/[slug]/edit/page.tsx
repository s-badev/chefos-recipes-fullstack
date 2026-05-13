import type { Metadata } from "next";
import Link from "next/link";
import { findRecipeBySlug, recipes } from "../../../../catalog/recipes";

type EditRecipePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return recipes.map((recipe) => ({
    slug: recipe.slug
  }));
}

export async function generateMetadata({ params }: EditRecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = findRecipeBySlug(slug);

  return {
    title: recipe ? `Редакция: ${recipe.title} | Chefo's Recipes` : "Рецептата не е намерена | Chefo's Recipes"
  };
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { slug } = await params;
  const recipe = findRecipeBySlug(slug);

  if (!recipe) {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-dashed border-brand-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
          Админ редакция
        </p>
        <h2 className="mt-3 text-3xl font-bold text-stone-950">Рецептата не е намерена</h2>
        <p className="mt-3 text-base leading-7 text-stone-600">
          Няма рецепта с този адрес. Върни се към админ панела и избери рецепта от списъка.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          href="/admin"
        >
          Обратно към админ панела
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
            Админ редакция
          </p>
          <h2 className="mt-2 text-4xl font-bold text-stone-950 sm:text-5xl">Редактирай рецепта</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
            Прегледай основната информация за "{recipe.title}" и подготви бъдещи промени по
            съдържанието.
          </p>
        </div>
        <Link className="text-sm font-bold text-brand-700 hover:text-brand-900" href="/admin">
          Обратно към админ панела
        </Link>
      </div>

      <form className="grid gap-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:grid-cols-2">
        <div>
          <label className="text-sm font-bold text-stone-800" htmlFor="title">
            Заглавие
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            defaultValue={recipe.title}
            id="title"
            name="title"
            type="text"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-stone-800" htmlFor="category">
            Категория
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            defaultValue={recipe.category}
            id="category"
            name="category"
            type="text"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="text-sm font-bold text-stone-800" htmlFor="description">
            Описание
          </label>
          <textarea
            className="mt-2 min-h-32 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            defaultValue={recipe.description}
            id="description"
            name="description"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-stone-800" htmlFor="prepTime">
            Време за подготовка
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            defaultValue={recipe.prepTimeMinutes}
            id="prepTime"
            name="prepTime"
            type="number"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-stone-800" htmlFor="cookTime">
            Време за готвене
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            defaultValue={recipe.cookTimeMinutes}
            id="cookTime"
            name="cookTime"
            type="number"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-stone-800" htmlFor="servings">
            Порции
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fffaf3] px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            defaultValue={recipe.servings}
            id="servings"
            name="servings"
            type="number"
          />
        </div>

        <div className="flex items-end">
          <button
            className="w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
            type="button"
          >
            Запази промените
          </button>
        </div>
      </form>

      <p className="rounded-3xl border border-dashed border-brand-200 bg-white p-5 text-sm leading-6 text-stone-600 shadow-sm">
        Формата показва как ще изглежда редакцията. Скоро промените ще могат да се запазват от
        админ зоната.
      </p>
    </section>
  );
}
