import type { CSSProperties } from "react";
import { ResponsiveRecipeImage } from "./responsive-recipe-image";
import Link from "next/link";
import type { CardRecipe } from "../lib/catalog";
import { webImageSrc } from "../lib/images";
import { recipeTileSizes } from "../lib/image-sizes";
import { formatTotalTime, servingsLabel } from "../lib/format";
import { hasRecipePhoto } from "../lib/recipe-detail";
import { CardHeart } from "./card-heart";
import { StitchBand, StitchStar } from "./stitch";

export type TileVariant = "big" | "wide" | "half" | "solo" | "";

/**
 * A recipe card as in the approved mock: a photograph without a frame, the heart top right, the
 * category in red, the title in Cormorant with a drawn line on hover and "time · servings · difficulty".
 * A recipe without its own photograph gets a quiet tile of the same proportion: a small centred stitched star
 * over a thin stitched line.
 */
export function RecipeTile({ recipe, variant = "", saved, redirectTo, index = 0, priority = false, reveal = true, oddLast = false }: {
  recipe: CardRecipe; variant?: TileVariant; saved: boolean; redirectTo: string; index?: number; priority?: boolean;
  /** The last of an odd number of cards: on the two-column tablet grid it spans the row. */
  oddLast?: boolean;
  /** Scroll reveal (static pages only); the catalog re-renders its cards and fades them itself. */
  reveal?: boolean;
}) {
  const href = `/catalog/${recipe.slug}`;
  return (
    <article className={`card ${reveal ? "rv " : ""}${variant}${oddLast ? " odd-last" : ""}`} style={reveal ? { "--d": `${(index % 4) * 80}ms` } as CSSProperties : undefined}>
      <Link aria-label={recipe.title} className="ci" href={href} tabIndex={-1}>
        {hasRecipePhoto(recipe) ? (
          <ResponsiveRecipeImage alt={`Снимка на ${recipe.title}`} fill fetchPriority={priority ? "high" : undefined} loading={priority ? "eager" : "lazy"} priority={priority} sizes={recipeTileSizes[variant]} src={webImageSrc(recipe.imageSrc!)} />
        ) : (
          <span className="ci-empty"><StitchStar /><StitchBand size={1.6} /></span>
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
