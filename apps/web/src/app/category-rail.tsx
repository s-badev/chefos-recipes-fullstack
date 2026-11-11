"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { useRailScroll } from "../hooks/use-rail-scroll";
import { webImageSrc } from "../lib/images";
import { categoryHref, type CategorySummary } from "../lib/categories";
import { recipeCountLabel } from "../lib/format";

const pad = (value: number) => String(value).padStart(2, "0");

/** Home page category rail: arrows that switch off at the ends, a position counter, keyboard scroll. */
export function CategoryRail({ categories, heading }: { categories: CategorySummary[]; heading: ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);
  const { state, page, onKeyDown } = useRailScroll(railRef);
  const total = categories.length;

  return <>
    <div className="wrap rail-head">
      {heading}
      <div className="rail-controls">
        <p className="rail-status" id="rail-status">
          {pad(state.first)}–{pad(state.last)} <span aria-hidden="true">/</span><span className="sr-only"> от </span> {pad(total)}
        </p>
        <div className="arrows">
          <button className="circ" type="button" aria-controls="category-rail" aria-label="Назад по категориите" disabled={state.atStart} onClick={() => page(-1)}>←</button>
          <button className="circ" type="button" aria-controls="category-rail" aria-label="Напред по категориите" disabled={state.atEnd} onClick={() => page(1)}>→</button>
        </div>
      </div>
    </div>
    <div
      className="rail"
      id="category-rail"
      ref={railRef}
      tabIndex={0}
      role="group"
      aria-label={`Категории: ${total}. Превърти настрани със стрелките, Home и End.`}
      aria-describedby="rail-status"
      onKeyDown={onKeyDown}
    >
      {categories.map(category => (
        <Link className="rc" href={categoryHref(category.name)} key={category.name}>
          {category.imageSrc ? <Image src={webImageSrc(category.imageSrc)} alt="" className="ph" fill sizes="(max-width: 958px) 230px, (max-width: 1416px) 24vw, 340px" /> : null}
          <span className="rc-l"><b>{category.name}</b><span>{recipeCountLabel(category.recipeCount, true)} →</span></span>
        </Link>
      ))}
    </div>
  </>;
}
