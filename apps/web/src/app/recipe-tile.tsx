import type { CSSProperties } from "react";
import { ResponsiveRecipeImage } from "./responsive-recipe-image";
import Link from "next/link";
import type { CardRecipe } from "../lib/catalog";
import { webImageSrc } from "../lib/images";
import { recipeTileSizes } from "../lib/image-sizes";
import { formatTotalTime, servingsLabel } from "../lib/format";
import { hasRecipePhoto } from "../lib/recipe-detail";
import { CardHeart } from "./card-heart";
import { StitchStar } from "./stitch";

export type TileVariant = "big" | "wide" | "half" | "";

/**
 * A recipe card as in the approved mock: a photograph without a frame, the heart top right, the
 * category in red, the title in Cormorant with a drawn line on hover and "time · servings · difficulty".
 * A recipe without its own photograph gets a dark tile with the stitched star.
 */
export function RecipeTile({ recipe, variant = "", saved, redirectTo, index = 0, priority = false, reveal = true }: {
  recipe: CardRecipe; variant?: TileVariant; saved: boolean; redirectTo: string; index?: number; priority?: boolean;
  /** Scroll reveal (static pages only); the catalog re-renders its cards and fades them itself. */
  reveal?: boolean;
}) {
  const href = `/catalog/${recipe.slug}`;
  return (
    <article className={`card ${reveal ? "rv " : ""}${variant}`} style={reveal ? { "--d": `${(index % 4) * 80}ms` } as CSSProperties : undefined}>
      <Link aria-label={recipe.title} className="ci" href={href} tabIndex={-1}>
        {hasRecipePhoto(recipe) ? (
          <ResponsiveRecipeImage alt={`Снимка на ${recipe.title}`} fill fetchPriority={priority ? "high" : undefined} loading={priority ? "eager" : "lazy"} priority={priority} sizes={recipeTileSizes[variant]} src={webImageSrc(recipe.imageSrc!)} />
        ) : (
          <span className="ci-empty"><StitchStar /></span>
        )}
      </Link>
      <CardHeart redirectTo={redirectTo} saved={saved} slug={recipe.slug} title={recipe.title} />
      <Link className="cb" href={href}>
        <span className="ce">{recipe.category}</span>
        <h3 className="ct">{recipe.title}</h3>
        <span className="cm">{formatTotalTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes)} · {servingsLabel(recipe.servings)} · {recipe.difficulty}</span>
      </Link>
    </article>
  );
}
