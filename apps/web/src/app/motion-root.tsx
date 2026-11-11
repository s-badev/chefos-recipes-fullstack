"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    /** Set by MotionRoot once it owns the reveals; read by the boot script in layout.tsx. */
    __motionReady?: boolean;
    /** Set by the boot script when MotionRoot missed its deadline; motion stays off for this load. */
    __motionTimedOut?: boolean;
  }
}

const PREVIEW_W = 300, PREVIEW_H = 225, PREVIEW_GAP = 16, EDGE = 8;

/** One observer and one frame loop own all editorial reveals and transient motion. */
export function MotionRoot() {
  const pathname = usePathname();
  useEffect(() => {
    window.__motionReady = true;
    const root = document.documentElement;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const hover = matchMedia("(hover:hover)");
    const targets = [...document.querySelectorAll<HTMLElement>("[data-r],[data-mask],[data-split],[data-zoom],.quote")];
    const header = document.querySelector<HTMLElement>(".hdr");
    const hero = document.querySelector<HTMLElement>(".hero");
    const parallax = document.querySelector<HTMLElement>("[data-par]");
    const preview = document.querySelector<HTMLElement>("#recipe-preview");
    const motionAllowed = () => !media.matches && !window.__motionTimedOut;
    let enabled = motionAllowed(), frame = 0, heroHeight = 0;
    let mx = 0, px = 0, py = 0, showing = false, lastScroll = -1;
    let activeRow: HTMLElement | null = null;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          // The mobile caption sits below the observer's negative bottom margin.
          if (entry.target === hero) hero.querySelectorAll("[data-r]").forEach(node => node.classList.add("in"));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .2, rootMargin: "0px 0px -6% 0px" });

    function measure() {
      heroHeight = hero?.offsetHeight ?? 0;
      lastScroll = -1;
    }
    function solidHeader() { header?.classList.toggle("solid", !hero || window.scrollY > heroHeight - 72); }
    /** The preview follows the pointer sideways but sits above the hovered row (below it when there is no room), never on it. */
    function previewTarget() {
      const rect = activeRow!.getBoundingClientRect();
      const x = Math.max(EDGE, Math.min(innerWidth - PREVIEW_W - EDGE, mx - PREVIEW_W / 2));
      const above = rect.top - PREVIEW_GAP - PREVIEW_H;
      const y = above >= EDGE ? above : Math.min(innerHeight - PREVIEW_H - EDGE, rect.bottom + PREVIEW_GAP);
      return { x, y };
    }
    function tick() {
      const y = window.scrollY;
      if (y !== lastScroll) {
        solidHeader();
        if (parallax) parallax.style.transform = `translate3d(0,${(y * .18).toFixed(1)}px,0)`;
        lastScroll = y;
      }
      if (showing && preview && activeRow) {
        const target = previewTarget();
        const dx = target.x - px; px += dx * .14; py += (target.y - py) * .14;
        preview.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) rotate(${Math.max(-8, Math.min(8, dx * .14 * .25)).toFixed(2)}deg)`;
      }
      frame = requestAnimationFrame(tick);
    }
    function hidePreview() { showing = false; activeRow = null; preview?.classList.remove("on"); }
    function configure() {
      enabled = motionAllowed(); root.dataset.motion = enabled ? "on" : "off";
      cancelAnimationFrame(frame); observer.disconnect(); measure(); solidHeader();
      if (enabled) { targets.forEach(target => observer.observe(target)); frame = requestAnimationFrame(tick); }
      else { targets.forEach(target => target.classList.add("in")); parallax?.style.removeProperty("transform"); hidePreview(); }
    }
    function enter(event: PointerEvent) {
      const row = (event.target as Element).closest<HTMLElement>(".row[data-preview]");
      if (!row || !enabled || !hover.matches || !preview) return;
      preview.querySelectorAll<HTMLElement>("[data-preview-image]").forEach(image => { image.hidden = image.dataset.previewImage !== row.dataset.preview; });
      activeRow = row;
      if (!showing) { const start = previewTarget(); px = start.x; py = start.y; }
      showing = true; preview.classList.add("on");
    }
    function pointer(event: PointerEvent) {
      mx = event.clientX;
      if (!(event.target as Element).closest("#recipe-index")) hidePreview();
    }
    function scroll() { if (!enabled) solidHeader(); }
    configure();
    const resize = new ResizeObserver(measure); if (hero) resize.observe(hero);
    media.addEventListener("change", configure); window.addEventListener("resize", measure);
    window.addEventListener("scroll", scroll, { passive: true }); window.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("pointerover", enter);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); media.removeEventListener("change", configure); window.removeEventListener("resize", measure); window.removeEventListener("scroll", scroll); window.removeEventListener("pointermove", pointer); document.removeEventListener("pointerover", enter); };
  }, [pathname]);
  return null;
}
