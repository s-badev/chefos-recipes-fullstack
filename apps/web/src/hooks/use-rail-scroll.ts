"use client";

import { useCallback, useEffect, useState, type KeyboardEvent, type RefObject } from "react";

export type RailState = {
  atStart: boolean;
  atEnd: boolean;
  /** 1-based index of the first and last tile that is at least half visible. */
  first: number;
  last: number;
  total: number;
};

/**
 * Scroll state and controls for a horizontal rail of tiles. Visual-agnostic: any markup whose
 * scroll container holds the tiles as direct children can use it.
 */
export function useRailScroll(railRef: RefObject<HTMLElement | null>) {
  const [state, setState] = useState<RailState>({ atStart: true, atEnd: false, first: 1, last: 1, total: 0 });

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const tiles = [...rail.children] as HTMLElement[];
    const view = rail.getBoundingClientRect();
    const visible = tiles
      .map((tile, index) => ({ index, rect: tile.getBoundingClientRect() }))
      .filter(({ rect }) => Math.min(rect.right, view.right) - Math.max(rect.left, view.left) >= rect.width / 2)
      .map(({ index }) => index + 1);
    const max = rail.scrollWidth - rail.clientWidth;
    setState({
      atStart: rail.scrollLeft <= 2,
      atEnd: rail.scrollLeft >= max - 2,
      first: visible[0] ?? 1,
      last: visible[visible.length - 1] ?? 1,
      total: tiles.length
    });
  }, [railRef]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    measure();
    let frame = 0;
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const resize = new ResizeObserver(measure);
    resize.observe(rail);
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); resize.disconnect(); rail.removeEventListener("scroll", onScroll); };
  }, [railRef, measure]);

  const smooth = () => (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion !== "on" ? "auto" : "smooth") as ScrollBehavior;

  /** Moves by about one viewport of tiles. */
  const page = useCallback((direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(240, rail.clientWidth * 0.8), behavior: smooth() });
  }, [railRef]);

  /** Home/End jump to the ends (arrow keys keep their native per-step scroll). */
  const onKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    const rail = railRef.current;
    if (!rail || event.target !== rail) return;
    if (event.key === "Home") { event.preventDefault(); rail.scrollTo({ left: 0, behavior: smooth() }); }
    if (event.key === "End") { event.preventDefault(); rail.scrollTo({ left: rail.scrollWidth, behavior: smooth() }); }
  }, [railRef]);

  return { state, page, onKeyDown };
}
