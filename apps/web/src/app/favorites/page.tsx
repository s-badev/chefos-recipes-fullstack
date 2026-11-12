import type { Metadata } from "next";
import Link from "next/link";
import { toCardRecipe } from "../../lib/catalog";
import { getCurrentUserFavoriteRecipes } from "../../server/favorites/service";
import { withWebRecipeImage } from "../../server/recipes/web-image";
import { RecipeTile } from "../recipe-tile";
import { SofraBoard } from "../sofra-board";
import { SplitWords } from "../split-heading";
import { StitchStar } from "../stitch";

export const metadata: Metadata = {
  title: "Любими рецепти | Chefo's Recipes",
  description: "Запазени идеи и любими рецепти в Chefo's Recipes."
};

export default async function FavoritesPage() {
  // Same card as the catalog: a manual recipe gets its photograph the same way the catalog finds it.
  const favoriteRecipes = (await Promise.all((await getCurrentUserFavoriteRecipes()).map(recipe => withWebRecipeImage(recipe)))).map(toCardRecipe);

  return <>
    <div className="wrap pg-head">
      <p className="eyebrow rv">Chefo&apos;s Recipes</p>
      <h1 data-split><SplitWords text="Любими" /> <em><SplitWords start={1} text="рецепти" /></em></h1>
      <p className="lead rv">Тук ще се пазят рецептите, които искаш да приготвиш по-късно.</p>
    </div>

    <div className="wrap fav-body">
      {favoriteRecipes.length > 0 ? (
        <section aria-labelledby="favorites-list">
          <div className="fav-top">
            <div>
              <p className="eyebrow">Любими идеи</p>
              <h2 id="favorites-list">Твоите запазени <em>рецепти</em></h2>
            </div>
            <Link className="link" href="/catalog">Всички рецепти <span aria-hidden="true">→</span></Link>
          </div>
          <div className="cards">
            {favoriteRecipes.map((recipe, index) => (
              <RecipeTile index={index} key={recipe.slug} recipe={recipe} redirectTo="/favorites" saved />
            ))}
          </div>
        </section>
      ) : (
        <section aria-labelledby="favorites-empty" className="fav-empty">
          <div className="fe-tx">
            <p className="eyebrow rv">Още няма рецепти</p>
            <h2 data-split id="favorites-empty"><SplitWords text="Все още няма" /> <em><SplitWords start={3} text="запазени рецепти" /></em></h2>
            <p className="t rv">Когато запазиш първата си рецепта, тя ще се появи тук за бързо връщане към нея.</p>
            <div className="rv"><Link className="btn fill" href="/catalog">Всички рецепти <span aria-hidden="true" className="ar">→</span></Link></div>
          </div>
          <div aria-hidden="true" className="fe-table-wrap">
            <SofraBoard center={<StitchStar />} className="fe-table" />
          </div>
        </section>
      )}
    </div>
  </>;
}
