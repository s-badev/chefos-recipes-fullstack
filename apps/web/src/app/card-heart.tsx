"use client";

import { useState } from "react";
import { useFavorite } from "../hooks/use-favorite";

const HEART = "M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3 5 6.5 5c2 0 3.5 1.1 5.5 3 2-1.9 3.5-3 5.5-3C21 5 22.8 8.6 21.5 11.8 19.5 16.4 12 21 12 21z";

/**
 * The round heart on a recipe card. Same form contract and server action as every favourite control
 * (recipeSlug, redirectTo, saved); a guest is sent to /login with a safe return path by the action.
 */
export function CardHeart({ slug, title, saved, redirectTo }: { slug: string; title: string; saved: boolean; redirectTo: string }) {
  const favorite = useFavorite(saved);
  // Each "add" remounts the icon, which restarts the pop and ring animations.
  const [pops, setPops] = useState(0);
  return (
    <form action={favorite.action} className="heart-form">
      <input name="recipeSlug" type="hidden" value={slug} />
      <input name="redirectTo" type="hidden" value={redirectTo} />
      <input name="saved" type="hidden" value={String(!favorite.saved)} />
      <button
        aria-busy={favorite.pending}
        aria-label={`${favorite.saved ? "Премахни от любими" : "Запази в любими"}: ${title}`}
        aria-pressed={favorite.saved}
        className="heart"
        disabled={favorite.pending}
        onClick={() => { if (!favorite.saved) setPops(count => count + 1); }}
        type="submit"
      >
        <span aria-hidden="true" className={pops ? "heart-ico pop" : "heart-ico"} key={pops}>
          <span className="ring" />
          <svg viewBox="0 0 24 24"><path d={HEART} /></svg>
        </span>
      </button>
      {favorite.message ? <p className="sr-only" role="alert">{favorite.message}</p> : null}
    </form>
  );
}
