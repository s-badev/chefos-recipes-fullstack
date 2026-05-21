import type { CSSProperties } from "react";
import Link from "next/link";

type RecipeCardRecipe = {
  title: string;
  slug: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: string;
  category: string;
  tags: string[];
  imageAlt?: string;
  imageSrc?: string;
};

type RecipeCardProps = {
  recipe: RecipeCardRecipe;
  className?: string;
  tagLimit?: number;
  visualIndex?: number;
};

const fallbackVisualClasses = [
  "recipe-photo--salad",
  "recipe-photo--baked",
  "recipe-photo--stew",
  "recipe-photo--soup",
  "recipe-photo--dessert"
];

function getRecipeVisualClass(category: string, visualIndex = 0) {
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

  return fallbackVisualClasses[visualIndex % fallbackVisualClasses.length] ?? "recipe-photo--stew";
}

function getLocalRecipeImage(recipe: RecipeCardRecipe) {
  if (recipe.imageSrc) {
    return recipe.imageSrc;
  }

  return undefined;
}

function getImageStyle(imageSrc: string | undefined): CSSProperties | undefined {
  if (!imageSrc) {
    return undefined;
  }

  return {
    backgroundImage: [
      "linear-gradient(180deg, rgba(24, 14, 7, 0.04), rgba(24, 14, 7, 0.28))",
      `url("${imageSrc}")`,
      "radial-gradient(circle at 24% 26%, rgba(255,255,255,0.9) 0 8%, transparent 9%)",
      "linear-gradient(135deg, #c84a2a, #edaa42 46%, #607b43)"
    ].join(", ")
  };
}

export function RecipeCard({
  className = "",
  recipe,
  tagLimit = 3,
  visualIndex = 0
}: RecipeCardProps) {
  const visibleTags = recipe.tags.slice(0, tagLimit);
  const imageSrc = getLocalRecipeImage(recipe);

  return (
    <Link
      className={[
        "recipe-card group flex h-full min-h-[448px] flex-col overflow-hidden rounded-[1.75rem] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100",
        className
      ].join(" ")}
      href={`/catalog/${recipe.slug}`}
    >
      <div className="relative overflow-hidden">
        <div
          aria-label={recipe.imageAlt ?? `Илюстрация за ${recipe.title}`}
          className={[
            "recipe-photo h-52 transition duration-500 group-hover:scale-[1.04] xl:h-56",
            getRecipeVisualClass(recipe.category, visualIndex)
          ].join(" ")}
          role="img"
          style={getImageStyle(imageSrc)}
        />
        <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)]">
          <span className="inline-flex rounded-full border border-white/65 bg-white/92 px-3 py-1 text-sm font-bold text-brand-800 shadow-sm backdrop-blur">
            {recipe.category}
          </span>
        </div>
        <div className="absolute right-4 top-4">
          <span className="inline-flex rounded-full border border-white/35 bg-[#1c1208]/82 px-3 py-1 text-sm font-bold text-white shadow-sm backdrop-blur">
            {recipe.difficulty}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex-1">
          <h3 className="text-[1.4rem] font-bold leading-tight text-stone-950 transition group-hover:text-brand-800 xl:text-[1.5rem]">
            {recipe.title}
          </h3>
          <p className="mt-3 text-base leading-7 text-stone-600">
            {recipe.description}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-[#fff7ec] p-3">
          <div>
            <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-stone-500">
              Подг.
            </p>
            <p className="mt-1 text-base font-bold text-stone-950">
              {recipe.prepTimeMinutes} мин
            </p>
          </div>
          <div>
            <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-stone-500">
              Готв.
            </p>
            <p className="mt-1 text-base font-bold text-stone-950">
              {recipe.cookTimeMinutes} мин
            </p>
          </div>
          <div>
            <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-stone-500">
              Порции
            </p>
            <p className="mt-1 text-base font-bold text-stone-950">{recipe.servings}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <span
              className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-600"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
