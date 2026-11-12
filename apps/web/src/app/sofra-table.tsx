"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { SofraBoard } from "./sofra-board";
import { StitchStar } from "./stitch";

export type SofraPlate = {
  name: string;
  countLabel: string;
  href: string;
  /** Web image of the category's first recipe, or undefined for a dark plate. */
  image?: string;
  recipes: { slug: string; title: string; image?: string; time: string }[];
};

/**
 * "Седни на софрата": a round table with one plate per category. Choosing a plate turns the table
 * so it comes to the top (the plates stay upright); arrows and the keyboard turn it too.
 */
export function SofraTable({ plates, intro }: { plates: SofraPlate[]; intro: ReactNode }) {
  const [selected, setSelected] = useState(0);
  const plateRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = plates.length;
  const current = plates[selected];

  function pick(index: number, focus = false) {
    const next = (index + count) % count;
    setSelected(next);
    if (focus) plateRefs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); pick(selected + 1, true); }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); pick(selected - 1, true); }
  }

  return (
    <div className="wrap sofra-grid">
      <div className="sofra-side">{intro}</div>
      <div className="sofra-wheel">
        <SofraBoard center={<><StitchStar /><b>{current.name}</b><span>{current.countLabel}</span></>} style={{ "--sel": selected, "--step": `${360 / count}deg` } as CSSProperties}>
          <div aria-label="Категории на софрата" className="spin" onKeyDown={onKeyDown} role="group">
            {plates.map((plate, index) => (
              <button
                aria-label={plate.name}
                aria-pressed={index === selected}
                className="plate"
                key={plate.name}
                onClick={() => pick(index)}
                ref={node => { plateRefs.current[index] = node; }}
                style={{ "--i": index } as CSSProperties}
                tabIndex={index === selected ? 0 : -1}
                type="button"
              >
                <span className="pi">{plate.image ? <Image alt="" fill sizes="140px" src={plate.image} /> : <StitchStar />}</span>
              </button>
            ))}
          </div>
        </SofraBoard>
        <div className="spin-ctl">
          <button aria-label="Предишна категория" className="circ" onClick={() => pick(selected - 1)} type="button"><span aria-hidden="true">←</span></button>
          <span>Завърти</span>
          <button aria-label="Следваща категория" className="circ" onClick={() => pick(selected + 1)} type="button"><span aria-hidden="true">→</span></button>
        </div>
      </div>
      <div aria-live="polite" className="cat-now sofra-list">
        <p className="eyebrow"><span>Избрано</span><span>{current.countLabel}</span></p>
        <p className="cat-name">{current.name}</p>
        <ul>
          {current.recipes.map(recipe => (
            <li key={recipe.slug}>
              <Link className="mini" href={`/catalog/${recipe.slug}`}>
                <span className="mini-ph">{recipe.image ? <Image alt="" fill sizes="72px" src={recipe.image} /> : null}</span>
                <span className="mt">{recipe.title}</span>
                <span className="mm">{recipe.time}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link className="link" href={current.href}>Всички: {current.name.toLocaleLowerCase("bg-BG")} <span aria-hidden="true">→</span></Link>
      </div>
    </div>
  );
}
