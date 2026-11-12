"use client";

import type { CSSProperties } from "react";
import { useIngredientChecks } from "../../../hooks/use-ingredient-checks";

/** Ingredients as real checkboxes: ticked items are struck through and remembered per recipe. */
export function IngredientChecklist({ slug, ingredients }: { slug: string; ingredients: readonly string[] }) {
  const { checked, done, toggle, clear } = useIngredientChecks(slug, ingredients.length);

  return (
    <>
      <div className="ings-h">
        <h2 id="ingredients-title">Продукти</h2>
        <span aria-live="polite" className="ings-count">{done} от {ingredients.length}</span>
      </div>
      <ul className="ing-list">
        {ingredients.map((ingredient, index) => (
          // Only the first eight stagger in; a long list must not keep the cook waiting.
          <li className="rv" key={`${index}-${ingredient}`} style={{ "--d": `${index < 8 ? index * 50 : 0}ms` } as CSSProperties}>
            <label className="ing">
              <input checked={checked[index] ?? false} onChange={event => toggle(index, event.target.checked)} type="checkbox" />
              <span className="ing-t">
                <span className="ing-b">{ingredient}</span>
                {/* A struck-through copy revealed with clip-path, so the line follows every wrapped line exactly. */}
                <span className="ing-s" aria-hidden="true">{ingredient}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      {done > 0 ? (
        <button className="clear ing-clear no-print" onClick={clear} type="button">Изчисти отметките</button>
      ) : null}
    </>
  );
}
