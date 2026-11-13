"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

/**
 * A short entrance of the page content on client navigation only (never on the first load, so LCP is
 * untouched). It animates <main> alone: the header and footer stay as they are. Transform and opacity only;
 * nothing under reduced motion or with motion off.
 */
export function PageTransition() {
  const pathname = usePathname();
  const first = useRef(true);

  // Layout effect: the class is set before the new page paints, so it never shows a frame at rest first.
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    const main = document.getElementById("main-content");
    if (!main || document.documentElement.dataset.motion !== "on" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    main.classList.remove("pg-enter");
    void main.offsetWidth;
    main.classList.add("pg-enter");
    // The class goes once the entrance ends, so <main> carries no transform afterwards (fixed children stay fixed).
    const done = () => main.classList.remove("pg-enter");
    main.addEventListener("animationend", done, { once: true });
    const fallback = window.setTimeout(done, 600);
    return () => { main.removeEventListener("animationend", done); window.clearTimeout(fallback); };
  }, [pathname]);

  return null;
}
