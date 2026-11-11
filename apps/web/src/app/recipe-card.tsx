import type { SVGProps } from "react";
import Image from "next/image";
import { recipeImageSrc } from "../lib/images";
import { formatCookTime } from "../lib/format";
import Link from "next/link";
import { FavoriteButton } from "./favorite-button";

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
  favoriteRedirectTo?: string;
  isFavorited?: boolean;
  showFavoriteAction?: boolean;
  tagLimit?: number;
  visualIndex?: number;
  /** Above-the-fold cards: load the image eagerly with high priority (LCP candidate). */
  priority?: boolean;
};

const fallbackVisualClasses = [
  "recipe-photo--salad",
  "recipe-photo--baked",
  "recipe-photo--stew",
  "recipe-photo--soup",
  "recipe-photo--dessert"
];

function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function FlameIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M12 22c4 0 7-2.8 7-6.7 0-2.7-1.5-5-3.7-6.6-.4 2-1.5 3.2-2.8 3.9.3-3.2-1.1-6.1-4.1-8.6.1 3.5-1.7 5.3-3 7.1A7 7 0 0 0 5 15.3C5 19.2 8 22 12 22Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M16 20c0-2.2-1.8-4-4-4H8c-2.2 0-4 1.8-4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20c0-1.8-1.2-3.3-3-3.8M17 4.3a4 4 0 0 1 0 7.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

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

export function RecipeCard({
  className = "",
  favoriteRedirectTo,
  isFavorited = false,
  recipe,
  showFavoriteAction = false,
  tagLimit = 3,
  visualIndex = 0,
  priority = false
}: RecipeCardProps) {
  const visibleTags = recipe.tags.slice(0, tagLimit);
  const imageAlt = recipe.imageAlt ?? `Снимка на ${recipe.title}`;
  const redirectTo = favoriteRedirectTo ?? `/catalog/${recipe.slug}`;
  const metadata = [
    { icon: ClockIcon, value: `${recipe.prepTimeMinutes} мин` },
    { icon: FlameIcon, value: formatCookTime(recipe.cookTimeMinutes) },
    { icon: UsersIcon, value: `${recipe.servings} порции` }
  ];

  return (
    <article
      className={[
        "recipe-card group relative flex h-full min-h-[440px] flex-col overflow-hidden rounded-none",
        className
      ].join(" ")}
    >
      <Link
        aria-label={`Отвори рецепта: ${recipe.title}`}
        className="absolute inset-0 z-10 rounded-none  focus-visible:ring-4 focus-visible:ring-brand-100"
        href={`/catalog/${recipe.slug}`}
      />
      <div className="relative overflow-hidden">
          <div className="relative h-40 overflow-hidden bg-neutral-100 transition-transform duration-500 group-hover:scale-[1.03] sm:h-44 xl:h-48">
            <Image
              alt={imageAlt}
              className="object-cover"
              fill
              priority={priority}
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 48vw, 100vw"
              src={recipeImageSrc(recipe.imageSrc)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/32" />
          </div>

        <div className="absolute left-3 top-3 max-w-[calc(100%-7.5rem)]">
          <span className="inline-flex max-w-full truncate rounded-none bg-bg px-2.5 py-1 text-xs font-bold text-ink  ring-1 ring-white/70 backdrop-blur-md">
            {recipe.category}
          </span>
        </div>
        <div className="absolute right-3 top-3 max-w-[6.5rem]">
          <span className="inline-flex max-w-[6.5rem] truncate rounded-none bg-ink px-2.5 py-1 text-xs font-bold text-white  ring-1 ring-white/40 backdrop-blur-md">
            {recipe.difficulty}
          </span>
        </div>

        {showFavoriteAction ? (
          <FavoriteButton slug={recipe.slug} title={recipe.title} saved={isFavorited} redirectTo={redirectTo} className="absolute bottom-3 right-3 z-20 max-w-[calc(100%-1.5rem)]"/>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="grid min-h-[8rem] grid-rows-[3.25rem_3.75rem] gap-2.5">
          <h3 className="line-clamp-2 self-start text-xl font-bold leading-tight text-neutral-950 transition-transform group-hover:text-brand-800 xl:text-[1.25rem]">
            {recipe.title}
          </h3>
          <p className="line-clamp-2 self-start text-sm font-medium leading-6 text-ink">
            {recipe.description}
          </p>
        </div>

        <div className="mt-auto flex min-h-[6.75rem] flex-col justify-start pt-3">
          <div className="grid min-h-[3.25rem] grid-cols-[minmax(0,0.9fr)_minmax(max-content,1fr)_minmax(max-content,1.2fr)] items-center gap-1 rounded-none border border-brand-100 bg-bg px-2 py-2.5 text-[0.66rem] font-black leading-none text-neutral-800   sm:px-2.5 sm:text-[0.7rem]">
            {metadata.map((item, index) => {
              const Icon = item.icon;

              return (
                <span
                  className="inline-flex min-w-0 items-center justify-center gap-1 whitespace-nowrap"
                  key={`${item.value}-${index}`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-brand-700" />
                  <span>{item.value}</span>
                </span>
              );
            })}
          </div>

          <div className="mt-3 flex min-h-[2rem] flex-wrap content-start gap-1.5">
            {visibleTags.map((tag) => (
              <span
                className="rounded-none border border-neutral-200 bg-white/86 px-2.5 py-1 text-xs font-bold text-neutral-600 "
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
