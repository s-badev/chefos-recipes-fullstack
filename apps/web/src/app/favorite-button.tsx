"use client";
import { useFavorite } from "../hooks/use-favorite";

export function FavoriteButton({ slug, title, saved, redirectTo, detail = false, className = "" }: {
  slug: string; title: string; saved: boolean; redirectTo: string; detail?: boolean; className?: string;
}) {
  const favorite = useFavorite(saved);
  const label = detail ? favorite.saved ? "Премахни от любими" : "Запази в любими" : favorite.saved ? "Премахни" : "Запази";
  return <form action={favorite.action} className={className}>
    <input name="recipeSlug" type="hidden" value={slug}/>
    <input name="redirectTo" type="hidden" value={redirectTo}/>
    <input name="saved" type="hidden" value={String(!favorite.saved)}/>
    <button aria-label={`${favorite.saved ? "Премахни" : "Запази"} ${title} ${favorite.saved ? "от" : "в"} любими`} aria-pressed={favorite.saved} disabled={favorite.pending} className="relative inline-flex min-h-10 w-full items-center justify-between gap-3 border border-line bg-bg px-3 py-2 text-sm font-semibold text-ink disabled:opacity-60" type="submit">
      <span>{favorite.pending ? "Запазване…" : label}</span><span aria-hidden="true">{favorite.saved ? "♥" : "♡"}</span>
    </button>
    {favorite.message ? <p role="alert">{favorite.message}</p> : null}
  </form>;
}
