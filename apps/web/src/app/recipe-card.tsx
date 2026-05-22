import type { SVGProps } from "react";
import Image from "next/image";
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
  recipe,
  tagLimit = 3,
  visualIndex = 0
}: RecipeCardProps) {
  const visibleTags = recipe.tags.slice(0, tagLimit);
  const imageAlt = recipe.imageAlt ?? `Снимка на ${recipe.title}`;
  const metadata = [
    { icon: ClockIcon, value: `${recipe.prepTimeMinutes} мин` },
    { icon: FlameIcon, value: `${recipe.cookTimeMinutes} мин` },
    { icon: UsersIcon, value: `${recipe.servings} порции` }
  ];

  return (
    <Link
      className={[
        "recipe-card group flex h-full min-h-[560px] flex-col overflow-hidden rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100",
        className
      ].join(" ")}
      href={`/catalog/${recipe.slug}`}
    >
      <div className="relative overflow-hidden">
        {recipe.imageSrc ? (
          <div className="relative h-56 overflow-hidden bg-stone-100 transition duration-500 group-hover:scale-[1.03] sm:h-60 xl:h-72">
            <Image
              alt={imageAlt}
              className="object-cover"
              fill
              sizes="(min-width: 1536px) 24vw, (min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
              src={recipe.imageSrc}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/32" />
          </div>
        ) : (
          <div
            aria-label={imageAlt}
            className={[
              "recipe-photo h-56 transition duration-500 group-hover:scale-[1.03] sm:h-60 xl:h-72",
              getRecipeVisualClass(recipe.category, visualIndex)
            ].join(" ")}
            role="img"
          />
        )}

        <div className="absolute left-4 top-4 max-w-[calc(100%-8.5rem)]">
          <span className="inline-flex max-w-full truncate rounded-full bg-[#fff8ee]/95 px-3 py-1.5 text-xs font-bold text-[#3a2417] shadow-[0_8px_22px_rgba(28,18,8,0.18)] ring-1 ring-white/70 backdrop-blur-md sm:text-sm">
            {recipe.category}
          </span>
        </div>
        <div className="absolute right-4 top-4 max-w-[7rem]">
          <span className="inline-flex max-w-full truncate rounded-full bg-[#2b160b]/90 px-3 py-1.5 text-xs font-bold text-white shadow-[0_8px_22px_rgba(28,18,8,0.22)] ring-1 ring-white/40 backdrop-blur-md sm:text-sm">
            {recipe.difficulty}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="min-h-[9.75rem]">
          <h3 className="line-clamp-2 text-[1.45rem] font-bold leading-tight text-stone-950 transition group-hover:text-brand-800 xl:text-[1.6rem]">
            {recipe.title}
          </h3>
          <p className="mt-3 line-clamp-2 text-base font-medium leading-[1.6] text-[#4a3326]">
            {recipe.description}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-brand-100 bg-[#fff8ee] px-4 py-3 text-[0.95rem] font-black text-stone-800 shadow-inner shadow-white/60">
            {metadata.map((item) => {
              const Icon = item.icon;

              return (
                <span className="inline-flex min-w-fit items-center gap-1.5 whitespace-nowrap" key={item.value}>
                  <Icon className="h-4 w-4 shrink-0 text-brand-700" />
                  <span>{item.value}</span>
                </span>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <span
                className="rounded-full border border-stone-200 bg-white/86 px-3 py-1 text-sm font-bold text-stone-600 shadow-sm"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
