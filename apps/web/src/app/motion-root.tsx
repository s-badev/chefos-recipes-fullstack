"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PREVIEW_TILT, previewTarget, safePreviewStep, type PreviewRow } from "../lib/preview";

declare global {
  interface Window {
    /** Set by MotionRoot once it owns the reveals; read by the boot script in layout.tsx. */
    __motionReady?: boolean;
    /** Set by the boot script when MotionRoot missed its deadline; motion stays off for this load. */
    __motionTimedOut?: boolean;
  }
}

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
    // Any page can declare a full-bleed hero with [data-hero]: the header stays transparent over it.
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const parallax = document.querySelector<HTMLElement>("[data-par]");
    const parallaxFactor = Number(parallax?.dataset.par) || .18;
    // Recipe page: a thin line beside the steps fills with the scroll (transform only).
    const progress = document.querySelector<HTMLElement>(".prog i");
    const stepsList = document.querySelector<HTMLElement>(".st-list");
    const preview = document.querySelector<HTMLElement>("#recipe-preview");
    const motionAllowed = () => !media.matches && !window.__motionTimedOut;
    let enabled = motionAllowed(), frame = 0, heroHeight = 0, stepsTop = 0, stepsHeight = 0;
    let viewportWidth = 0, viewportHeight = 0;
    let mx = 0, px = 0, py = 0, showing = false, lastScroll = -1;
    let activeRow: HTMLElement | null = null;
    let rowDocumentBounds: PreviewRow | null = null;
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
      if (stepsList) {
        const rect = stepsList.getBoundingClientRect();
        stepsTop = rect.top + window.scrollY; stepsHeight = rect.height;
      }
      viewportWidth = document.documentElement.clientWidth;
      viewportHeight = document.documentElement.clientHeight;
      if (activeRow) cacheRow(activeRow);
      lastScroll = -1;
    }
    function solidHeader() { header?.classList.toggle("solid", !hero || window.scrollY > heroHeight - 72); }
    function cacheRow(row: HTMLElement) {
      const rect = row.getBoundingClientRect();
      rowDocumentBounds = { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY };
    }
    function viewportRow() {
      return { top: rowDocumentBounds!.top - window.scrollY, bottom: rowDocumentBounds!.bottom - window.scrollY };
    }
    function tick() {
      const y = window.scrollY;
      if (y !== lastScroll) {
        solidHeader();
        if (parallax) parallax.style.transform = `translate3d(0,${(y * parallaxFactor).toFixed(1)}px,0)`;
        if (progress && stepsHeight) {
          const filled = Math.max(0, Math.min(1, (y + viewportHeight * .6 - stepsTop) / stepsHeight));
          progress.style.transform = `scaleY(${filled.toFixed(3)})`;
        }
        lastScroll = y;
      }
      if (showing && preview && activeRow) {
        const row = viewportRow();
        const target = previewTarget(row, mx, viewportWidth, viewportHeight);
        if (target) {
          const dx = target.x - px;
          const safe = safePreviewStep({ x: px + dx * .14, y: py + (target.y - py) * .14 }, target, row, viewportWidth, viewportHeight);
          px = safe.x; py = safe.y;
          preview.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) rotate(${Math.max(-PREVIEW_TILT, Math.min(PREVIEW_TILT, dx * .14 * .25)).toFixed(2)}deg)`;
        } else hidePreview();
      }
      frame = requestAnimationFrame(tick);
    }
    function hidePreview() {
      showing = false; activeRow = null; rowDocumentBounds = null;
      preview?.classList.remove("on");
      if (media.matches || !hover.matches) preview?.style.removeProperty("transform");
    }
    function configure() {
      enabled = motionAllowed(); root.dataset.motion = enabled ? "on" : "off";
      hidePreview();
      cancelAnimationFrame(frame); observer.disconnect(); measure(); solidHeader();
      if (enabled) { targets.forEach(target => observer.observe(target)); frame = requestAnimationFrame(tick); }
      else { targets.forEach(target => target.classList.add("in")); parallax?.style.removeProperty("transform"); progress?.style.removeProperty("transform"); hidePreview(); }
    }
    function enter(event: PointerEvent) {
      const row = (event.target as Element).closest<HTMLElement>(".row[data-preview]");
      if (!row || !enabled || !hover.matches || !preview) return;
      mx = event.clientX;
      if (activeRow === row) return;
      preview.querySelectorAll<HTMLElement>("[data-preview-image]").forEach(image => { image.hidden = image.dataset.previewImage !== row.dataset.preview; });
      activeRow = row;
      cacheRow(row);
      const bounds = viewportRow();
      const target = previewTarget(bounds, mx, viewportWidth, viewportHeight);
      if (!target) { hidePreview(); return; }
      const start = showing ? safePreviewStep({ x: px, y: py }, target, bounds, viewportWidth, viewportHeight) : target;
      px = start.x; py = start.y;
      preview.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
      showing = true; preview.classList.add("on");
    }
    function pointer(event: PointerEvent) {
      mx = event.clientX;
      if (!(event.target as Element).closest("#recipe-index")) hidePreview();
    }
    function scroll() { if (!enabled) solidHeader(); }
    configure();
    const resize = new ResizeObserver(measure); if (hero) resize.observe(hero); if (stepsList) resize.observe(stepsList);
    media.addEventListener("change", configure); hover.addEventListener("change", configure); window.addEventListener("resize", measure);
    window.addEventListener("scroll", scroll, { passive: true }); window.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("pointerover", enter);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); media.removeEventListener("change", configure); hover.removeEventListener("change", configure); window.removeEventListener("resize", measure); window.removeEventListener("scroll", scroll); window.removeEventListener("pointermove", pointer); document.removeEventListener("pointerover", enter); };
  }, [pathname]);
  return null;
}
