import type { CSSProperties } from "react";
import { IngredientIcon } from "../../../components/ingredient-icon";
import { productCountLabel } from "../../../lib/ingredient-icons";

/** The products, each with a small drawing of itself in front. Nothing to tick: a plain list to read. */
export function IngredientList({ ingredients }: { ingredients: readonly string[] }) {
  return (
    <>
      <div className="ings-h">
        <h2 id="ingredients-title">Продукти</h2>
        <span className="ings-count">{productCountLabel(ingredients.length)}</span>
      </div>
      <ul className="ing-list">
        {ingredients.map((ingredient, index) => (
          // Only the first eight stagger in; a long list must not keep the cook waiting.
          <li className="ing rv" key={`${index}-${ingredient}`} style={{ "--d": `${index < 8 ? index * 50 : 0}ms` } as CSSProperties}>
            <IngredientIcon text={ingredient} />
            <span className="ing-t">{ingredient}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
